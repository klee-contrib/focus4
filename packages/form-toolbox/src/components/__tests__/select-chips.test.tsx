import {fireEvent, render, screen, within} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {makeReferenceList} from "@focus4/stores";

import {setupComponentTest} from "../../__tests__/test-utils";
import {SelectChips} from "../select-chips";

const selectChipsTheme = {
    select: "select-root",
    chips: "select-chips",
    chip: "select-chip",
    line: "select-line",
    field: "supporting-field"
};

function refs() {
    return makeReferenceList([
        {code: "A", label: "ref.a"},
        {code: "B", label: "ref.b"},
        {code: "C", label: "ref.c"}
    ]);
}

describe("SelectChips component", () => {
    setupComponentTest({
        "ref.a": "Alpha",
        "ref.b": "Beta",
        "ref.c": "Charlie"
    });

    test("Ne rend aucun chip quand value est vide", () => {
        const {container} = render(
            <SelectChips
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                values={refs()}
            />
        );

        expect(container.querySelector(".select-chips")).toBeNull();
    });

    test("Rend un chip par valeur sélectionnée", () => {
        const {container} = render(
            <SelectChips
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                value={["A", "B"]}
                values={refs()}
            />
        );

        expect(container.querySelectorAll(".select-chip")).toHaveLength(2);
    });

    test("Retire une valeur en cliquant sur le X d'un chip", () => {
        const onChange = vi.fn();
        const {container} = render(
            <SelectChips
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                value={["A", "B"]}
                values={refs()}
            />
        );

        const chips = container.querySelectorAll(".select-chip");
        const deleteButton = within(chips[0] as HTMLElement).getByRole("button");
        fireEvent.click(deleteButton);

        expect(onChange).toHaveBeenCalledWith(["B"]);
    });

    test("undeletable empêche l'ajout du bouton de suppression sur les items filtrés", () => {
        const onChange = vi.fn();
        const {container} = render(
            <SelectChips
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                undeletable={v => v === "A"}
                value={["A", "B"]}
                values={refs()}
            />
        );

        const chips = container.querySelectorAll(".select-chip");
        expect(within(chips[0] as HTMLElement).queryByRole("button")).toBeNull();
    });

    test("hasSelectAll affiche une action de sélection globale", () => {
        const {container} = render(
            <SelectChips
                hasSelectAll
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                values={refs()}
            />
        );

        expect(container.querySelector("[aria-label*='select']")).not.toBeNull();
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <SelectChips
                error="Requis"
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                values={refs()}
            />
        );

        expect(screen.getByText("Requis").textContent).toBe("Requis");
    });

    test("Désactive les chips quand disabled=true", () => {
        const {container} = render(
            <SelectChips
                disabled
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                value={["A"]}
                values={refs()}
            />
        );

        const chip = container.querySelector(".select-chip") as HTMLElement;
        expect((within(chip).getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    });

    test("En mode autocomplete, rend un input de recherche à la place du dropdown standard", () => {
        render(
            <SelectChips
                autocomplete
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                values={refs()}
            />
        );

        expect(screen.getByRole("combobox")).toBeInstanceOf(HTMLInputElement);
    });

    test("keepSelectedValuesInSelect maintient toutes les options dans la liste", () => {
        const {container} = render(
            <SelectChips
                keepSelectedValuesInSelect
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                value={["A"]}
                values={refs()}
            />
        );

        expect(container.querySelectorAll(".select-line").length).toBeGreaterThan(0);
    });

    test("unselectable retire des options des valeurs sélectionnables", () => {
        render(
            <SelectChips
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                unselectable={v => v.code === "B"}
                values={refs()}
            />
        );

        expect(screen.queryByRole("option", {name: "Beta"})).toBeNull();
        expect(screen.getByRole("option", {name: "Alpha"})).toBeInstanceOf(HTMLElement);
        expect(screen.getByRole("option", {name: "Charlie"})).toBeInstanceOf(HTMLElement);
    });

    test("maxSelectable=1 ignore l'ajout d'une nouvelle valeur", () => {
        const onChange = vi.fn();
        render(
            <SelectChips
                maxSelectable={1}
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                value={["A"]}
                values={refs()}
            />
        );

        // Cliquer sur une option non sélectionnée ne doit pas déclencher onChange (limite atteinte).
        fireEvent.click(screen.getByRole("option", {name: "Beta"}));
        expect(onChange).not.toHaveBeenCalled();
    });

    test("trailing accepte un objet unique", () => {
        const onClick = vi.fn();
        const {container} = render(
            <SelectChips
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                trailing={{icon: {i18nKey: "focus.icons.select.trailing"}, onClick}}
                values={refs()}
            />
        );

        const buttons = container.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThanOrEqual(1);
        fireEvent.click(buttons.item(buttons.length - 1));
        expect(onClick).toHaveBeenCalled();
    });

    test("trailing accepte un tableau", () => {
        const onClickA = vi.fn();
        const onClickB = vi.fn();
        const {container} = render(
            <SelectChips
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectChipsTheme}
                trailing={[
                    {icon: {i18nKey: "focus.icons.select.a"}, onClick: onClickA},
                    {icon: {i18nKey: "focus.icons.select.b"}, onClick: onClickB}
                ]}
                values={refs()}
            />
        );

        const trailingButtons = [...container.querySelectorAll("button")].filter(b => !b.closest(".select-chip"));
        expect(trailingButtons.length).toBeGreaterThanOrEqual(2);
        // Les deux derniers boutons sont les trailings custom.
        fireEvent.click(trailingButtons.at(-2)!);
        fireEvent.click(trailingButtons.at(-1)!);
        expect(onClickA).toHaveBeenCalled();
        expect(onClickB).toHaveBeenCalled();
    });
});
