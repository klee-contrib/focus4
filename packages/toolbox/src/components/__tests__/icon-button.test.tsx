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
        expect(button).toMatchObject({tagName: "BUTTON", type: "button"});
        expect([...container.querySelectorAll(".ib-icon")].map(icon => icon.textContent)).toEqual(["clear"]);
    });

    test("Rend un <a> quand href est renseigné", () => {
        render(<IconButton href="/home" icon="home" label="Accueil" theme={iconButtonTheme} />);

        const link = screen.getByRole("link", {name: "Accueil"});
        expect(link).toMatchObject({pathname: "/home"});
        expect(link.hasAttribute("disabled")).toBe(false);
    });

    test.each([
        {disabled: false, callCount: 1},
        {disabled: true, callCount: 0}
    ])("Déclenche onClick avec disabled : $disabled", ({disabled, callCount}) => {
        const onClick = vi.fn();
        render(
            <IconButton disabled={disabled} icon="close" label="Fermer" onClick={onClick} theme={iconButtonTheme} />
        );

        fireEvent.click(screen.getByRole("button", {name: "Fermer"}));
        expect(onClick).toHaveBeenCalledTimes(callCount);
    });

    test("Le label est exposé comme aria-label", () => {
        render(<IconButton icon="menu" label="Ouvrir le menu" theme={iconButtonTheme} />);

        expect(screen.getByRole("button", {name: "Ouvrir le menu"}).ariaLabel).toBe("Ouvrir le menu");
    });
});
