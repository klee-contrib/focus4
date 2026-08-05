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

        expect(screen.getAllByRole("radio")).toHaveLength(3);
        expect(screen.getByText("Alpha")).toBeTruthy();
        expect(screen.getByText("Beta")).toBeTruthy();
        expect(screen.getByText("Charlie")).toBeTruthy();
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

        const radios = screen.getAllByRole("radio") as HTMLInputElement[];
        expect(radios.filter(r => r.checked)).toHaveLength(1);
    });

    test("Appelle onChange avec la valeur sélectionnée", () => {
        const onChange = vi.fn();
        render(<SelectRadio onChange={onChange} schema={z.string()} theme={selectRadioTheme} values={refs()} />);

        fireEvent.click(screen.getByText("Beta"));

        expect(onChange).toHaveBeenCalledWith("B");
    });

    test("Ajoute une option 'Aucun' en début de liste avec hasUndefined='first-option'", () => {
        render(
            <SelectRadio
                hasUndefined="first-option"
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        expect(screen.getAllByRole("radio")).toHaveLength(4);
        expect(screen.getByText("Aucun")).toBeTruthy();
    });

    test("Ajoute une option 'Aucun' en fin de liste avec hasUndefined='last-option'", () => {
        const {container} = render(
            <SelectRadio
                hasUndefined="last-option"
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        const labels = [...container.querySelectorAll("label")].map(l => l.textContent);
        expect(labels.at(-1)).toContain("Aucun");
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
        const {container} = render(
            <SelectRadio
                error="Champ requis"
                onChange={() => undefined}
                schema={z.string()}
                theme={selectRadioTheme}
                values={refs()}
            />
        );

        expect(container.textContent).toContain("Champ requis");
    });
});
