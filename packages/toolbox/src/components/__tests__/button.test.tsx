import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Button} from "../button";

const buttonTheme = {
    button: "btn",
    icon: "btn-icon",
    label: "btn-label",
    spinner: "btn-spinner"
};

describe("Button component", () => {
    setupComponentTest();

    test("Rend un <button> par défaut avec le libellé passé en prop", () => {
        render(<Button label="Valider" theme={buttonTheme} />);

        const button = screen.getByRole("button", {name: "Valider"});
        expect(button.tagName).toBe("BUTTON");
        expect(button).toMatchObject({type: "button"});
    });

    test("Rend un <a> quand href est renseigné", () => {
        render(<Button href="/target" label="Lien" target="_blank" theme={buttonTheme} />);

        expect(screen.getByRole("link", {name: "Lien"})).toMatchObject({
            pathname: "/target",
            target: "_blank",
            type: ""
        });
    });

    test("Déclenche onClick au clic", () => {
        const onClick = vi.fn();
        render(<Button label="Cliquer" onClick={onClick} theme={buttonTheme} />);

        fireEvent.click(screen.getByRole("button", {name: "Cliquer"}));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("N'appelle pas onClick quand disabled=true", () => {
        const onClick = vi.fn();
        render(<Button disabled label="Bloqué" onClick={onClick} theme={buttonTheme} />);

        const button = screen.getByRole("button", {name: "Bloqué"});
        expect(button.hasAttribute("disabled")).toBe(true);
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    test("Rend une icône quand icon est renseigné", () => {
        const {container} = render(<Button icon="save" label="Enregistrer" theme={buttonTheme} />);

        expect([...container.querySelectorAll(".btn-icon")].map(icon => icon.textContent)).toEqual(["save"]);
        expect(screen.getByRole("button").textContent).toBe("saveEnregistrer");
    });

    test("Rend un espace insécable par défaut si label est absent", () => {
        const {container} = render(<Button theme={buttonTheme} />);

        // Le composant met toujours un <span> de label contenant \u00A0.
        const labelSpan = container.querySelector("button span:last-child");
        expect(labelSpan?.textContent).toBe("\u00A0");
    });

    test("Propage type au <button>", () => {
        render(<Button label="Submit" theme={buttonTheme} type="submit" />);

        expect(screen.getByRole("button", {name: "Submit"})).toMatchObject({type: "submit"});
    });
});
