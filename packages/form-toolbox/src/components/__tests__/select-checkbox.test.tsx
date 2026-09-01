import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {makeReferenceList} from "@focus4/stores";

import {setupComponentTest} from "../../__tests__/test-utils";
import {SelectCheckbox} from "../select-checkbox";

const selectCheckboxTheme = {
    select: "select-root",
    option: "select-option",
    field: "supporting-field"
};

function refs() {
    return makeReferenceList([
        {code: "A", label: "ref.a"},
        {code: "B", label: "ref.b"},
        {code: "C", label: "ref.c"}
    ]);
}

describe("SelectCheckbox component", () => {
    setupComponentTest({
        "ref.a": "Alpha",
        "ref.b": "Beta",
        "ref.c": "Charlie"
    });

    test("Rend une checkbox par valeur de la liste", () => {
        render(
            <SelectCheckbox
                id="sel"
                name="sel"
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                values={refs()}
            />
        );

        expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    });

    test("Coche les checkboxes correspondant à value", () => {
        render(
            <SelectCheckbox
                id="sel"
                name="sel"
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                value={["A", "C"]}
                values={refs()}
            />
        );

        const checked = (screen.getAllByRole("checkbox") as HTMLInputElement[]).filter(c => c.checked);
        expect(checked).toHaveLength(2);
    });

    test("Ajoute une valeur à la sélection au clic", () => {
        const onChange = vi.fn();
        render(
            <SelectCheckbox
                id="sel"
                name="sel"
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                value={["A"]}
                values={refs()}
            />
        );

        fireEvent.click(screen.getByText("Beta"));

        expect(onChange).toHaveBeenCalledWith(["A", "B"]);
    });

    test("Retire une valeur de la sélection au clic sur un item déjà coché", () => {
        const onChange = vi.fn();
        render(
            <SelectCheckbox
                id="sel"
                name="sel"
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                value={["A", "B"]}
                values={refs()}
            />
        );

        fireEvent.click(screen.getByText("Alpha"));

        expect(onChange).toHaveBeenCalledWith(["B"]);
    });

    test("Désactive toutes les checkboxes quand disabled=true", () => {
        render(
            <SelectCheckbox
                disabled
                id="sel"
                name="sel"
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                values={refs()}
            />
        );

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        expect(checkboxes.every(c => c.disabled)).toBe(true);
    });

    test("Désactive uniquement les options listées dans disabled=array", () => {
        render(
            <SelectCheckbox
                disabled={["A", "C"]}
                id="sel"
                name="sel"
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                values={refs()}
            />
        );

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        expect(checkboxes[0].disabled).toBe(true);
        expect(checkboxes[1].disabled).toBe(false);
        expect(checkboxes[2].disabled).toBe(true);
    });

    test("Empêche la sélection d'une nouvelle valeur quand maxSelectable est atteint", () => {
        const onChange = vi.fn();
        render(
            <SelectCheckbox
                id="sel"
                maxSelectable={2}
                name="sel"
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                value={["A", "B"]}
                values={refs()}
            />
        );

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        expect(checkboxes[2].disabled).toBe(true);
    });

    test("Autorise toujours la déselection quand maxSelectable est atteint", () => {
        const onChange = vi.fn();
        render(
            <SelectCheckbox
                id="sel"
                maxSelectable={2}
                name="sel"
                onChange={onChange}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                value={["A", "B"]}
                values={refs()}
            />
        );

        fireEvent.click(screen.getByText("Alpha"));

        expect(onChange).toHaveBeenCalledWith(["B"]);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <SelectCheckbox
                error="Champ requis"
                id="sel"
                name="sel"
                onChange={() => undefined}
                schema={z.array(z.string())}
                theme={selectCheckboxTheme}
                values={refs()}
            />
        );

        expect(screen.getByText("Champ requis").textContent).toBe("Champ requis");
    });
});
