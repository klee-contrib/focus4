import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Checkbox} from "../checkbox";

const checkboxTheme = {
    check: "cb-check",
    checkbox: "cb",
    input: "cb-input",
    label: "cb-label",
    outline: "cb-outline",
    state: "cb-state"
};

describe("Checkbox component", () => {
    setupComponentTest();

    test("Rend un input[type=checkbox] non coché quand value=false", () => {
        const {container} = render(<Checkbox onChange={() => undefined} theme={checkboxTheme} value={false} />);

        const input = container.querySelector("input")!;
        expect(input.type).toBe("checkbox");
        expect(input.checked).toBe(false);
    });

    test("Rend une checkbox cochée quand value=true", () => {
        render(<Checkbox onChange={() => undefined} theme={checkboxTheme} value />);

        expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    });

    test("Affiche le libellé quand label est renseigné", () => {
        render(<Checkbox label="Accepter les CGU" onChange={() => undefined} theme={checkboxTheme} value={false} />);

        expect(screen.getByText("Accepter les CGU").textContent).toBe("Accepter les CGU");
    });

    test.each([
        {expected: true, value: false},
        {expected: false, value: true}
    ])("Appelle onChange avec $expected au clic quand value=$value", ({expected, value}) => {
        const onChange = vi.fn();
        render(<Checkbox onChange={onChange} theme={checkboxTheme} value={value} />);

        fireEvent.click(screen.getByRole("checkbox"));
        expect(onChange).toHaveBeenCalledWith(expected, expect.any(Object));
    });

    test("N'appelle pas onChange quand disabled=true", () => {
        const onChange = vi.fn();
        const {container} = render(<Checkbox disabled onChange={onChange} theme={checkboxTheme} value={false} />);

        const input = container.querySelector("input")!;
        expect(input.disabled).toBe(true);
        fireEvent.click(input);
        expect(onChange).not.toHaveBeenCalled();
    });

    test("Rend l'icône 'remove' quand indeterminate=true", () => {
        const {container} = render(
            <Checkbox indeterminate onChange={() => undefined} theme={checkboxTheme} value={false} />
        );

        expect(container.querySelector("span")!.textContent).toBe("remove");
    });

    test("Rend l'icône 'check' quand indeterminate=false", () => {
        const {container} = render(<Checkbox onChange={() => undefined} theme={checkboxTheme} value />);

        expect(container.querySelector("span")!.textContent).toBe("check");
    });

    test("Propage l'id et name à l'input", () => {
        const {container} = render(
            <Checkbox id="cgu" name="cgu-input" onChange={() => undefined} theme={checkboxTheme} value={false} />
        );

        const input = container.querySelector("input")!;
        expect(input.id).toBe("cgu");
        expect(input.name).toBe("cgu-input");
    });
});
