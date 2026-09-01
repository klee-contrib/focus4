import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {makeReferenceList} from "@focus4/stores";

import {setupComponentTest} from "../../__tests__/test-utils";
import {SelectRadio} from "../select-radio";

const selectRadioTheme = {
    select: "select-root",
    options: "select-options",
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

describe("SelectRadio component", () => {
    setupComponentTest({
        "ref.a": "Alpha",
        "ref.b": "Beta",
        "ref.c": "Charlie",
        "focus.select.none": "Aucun"
    });

    test("Rend un radio par valeur de la liste de référence", () => {
        render(<SelectRadio onChange={() => undefined} schema={z.string()} theme={selectRadioTheme} values={refs()} />);

        expect(screen.getAllByRole("radio").map(radio => radio.parentElement?.textContent)).toEqual([
            "Alpha",
            "Beta",
            "Charlie"
        ]);
    });

    test("Coche l'option correspondant à value", () => {
        render(
            <SelectRadio
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                value="B"
                values={refs()}
            />
        );

        expect(
            (screen.getAllByRole("radio") as HTMLInputElement[]).map(radio => ({
                label: radio.parentElement?.textContent,
                checked: radio.checked
            }))
        ).toEqual([
            {label: "Alpha", checked: false},
            {label: "Beta", checked: true},
            {label: "Charlie", checked: false}
        ]);
    });

    test("Appelle onChange avec la valeur sélectionnée", () => {
        const onChange = vi.fn();
        render(<SelectRadio onChange={onChange} schema={z.string()} theme={selectRadioTheme} values={refs()} />);

        fireEvent.click(screen.getByText("Beta"));

        expect(onChange).toHaveBeenCalledWith("B");
    });

    test.each([
        ["first-option", 0],
        ["last-option", 3]
    ] as const)("Place l'option 'Aucun' à la position %s", (hasUndefined, expectedIndex) => {
        render(
            <SelectRadio
                hasUndefined={hasUndefined}
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        const radios = screen.getAllByRole("radio");
        expect(radios).toHaveLength(4);
        expect(radios[expectedIndex].parentElement?.textContent).toBe("Aucun");
    });

    test("onChange reçoit undefined quand on clique sur l'option 'Aucun'", () => {
        const onChange = vi.fn();
        render(
            <SelectRadio
                hasUndefined="first-option"
                onChange={onChange}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        fireEvent.click(screen.getByText("Aucun"));

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test("Désactive tous les radios quand disabled=true", () => {
        render(
            <SelectRadio
                disabled
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        const radios = screen.getAllByRole("radio") as HTMLInputElement[];
        expect(radios.every(r => r.disabled)).toBe(true);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <SelectRadio
                error="Champ requis"
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        expect(screen.getByText("Champ requis").textContent).toBe("Champ requis");
    });
});
