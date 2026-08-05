import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {IconButton} from "../icon-button";

const iconButtonTheme = {
    button: "ib",
    icon: "ib-icon",
    spinner: "ib-spinner"
};

describe("IconButton component", () => {
    setupComponentTest();

    test("Rend un <button> avec l'icône passée en prop", () => {
        const {container} = render(<IconButton icon="clear" label="Effacer" theme={iconButtonTheme} />);

        const button = screen.getByRole("button", {name: "Effacer"});
        expect(button.tagName).toBe("BUTTON");
        expect(container.textContent).toContain("clear");
    });

    test("Rend un <a> quand href est renseigné", () => {
        const {container} = render(<IconButton href="/home" icon="home" theme={iconButtonTheme} />);

        const link = container.querySelector("a")!;
        expect(link.getAttribute("href")).toBe("/home");
        expect(link.hasAttribute("disabled")).toBe(false);
    });

    test("Déclenche onClick au clic", () => {
        const onClick = vi.fn();
        render(<IconButton icon="close" label="Fermer" onClick={onClick} theme={iconButtonTheme} />);

        fireEvent.click(screen.getByRole("button", {name: "Fermer"}));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("N'appelle pas onClick quand disabled=true", () => {
        const onClick = vi.fn();
        render(<IconButton disabled icon="close" label="Fermer" onClick={onClick} theme={iconButtonTheme} />);

        const button = screen.getByRole("button", {name: "Fermer"});
        fireEvent.click(button);
        expect(button.hasAttribute("disabled")).toBe(true);
        expect(onClick).not.toHaveBeenCalled();
    });

    test("Le label est exposé comme aria-label", () => {
        render(<IconButton icon="menu" label="Ouvrir le menu" theme={iconButtonTheme} />);

        expect(screen.getByRole("button", {name: "Ouvrir le menu"}).getAttribute("aria-label")).toBe("Ouvrir le menu");
    });
});
