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
        expect(button.getAttribute("type")).toBe("button");
    });

    test("Rend un <a> quand href est renseigné", () => {
        const {container} = render(<Button href="/target" label="Lien" target="_blank" theme={buttonTheme} />);

        const link = container.querySelector("a")!;
        expect(link).toBeTruthy();
        expect(link.getAttribute("href")).toBe("/target");
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.hasAttribute("type")).toBe(false);
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

        expect(container.textContent).toContain("save");
        expect(container.textContent).toContain("Enregistrer");
    });

    test("Rend un espace insécable par défaut si label est absent", () => {
        const {container} = render(<Button theme={buttonTheme} />);

        // Le composant met toujours un <span> de label contenant \u00A0.
        const labelSpan = container.querySelector("button span:last-child");
        expect(labelSpan?.textContent).toBe("\u00A0");
    });

    test("Propage type au <button>", () => {
        render(<Button label="Submit" theme={buttonTheme} type="submit" />);

        expect(screen.getByRole("button", {name: "Submit"}).getAttribute("type")).toBe("submit");
    });
});
