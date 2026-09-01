import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Switch} from "../switch";

const switchTheme = {
    icon: "sw-icon",
    input: "sw-input",
    label: "sw-label",
    state: "sw-state",
    switch: "sw",
    thumb: "sw-thumb",
    track: "sw-track"
};

describe("Switch component", () => {
    setupComponentTest();

    test("Rend un input[type=checkbox] désactivé quand value=false", () => {
        const {container} = render(<Switch onChange={() => undefined} theme={switchTheme} value={false} />);

        const input = container.querySelector("input")!;
        expect(input.type).toBe("checkbox");
        expect(input.checked).toBe(false);
    });

    test("Rend un input coché quand value=true", () => {
        render(<Switch onChange={() => undefined} theme={switchTheme} value />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    });

    test("Appelle onChange avec la valeur inverse au clic", () => {
        const onChange = vi.fn();
        const {container} = render(<Switch onChange={onChange} theme={switchTheme} value={false} />);

        fireEvent.click(container.querySelector("input")!);
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    test("N'appelle pas onChange quand disabled=true", () => {
        const onChange = vi.fn();
        const {container} = render(<Switch disabled onChange={onChange} theme={switchTheme} value={false} />);

        fireEvent.click(container.querySelector("input")!);
        expect(onChange).not.toHaveBeenCalled();
    });

    test("Affiche le libellé quand label est renseigné", () => {
        render(<Switch label="Activer les notifications" onChange={() => undefined} theme={switchTheme} value />);

        const input = screen.getByRole("checkbox", {name: "Activer les notifications"}) as HTMLInputElement;
        expect(input.labels![0].textContent).toBe("Activer les notifications");
    });

    test.each([
        {expected: "check", iconOff: undefined, iconOn: "check", value: true},
        {expected: "close", iconOff: "close", iconOn: undefined, value: false}
    ])("Affiche l'icône $expected pour value=$value", ({expected, iconOff, iconOn, value}) => {
        const {container} = render(
            <Switch iconOff={iconOff} iconOn={iconOn} onChange={() => undefined} theme={switchTheme} value={value} />
        );

        expect(container.querySelector("span")!.textContent).toBe(expected);
    });
});
