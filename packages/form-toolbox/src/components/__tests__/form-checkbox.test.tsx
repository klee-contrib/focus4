import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {FormCheckbox} from "../form-checkbox";

const checkboxTheme = {
    check: "checkbox-root",
    field: "supporting-field",
    checked: "checkbox-checked"
};

describe("FormCheckbox", () => {
    setupComponentTest();

    test("Rend un input de type checkbox", () => {
        render(<FormCheckbox onChange={() => undefined} theme={checkboxTheme} />);

        expect(screen.getByRole("checkbox")).toBeInstanceOf(HTMLInputElement);
    });

    test.each([
        {checked: true, value: true},
        {checked: false, value: undefined}
    ])("Expose checked=$checked pour value=$value", ({checked, value}) => {
        render(<FormCheckbox onChange={() => undefined} theme={checkboxTheme} value={value} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(checked);
    });

    test("onChange est appelé avec la nouvelle valeur au clic", () => {
        const onChange = vi.fn();
        render(<FormCheckbox onChange={onChange} theme={checkboxTheme} value={false} />);

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    test("La checkbox est désactivée quand disabled=true", () => {
        render(<FormCheckbox disabled onChange={() => undefined} theme={checkboxTheme} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(<FormCheckbox error="Champ requis" onChange={() => undefined} theme={checkboxTheme} />);

        expect(screen.getByText("Champ requis").textContent).toBe("Champ requis");
    });

    test("N'affiche pas de supportingText avec showSupportingText='never'", () => {
        render(
            <FormCheckbox
                error="Champ requis"
                onChange={() => undefined}
                showSupportingText="never"
                theme={checkboxTheme}
            />
        );

        expect(screen.queryByText("Champ requis")).toBeNull();
    });
});
