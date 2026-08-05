import {fireEvent, render} from "@testing-library/react";
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
        const {container} = render(<Switch onChange={() => undefined} theme={switchTheme} value />);

        expect(container.querySelector("input")?.checked).toBe(true);
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
        const {container} = render(
            <Switch label="Activer les notifications" onChange={() => undefined} theme={switchTheme} value />
        );

        expect(container.textContent).toContain("Activer les notifications");
    });

    test("Affiche iconOn quand value=true", () => {
        const {container} = render(<Switch iconOn="check" onChange={() => undefined} theme={switchTheme} value />);

        expect(container.textContent).toContain("check");
    });

    test("Affiche iconOff quand value=false", () => {
        const {container} = render(
            <Switch iconOff="close" onChange={() => undefined} theme={switchTheme} value={false} />
        );

        expect(container.textContent).toContain("close");
    });
});
