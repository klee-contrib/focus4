import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {MainMenuItem} from "../item";
import {MainMenuList} from "../list";

const mainMenuTheme = {
    focus: "main-menu-focus",
    icon: "main-menu-icon",
    item: "main-menu-item",
    "item--active": "main-menu-item-active",
    "item--opened": "main-menu-item-opened",
    label: "main-menu-label",
    list: "main-menu-list",
    menu: "main-menu",
    panel: "main-menu-panel"
};

describe("MainMenu", () => {
    test("Rend une liste de menu", () => {
        const {container} = render(
            <MainMenuList theme={mainMenuTheme}>
                <MainMenuItem label="Accueil" theme={mainMenuTheme} />
            </MainMenuList>
        );

        expect(container.querySelector("ul")?.className).toContain("main-menu-list");
        expect(screen.getByRole("button", {name: "Accueil"})).toBeTruthy();
    });

    test("Rend un lien quand href est renseigné", () => {
        render(
            <MainMenuList theme={mainMenuTheme}>
                <MainMenuItem href="/profil" label="Profil" theme={mainMenuTheme} />
            </MainMenuList>
        );

        const link = screen.getByRole("link", {name: "Profil"});
        expect(link.getAttribute("href")).toBe("/profil");
        expect(link.hasAttribute("type")).toBe(false);
    });

    test("Marque l'item correspondant à la route active", () => {
        render(
            <MainMenuList activeRoute="/active" theme={mainMenuTheme}>
                <MainMenuItem label="Actif" route="/active" theme={mainMenuTheme} />
            </MainMenuList>
        );

        expect(screen.getByRole("button", {name: "Actif"}).className).toContain("main-menu-item-active");
    });

    test("Déclenche onClick au clic sur un item", () => {
        const onClick = vi.fn();
        render(
            <MainMenuList theme={mainMenuTheme}>
                <MainMenuItem label="Cliquer" onClick={onClick} theme={mainMenuTheme} />
            </MainMenuList>
        );

        fireEvent.click(screen.getByRole("button", {name: "Cliquer"}));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("Ouvre et referme un sous-menu au clic", () => {
        render(
            <MainMenuList theme={mainMenuTheme}>
                <MainMenuItem label="Parent" theme={mainMenuTheme}>
                    <MainMenuItem label="Enfant" theme={mainMenuTheme} />
                </MainMenuItem>
            </MainMenuList>
        );

        const parent = screen.getByRole("button", {name: "Parent"});
        fireEvent.click(parent);

        expect(parent.className).toContain("main-menu-item-opened");
        expect(screen.getByRole("button", {name: "Enfant"})).toBeTruthy();

        fireEvent.click(parent);

        expect(parent.className).not.toContain("main-menu-item-opened");
    });
});
