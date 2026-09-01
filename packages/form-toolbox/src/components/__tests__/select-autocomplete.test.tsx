import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {makeReferenceList} from "@focus4/stores";

import {setupComponentTest} from "../../__tests__/test-utils";
import {SelectAutocomplete} from "../select-autocomplete";

function refValues() {
    return makeReferenceList([
        {code: "A", label: "Alpha"},
        {code: "B", label: "Beta"},
        {code: "C", label: "Charlie"}
    ]);
}

const acTheme = {supportingText: "st"};

describe("SelectAutocomplete component", () => {
    setupComponentTest({"focus.select.unselected": "—"});

    test("Affiche la valeur initiale en tant que texte de l'input", () => {
        render(
            <SelectAutocomplete
                onChange={() => undefined}
                schema={z.string()}
                theme={acTheme}
                value="B"
                values={refValues()}
            />
        );

        expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Beta");
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <SelectAutocomplete
                error="Requis"
                onChange={() => undefined}
                schema={z.string()}
                theme={acTheme}
                values={refValues()}
            />
        );

        expect(screen.getByText("Requis").textContent).toBe("Requis");
    });

    test("hasUndefined=true ajoute l'option de désélection", () => {
        render(
            <SelectAutocomplete onChange={() => undefined} schema={z.string()} theme={acTheme} values={refValues()} />
        );

        fireEvent.focus(screen.getByRole("combobox"));
        expect(screen.getByRole("option", {name: "—"})).toBeInstanceOf(HTMLElement);
    });

    test("hasUndefined=false n'ajoute pas l'option de désélection", () => {
        render(
            <SelectAutocomplete
                hasUndefined={false}
                onChange={() => undefined}
                schema={z.string()}
                theme={acTheme}
                values={refValues()}
            />
        );

        fireEvent.focus(screen.getByRole("combobox"));
        expect(screen.queryByRole("option", {name: "—"})).toBeNull();
    });

    test("Appelle onChange avec la clé de l'option cliquée", () => {
        const onChange = vi.fn();
        render(<SelectAutocomplete onChange={onChange} schema={z.string()} theme={acTheme} values={refValues()} />);

        fireEvent.focus(screen.getByRole("combobox"));
        fireEvent.click(screen.getByRole("option", {name: "Charlie"}));

        expect(onChange).toHaveBeenCalledWith("C");
    });

    test("Appelle onChange avec undefined quand on clique sur l'option de désélection", () => {
        const onChange = vi.fn();
        render(<SelectAutocomplete onChange={onChange} schema={z.string()} theme={acTheme} values={refValues()} />);

        fireEvent.focus(screen.getByRole("combobox"));
        fireEvent.click(screen.getByRole("option", {name: "—"}));

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test("Désactive l'input quand disabled=true", () => {
        render(
            <SelectAutocomplete
                disabled
                onChange={() => undefined}
                schema={z.string()}
                theme={acTheme}
                values={refValues()}
            />
        );

        expect((screen.getByRole("combobox") as HTMLInputElement).disabled).toBe(true);
    });

    test("disabled=true empêche l'ouverture et donc l'appel de onChange", () => {
        const onChange = vi.fn();
        render(
            <SelectAutocomplete disabled onChange={onChange} schema={z.string()} theme={acTheme} values={refValues()} />
        );

        fireEvent.click(screen.getByRole("combobox"));

        expect(onChange).not.toHaveBeenCalled();
    });
});
