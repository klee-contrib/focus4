import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {FormCheckbox} from "../form-checkbox";

const checkboxTheme = {
    check: "checkbox-root",
    field: "supporting-field",
    checked: "checkbox-checked"
};

describe("FormCheckbox component", () => {
    setupComponentTest();

    test("Rend un input de type checkbox", () => {
        render(<FormCheckbox onChange={() => undefined} theme={checkboxTheme} />);

        expect(screen.getByRole("checkbox")).toBeTruthy();
    });

    test("La checkbox est cochée quand value=true", () => {
        render(<FormCheckbox onChange={() => undefined} theme={checkboxTheme} value />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    });

    test("La checkbox est décochée quand value est undefined", () => {
        render(<FormCheckbox onChange={() => undefined} theme={checkboxTheme} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    });

    test("onChange est appelé avec la nouvelle valeur au clic", () => {
        const onChange = vi.fn();
        render(<FormCheckbox onChange={onChange} theme={checkboxTheme} value={false} />);

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onChange).toHaveBeenCalled();
        expect(onChange.mock.calls[0][0]).toBe(true);
    });

    test("La checkbox est désactivée quand disabled=true", () => {
        render(<FormCheckbox disabled onChange={() => undefined} theme={checkboxTheme} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
    });

    test("Affiche l'erreur en supportingText", () => {
        const {container} = render(
            <FormCheckbox error="Champ requis" onChange={() => undefined} theme={checkboxTheme} />
        );

        expect(container.textContent).toContain("Champ requis");
    });

    test("N'affiche pas de supportingText avec showSupportingText='never'", () => {
        const {container} = render(
            <FormCheckbox
                error="Champ requis"
                onChange={() => undefined}
                showSupportingText="never"
                theme={checkboxTheme}
            />
        );

        expect(container.textContent).not.toContain("Champ requis");
    });
});
