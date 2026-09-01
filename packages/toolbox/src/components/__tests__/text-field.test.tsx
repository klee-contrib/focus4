import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {renderWithTheme, setupComponentTest} from "../../__tests__/test-utils";
import {TextField} from "../text-field";

const textFieldTheme = {
    field: "tf-field",
    icon: "tf-icon",
    input: "tf-input",
    inputContainer: "tf-inputContainer",
    label: "tf-label",
    outline: "tf-outline",
    prefix: "tf-prefix",
    progress: "tf-progress",
    suffix: "tf-suffix",
    supportingText: "tf-supportingText",
    textField: "tf",
    tooltip: "tf-tooltip",
    trailingButton: "tf-trailingButton"
};

describe("TextField component", () => {
    setupComponentTest();

    test("Rend un <input type='text'> par défaut", () => {
        const {container} = render(<TextField onChange={() => undefined} theme={textFieldTheme} value="" />);

        const input = container.querySelector("input")!;
        expect(input.type).toBe("text");
    });

    test("Rend un <textarea> quand multiline=true", () => {
        const {container} = render(<TextField multiline onChange={() => undefined} theme={textFieldTheme} value="" />);

        expect(container.querySelector("textarea")).not.toBeNull();
        expect(container.querySelector("input")).toBeNull();
    });

    test("Affiche la valeur passée en prop", () => {
        const {container} = render(<TextField onChange={() => undefined} theme={textFieldTheme} value="hello" />);

        expect(container.querySelector("input")!.value).toBe("hello");
    });

    test("Appelle onChange avec la nouvelle valeur à la saisie", () => {
        const onChange = vi.fn();
        const {container} = render(<TextField onChange={onChange} theme={textFieldTheme} value="" />);

        fireEvent.change(container.querySelector("input")!, {target: {value: "abc"}});
        expect(onChange).toHaveBeenCalledWith("abc", expect.any(Object));
    });

    test("Rend l'input désactivé quand disabled=true", () => {
        const {container} = render(<TextField disabled onChange={() => undefined} theme={textFieldTheme} value="" />);

        expect(container.querySelector("input")!.disabled).toBe(true);
    });

    test("Affiche le texte d'erreur en supportingText", () => {
        render(
            <TextField
                error
                onChange={() => undefined}
                supportingText="Format invalide"
                theme={textFieldTheme}
                value=""
            />
        );

        expect(screen.getByText("Format invalide").textContent).toBe("Format invalide");
    });

    test("Affiche le label", () => {
        render(<TextField label="Nom" onChange={() => undefined} theme={textFieldTheme} value="" />);

        expect(screen.getByText("Nom").textContent).toBe("Nom");
    });

    test("Affiche le compteur de caractères quand maxLength est renseigné", () => {
        render(<TextField maxLength={10} onChange={() => undefined} theme={textFieldTheme} value="abc" />);

        expect(screen.getByText("3/10").textContent).toBe("3/10");
    });

    test("Rend readonly sans <input> quand readonly=true", () => {
        const {container} = render(<TextField onChange={() => undefined} readonly theme={textFieldTheme} value="ro" />);

        expect(container.querySelector("input")).toBeNull();
        expect(container.textContent).toBe("ro");
    });

    test("Rend une icône trailing cliquable et déclenche son onClick", () => {
        const onTrailingClick = vi.fn();
        renderWithTheme(
            <TextField
                onChange={() => undefined}
                theme={textFieldTheme}
                trailing={{icon: "clear", onClick: onTrailingClick}}
                value="foo"
            />
        );

        const trailingBtn = screen.getByRole("button");
        fireEvent.click(trailingBtn);
        expect(onTrailingClick).toHaveBeenCalledTimes(1);
    });

    test("Propage type au <input>", () => {
        render(<TextField onChange={() => undefined} theme={textFieldTheme} type="email" value="" />);

        expect(screen.getByRole<HTMLInputElement>("textbox").type).toBe("email");
    });
});
