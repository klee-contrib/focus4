import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {BooleanRadio} from "../boolean-radio";

const booleanRadioTheme = {
    boolean: "boolean-root",
    field: "supporting-field"
};

describe("BooleanRadio component", () => {
    setupComponentTest({
        "focus.bool.true": "Oui",
        "focus.bool.false": "Non",
        "custom.yes": "Vrai",
        "custom.no": "Faux"
    });

    test("Rend deux boutons radio avec les libellés par défaut", () => {
        render(<BooleanRadio name="b" onChange={() => undefined} theme={booleanRadioTheme} />);

        expect(screen.getAllByRole("radio").map(radio => radio.parentElement?.textContent)).toEqual(["Oui", "Non"]);
    });

    test.each([
        {value: true, expectedName: "b-yes"},
        {value: false, expectedName: "b-no"},
        {value: undefined, expectedName: null}
    ])("Coche le bon radio pour value=$value", ({value, expectedName}) => {
        render(<BooleanRadio name="b" onChange={() => undefined} theme={booleanRadioTheme} value={value} />);

        expect((screen.getAllByRole("radio") as HTMLInputElement[]).find(radio => radio.checked)?.name ?? null).toBe(
            expectedName
        );
    });

    test.each([
        ["Oui", true],
        ["Non", false]
    ] as const)("Un clic sur %s transmet %s", (label, value) => {
        const onChange = vi.fn();
        render(<BooleanRadio name="b" onChange={onChange} theme={booleanRadioTheme} />);

        fireEvent.click(screen.getByText(label));

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(value);
    });

    test("Utilise labelYes et labelNo personnalisés", () => {
        render(
            <BooleanRadio
                labelNo="custom.no"
                labelYes="custom.yes"
                name="b"
                onChange={() => undefined}
                theme={booleanRadioTheme}
            />
        );

        expect(screen.getAllByRole("radio").map(radio => radio.parentElement?.textContent)).toEqual(["Vrai", "Faux"]);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(<BooleanRadio error="Requis" name="b" onChange={() => undefined} theme={booleanRadioTheme} />);

        expect(screen.getByText("Requis").textContent).toBe("Requis");
    });

    test("Désactive les radios quand disabled=true", () => {
        render(<BooleanRadio disabled name="b" onChange={() => undefined} theme={booleanRadioTheme} />);

        const radios = screen.getAllByRole("radio") as HTMLInputElement[];
        expect(radios.every(r => r.disabled)).toBe(true);
    });

    test("allowUndefined permet de repasser à undefined en cliquant sur la valeur déjà cochée", () => {
        const onChange = vi.fn();
        const initialValue = true;
        render(
            <BooleanRadio allowUndefined name="b" onChange={onChange} theme={booleanRadioTheme} value={initialValue} />
        );

        fireEvent.click(screen.getByText("Oui"));

        expect(onChange).toHaveBeenCalledWith(undefined);
    });
});
