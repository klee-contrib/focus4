import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {FormSwitch} from "../form-switch";

const switchTheme = {
    switch: "switch-root",
    field: "supporting-field",
    checked: "switch-checked"
};

describe("FormSwitch component", () => {
    setupComponentTest();

    test("Rend un input de type checkbox (rôle switch en HTML natif)", () => {
        render(<FormSwitch onChange={() => undefined} theme={switchTheme} />);

        expect(screen.getByRole("checkbox")).toBeTruthy();
    });

    test("Le switch est activé quand value=true", () => {
        render(<FormSwitch onChange={() => undefined} theme={switchTheme} value />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    });

    test("Le switch est désactivé quand value est undefined", () => {
        render(<FormSwitch onChange={() => undefined} theme={switchTheme} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    });

    test("onChange est appelé au clic", () => {
        const onChange = vi.fn();
        render(<FormSwitch onChange={onChange} theme={switchTheme} value={false} />);

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onChange).toHaveBeenCalled();
        expect(onChange.mock.calls[0][0]).toBe(true);
    });

    test("Le switch est désactivé quand disabled=true", () => {
        render(<FormSwitch disabled onChange={() => undefined} theme={switchTheme} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
    });

    test("Affiche l'erreur en supportingText", () => {
        const {container} = render(<FormSwitch error="Requis" onChange={() => undefined} theme={switchTheme} />);

        expect(container.textContent).toContain("Requis");
    });

    test("N'affiche pas de supportingText avec showSupportingText='never'", () => {
        const {container} = render(
            <FormSwitch error="Requis" onChange={() => undefined} showSupportingText="never" theme={switchTheme} />
        );

        expect(container.textContent).not.toContain("Requis");
    });
});
