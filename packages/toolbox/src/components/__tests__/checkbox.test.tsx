import {fireEvent, render} from "@testing-library/react";
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
        const {container} = render(<Checkbox onChange={() => undefined} theme={checkboxTheme} value />);

        expect(container.querySelector("input")?.checked).toBe(true);
    });

    test("Affiche le libellé quand label est renseigné", () => {
        const {container} = render(
            <Checkbox label="Accepter les CGU" onChange={() => undefined} theme={checkboxTheme} value={false} />
        );

        expect(container.textContent).toContain("Accepter les CGU");
    });

    test("Appelle onChange avec la valeur inverse au clic", () => {
        const onChange = vi.fn();
        const {container} = render(<Checkbox onChange={onChange} theme={checkboxTheme} value={false} />);

        fireEvent.click(container.querySelector("input")!);
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    test("Passe de true à false au clic", () => {
        const onChange = vi.fn();
        const {container} = render(<Checkbox onChange={onChange} theme={checkboxTheme} value />);

        fireEvent.click(container.querySelector("input")!);
        expect(onChange).toHaveBeenCalledWith(false, expect.any(Object));
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

        expect(container.textContent).toContain("remove");
    });

    test("Rend l'icône 'check' quand indeterminate=false", () => {
        const {container} = render(<Checkbox onChange={() => undefined} theme={checkboxTheme} value />);

        expect(container.textContent).toContain("check");
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
