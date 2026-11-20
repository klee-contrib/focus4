import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {FormSwitch} from "../form-switch";

const switchTheme = {
    switch: "switch-root",
    field: "supporting-field",
    checked: "switch-checked"
};

describe("FormSwitch", () => {
    setupComponentTest();

    test("Rend un input de type checkbox (rôle switch en HTML natif)", () => {
        render(<FormSwitch onChange={() => undefined} theme={switchTheme} />);

        expect(screen.getByRole("checkbox")).toBeInstanceOf(HTMLInputElement);
    });

    test.each([
        {checked: true, value: true},
        {checked: false, value: undefined}
    ])("Expose checked=$checked pour value=$value", ({checked, value}) => {
        render(<FormSwitch onChange={() => undefined} theme={switchTheme} value={value} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(checked);
    });

    test("onChange est appelé au clic", () => {
        const onChange = vi.fn();
        render(<FormSwitch onChange={onChange} theme={switchTheme} value={false} />);

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    test("Le switch est désactivé quand disabled=true", () => {
        render(<FormSwitch disabled onChange={() => undefined} theme={switchTheme} />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(<FormSwitch error="Requis" onChange={() => undefined} theme={switchTheme} />);

        expect(screen.getByText("Requis").textContent).toBe("Requis");
    });

    test("N'affiche pas de supportingText avec showSupportingText='never'", () => {
        render(<FormSwitch error="Requis" onChange={() => undefined} showSupportingText="never" theme={switchTheme} />);

        expect(screen.queryByText("Requis")).toBeNull();
    });
});
