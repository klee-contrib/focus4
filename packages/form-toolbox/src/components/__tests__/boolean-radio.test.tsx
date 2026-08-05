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

        expect(screen.getByText("Oui")).toBeTruthy();
        expect(screen.getByText("Non")).toBeTruthy();
    });

    test.each([
        {value: true, expectedName: "b-yes"},
        {value: false, expectedName: "b-no"},
        {value: undefined, expectedName: null}
    ])("Coche le bon radio pour value=$value", ({value, expectedName}) => {
        render(<BooleanRadio name="b" onChange={() => undefined} theme={booleanRadioTheme} value={value} />);

        const radios = screen.getAllByRole("radio") as HTMLInputElement[];
        const checked = radios.find(r => r.checked);
        expect(checked?.name ?? null).toBe(expectedName);
    });

    test("onChange reçoit true quand on clique sur Oui", () => {
        const onChange = vi.fn();
        render(<BooleanRadio name="b" onChange={onChange} theme={booleanRadioTheme} />);

        fireEvent.click(screen.getByText("Oui"));

        expect(onChange).toHaveBeenCalledWith(true);
    });

    test("onChange reçoit false quand on clique sur Non", () => {
        const onChange = vi.fn();
        render(<BooleanRadio name="b" onChange={onChange} theme={booleanRadioTheme} />);

        fireEvent.click(screen.getByText("Non"));

        expect(onChange).toHaveBeenCalledWith(false);
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

        expect(screen.getByText("Vrai")).toBeTruthy();
        expect(screen.getByText("Faux")).toBeTruthy();
    });

    test("Affiche l'erreur en supportingText", () => {
        const {container} = render(
            <BooleanRadio error="Requis" name="b" onChange={() => undefined} theme={booleanRadioTheme} />
        );

        expect(container.textContent).toContain("Requis");
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
