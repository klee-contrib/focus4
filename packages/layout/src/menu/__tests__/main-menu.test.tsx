import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {MainMenu, MainMenuItem} from "../index";
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
        render(
            <MainMenuList theme={mainMenuTheme}>
                <MainMenuItem label="Accueil" theme={mainMenuTheme} />
            </MainMenuList>
        );

        expect(screen.getByRole("list").classList.contains("main-menu-list")).toBe(true);
        expect(screen.getByRole("button", {name: "Accueil"}).tagName).toBe("BUTTON");
    });

    test("Rend un lien quand href est renseigné", () => {
        render(
            <MainMenuList theme={mainMenuTheme}>
                <MainMenuItem href="/profil" label="Profil" theme={mainMenuTheme} />
            </MainMenuList>
        );

        const link = screen.getByRole<HTMLAnchorElement>("link", {name: "Profil"});
        expect(link.pathname).toBe("/profil");
        expect(link.hasAttribute("type")).toBe(false);
    });

    test("Marque l'item correspondant à la route active", () => {
        render(
            <MainMenuList activeRoute="/active" theme={mainMenuTheme}>
                <MainMenuItem label="Actif" route="/active" theme={mainMenuTheme} />
            </MainMenuList>
        );

        expect(screen.getByRole("button", {name: "Actif"}).classList.contains("main-menu-item-active")).toBe(true);
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

        expect(parent.classList.contains("main-menu-item-opened")).toBe(true);
        expect(screen.getByRole("button", {name: "Enfant"}).tagName).toBe("BUTTON");

        fireEvent.click(parent);

        expect(parent.classList.contains("main-menu-item-opened")).toBe(false);
    });

    test("affiche le menu principal avec son overlay", () => {
        render(
            <MainMenu showOverlay theme={mainMenuTheme}>
                <MainMenuItem label="Accueil" theme={mainMenuTheme} />
            </MainMenu>
        );

        expect(screen.getByRole("navigation").classList.contains("main-menu")).toBe(true);
    });
});
