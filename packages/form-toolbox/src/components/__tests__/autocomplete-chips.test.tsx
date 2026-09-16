import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {setupComponentTest} from "../../__tests__/test-utils";
import {AutocompleteChips} from "../autocomplete-chips";

const acChipsTheme = {
    select: "select-root",
    chips: "select-chips",
    chip: "select-chip",
    line: "select-line",
    field: "supporting-field"
};

describe("AutocompleteChips component", () => {
    setupComponentTest();

    test("Ne rend aucun chip quand value est vide", () => {
        const {container} = render(
            <AutocompleteChips
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
            />
        );

        expect(container.querySelector(".select-chips")).toBeNull();
    });

    test("Rend un chip par valeur sélectionnée", () => {
        const {container} = render(
            <AutocompleteChips
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                value={["A", "B", "C"]}
            />
        );

        expect(container.querySelectorAll(".select-chip")).toHaveLength(3);
    });

    test("Cliquer sur le bouton de suppression d'un chip retire la valeur correspondante", () => {
        const onChange = vi.fn();
        const {container} = render(
            <AutocompleteChips
                onChange={onChange}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                value={["A", "B", "C"]}
            />
        );

        const chips = container.querySelectorAll(".select-chip");
        const deleteButton = within(chips[1] as HTMLElement).getByRole("button");

        fireEvent.click(deleteButton);

        expect(onChange).toHaveBeenCalledWith(["A", "C"]);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <AutocompleteChips
                error="Requis"
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
            />
        );

        expect(screen.getByText("Requis").textContent).toBe("Requis");
    });

    test("undeletable empêche l'ajout du bouton de suppression sur les items filtrés", () => {
        const {container} = render(
            <AutocompleteChips
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                undeletable={v => v === "A"}
                value={["A", "B"]}
            />
        );

        const chips = container.querySelectorAll(".select-chip");
        expect(within(chips[0] as HTMLElement).queryByRole("button")).toBeNull();
        expect(within(chips[1] as HTMLElement).getByRole("button")).toBeInstanceOf(HTMLButtonElement);
    });

    test("Le bouton unselectAll vide toutes les valeurs sélectionnées", () => {
        const onChange = vi.fn();
        const {container} = render(
            <AutocompleteChips
                onChange={onChange}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                value={["A", "B"]}
            />
        );

        const trailingButtons = container.querySelectorAll("button");
        // Le premier bouton non associé à un chip est celui de trailings (unselectAll).
        const unselectAll = [...trailingButtons].find(b => !b.closest(".select-chip"));
        expect(unselectAll).toBeInstanceOf(HTMLButtonElement);

        fireEvent.click(unselectAll as HTMLButtonElement);

        expect(onChange).toHaveBeenCalledWith([]);
    });

    test("Désactive le bouton de suppression des chips quand disabled=true", () => {
        const {container} = render(
            <AutocompleteChips
                disabled
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                value={["A"]}
            />
        );

        const chip = container.querySelector(".select-chip") as HTMLElement;
        const deleteButton = within(chip).getByRole("button") as HTMLButtonElement;
        expect(deleteButton.disabled).toBe(true);
    });

    test("keyResolver alimente les libellés pour les valeurs initiales", async () => {
        const keyResolver = vi.fn(async (k: string) => `Label-${k}`);
        render(
            <AutocompleteChips
                keyResolver={keyResolver}
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                value={["A", "B"]}
            />
        );

        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(keyResolver).toHaveBeenCalledWith("A");
        expect(keyResolver).toHaveBeenCalledWith("B");
    });

    test("trailing accepte un objet unique en plus du bouton unselectAll", () => {
        const {container} = render(
            <AutocompleteChips
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                trailing={{icon: {i18nKey: "focus.icons.select.trailing"}, onClick: () => undefined}}
            />
        );

        // 2 boutons trailing : unselectAll + le custom trailing.
        expect(container.querySelectorAll("button")).toHaveLength(2);
    });

    test("trailing accepte un tableau", () => {
        const {container} = render(
            <AutocompleteChips
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.array(z.string())}
                theme={acChipsTheme}
                trailing={[
                    {icon: {i18nKey: "focus.icons.select.a"}, onClick: () => undefined},
                    {icon: {i18nKey: "focus.icons.select.b"}, onClick: () => undefined}
                ]}
            />
        );

        // 3 boutons trailing : unselectAll + les 2 customs.
        expect(container.querySelectorAll("button")).toHaveLength(3);
    });

    test("ajoute une suggestion trouvée par le service", async () => {
        const onChange = vi.fn();
        const querySearcher = vi.fn(async () => [{key: "A", label: "Alpha"}]);
        render(
            <AutocompleteChips
                onChange={onChange}
                querySearcher={querySearcher}
                schema={z.array(z.string())}
                searchDelay={0}
                theme={acChipsTheme}
            />
        );

        const input = screen.getByRole("combobox");
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: "al"}});
        await waitFor(() => expect(screen.getByRole("option", {name: "Alpha"})).toBeTruthy());
        fireEvent.click(screen.getByRole("option", {name: "Alpha"}));

        expect(querySearcher).toHaveBeenCalledWith("al", expect.any(Object));
        expect(onChange).toHaveBeenCalledWith(["A"]);
    });

    test("respecte maxSelectable et filtre les valeurs déjà sélectionnées", async () => {
        const onChange = vi.fn();
        const querySearcher = vi.fn(async () => [
            {key: "A", label: "Alpha"},
            {key: "B", label: "Beta"}
        ]);
        render(
            <AutocompleteChips
                maxSelectable={1}
                onChange={onChange}
                querySearcher={querySearcher}
                schema={z.array(z.string())}
                searchDelay={0}
                theme={acChipsTheme}
                value={["A"]}
            />
        );

        fireEvent.focus(screen.getByRole("combobox"));
        fireEvent.change(screen.getByRole("combobox"), {target: {value: "a"}});
        await waitFor(() => expect(querySearcher).toHaveBeenCalled());
        expect(screen.queryByRole("option", {name: "Alpha"})).toBeNull();
        expect(onChange).not.toHaveBeenCalled();
    });

    test("conserve les valeurs sélectionnées dans les suggestions quand demandé", async () => {
        const querySearcher = vi.fn(async () => [{key: "A", label: "Alpha"}]);
        render(
            <AutocompleteChips
                keepSelectedValuesInAutocomplete
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.array(z.string())}
                searchDelay={0}
                theme={acChipsTheme}
                value={["A"]}
            />
        );

        fireEvent.focus(screen.getByRole("combobox"));
        fireEvent.change(screen.getByRole("combobox"), {target: {value: "a"}});
        await waitFor(() => expect(screen.getByRole("option", {name: "Alpha"})).toBeTruthy());
        expect(screen.getByText("Alpha")).toBeTruthy();
    });
});
