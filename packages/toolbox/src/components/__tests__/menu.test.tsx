import {fireEvent, render, screen} from "@testing-library/react";
import {createRef} from "react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Menu, MenuItem} from "../menu";

const menuTheme = {
    caption: "menu-caption",
    focus: "menu-focus",
    icon: "menu-icon",
    item: "menu-item",
    "item--focused": "menu-item-focused",
    menu: "menu",
    "menu--active": "menu-active",
    "menu--full": "menu-full",
    menuItem: "menu-menu-item",
    "menuItem--disabled": "menu-menu-item-disabled"
};

function createMenu() {
    return {active: true, anchor: createRef<HTMLDivElement>(), close: vi.fn(), open: vi.fn(), toggle: vi.fn()};
}

describe("Menu component", () => {
    setupComponentTest();

    test("MenuItem rend ses icônes et son état disabled", () => {
        const {container} = render(
            <MenuItem caption="Supprimer" disabled iconLeft="delete" iconRight="chevron_right" theme={menuTheme} />
        );

        expect(container.textContent).toContain("delete");
        expect(container.textContent).toContain("Supprimer");
        expect(container.textContent).toContain("chevron_right");
        expect(container.firstElementChild?.className).toContain("menu-menu-item-disabled");
    });

    test("Rend un menu actif en liste complète", () => {
        const {container} = render(
            <Menu {...createMenu()} position="bottom" theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        expect(container.querySelector("ul")?.className).toContain("menu-active");
        expect(container.querySelector("ul")?.className).toContain("menu-full");
        expect(screen.getByText("Un")).toBeTruthy();
    });

    test("Appelle l'item et ferme le menu au clic", () => {
        const menu = createMenu();
        const onItemClick = vi.fn();
        const itemClick = vi.fn();
        render(
            <Menu {...menu} onItemClick={onItemClick} theme={menuTheme}>
                <MenuItem key="one" caption="Un" onClick={itemClick} theme={menuTheme} />
            </Menu>
        );

        fireEvent.click(screen.getByText("Un"));

        expect(itemClick).toHaveBeenCalledTimes(1);
        expect(onItemClick).toHaveBeenCalledWith("one", "click");
        expect(menu.close).toHaveBeenCalledTimes(1);
    });

    test("Ne déclenche pas le onClick d'un item disabled", () => {
        const menu = createMenu();
        const onItemClick = vi.fn();
        const itemClick = vi.fn();
        render(
            <Menu {...menu} onItemClick={onItemClick} theme={menuTheme}>
                <MenuItem key="one" caption="Un" disabled onClick={itemClick} theme={menuTheme} />
            </Menu>
        );

        fireEvent.click(screen.getByText("Un"));

        expect(itemClick).not.toHaveBeenCalled();
        expect(onItemClick).not.toHaveBeenCalled();
        expect(menu.close).not.toHaveBeenCalled();
    });

    test("Sélectionne au survol puis réinitialise à la sortie", () => {
        const onSelectedChange = vi.fn();
        const {container} = render(
            <Menu {...createMenu()} onSelectedChange={onSelectedChange} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        onSelectedChange.mockClear();
        fireEvent.pointerEnter(screen.getByText("Un"));
        fireEvent.pointerLeave(container.querySelector("ul")!);

        expect(onSelectedChange).toHaveBeenCalledWith("one");
        expect(onSelectedChange).toHaveBeenCalledWith(undefined);
    });

    test("Conserve la sélection à la sortie si demandé", () => {
        const onSelectedChange = vi.fn();
        const {container} = render(
            <Menu {...createMenu()} keepSelectionOnPointerLeave onSelectedChange={onSelectedChange} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        fireEvent.pointerEnter(screen.getByText("Un"));
        fireEvent.pointerLeave(container.querySelector("ul")!);

        expect(onSelectedChange).toHaveBeenCalledWith("one");
        expect(onSelectedChange).toHaveBeenLastCalledWith("one");
    });

    test("Gère la navigation clavier et Entrée", () => {
        Element.prototype.scrollIntoView = vi.fn();
        const menu = createMenu();
        const onItemClick = vi.fn();
        render(
            <Menu {...menu} onItemClick={onItemClick} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
                <MenuItem key="two" caption="Deux" theme={menuTheme} />
            </Menu>
        );

        fireEvent.keyDown(document, {key: "ArrowDown"});
        fireEvent.keyDown(document, {key: "Enter"});

        expect(onItemClick).toHaveBeenCalledWith("one", "keyboard");
        expect(menu.close).toHaveBeenCalledTimes(1);
    });

    test("Ferme le menu avec Escape", () => {
        const menu = createMenu();
        render(
            <Menu {...menu} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        fireEvent.keyDown(document, {key: "Escape"});

        expect(menu.close).toHaveBeenCalledTimes(1);
    });

    test("Peut rendre des div sans sélection", () => {
        const onItemClick = vi.fn();
        const {container} = render(
            <Menu {...createMenu()} noList noSelection onItemClick={onItemClick} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        expect(container.querySelector("ul")).toBeNull();
        fireEvent.click(screen.getByText("Un"));
        fireEvent.keyDown(document, {key: "ArrowDown"});

        expect(onItemClick).not.toHaveBeenCalled();
    });
});
