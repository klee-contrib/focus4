import {fireEvent, render, screen} from "@testing-library/react";
import {createRef, useEffect} from "react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Menu, MenuItem, MenuProps, useMenu} from "../menu";

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

function AnchoredMenu({position = "auto-fit"}: {position?: MenuProps["position"]}) {
    const menu = useMenu();

    useEffect(() => menu.open(), []);

    return (
        <div ref={menu.anchor} data-testid="anchor">
            <Menu {...menu} position={position} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        </div>
    );
}

function resolvedPosition(list: HTMLElement) {
    const vertical = list.style.top ? "bottom" : "top";
    const horizontal = list.style.left ? "left" : list.style.right ? "right" : "";
    return horizontal ? `${vertical}-${horizontal}` : vertical;
}

describe("Menu component", () => {
    setupComponentTest();

    test("MenuItem rend ses icônes et son état disabled", () => {
        const {container} = render(
            <MenuItem caption="Supprimer" disabled iconLeft="delete" iconRight="chevron_right" theme={menuTheme} />
        );

        expect(["delete", "Supprimer", "chevron_right"].map(text => screen.getByText(text).textContent)).toEqual([
            "delete",
            "Supprimer",
            "chevron_right"
        ]);
        expect(container.firstElementChild!.classList.contains("menu-menu-item-disabled")).toBe(true);
    });

    test("Rend un menu actif en liste complète", () => {
        render(
            <Menu {...createMenu()} position="bottom" theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        const list = screen.getByRole("list");
        expect([list.classList.contains("menu-active"), list.classList.contains("menu-full")]).toEqual([true, true]);
        expect(screen.getByText("Un").textContent).toBe("Un");
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

    test("boucle sur le dernier item avec ArrowUp et conserve le focus avec noBlurOnArrowPress", () => {
        Element.prototype.scrollIntoView = vi.fn();
        const menu = createMenu();
        const onSelectedChange = vi.fn();
        const {container} = render(
            <>
                <input aria-label="champ" />
                <Menu {...menu} noBlurOnArrowPress onSelectedChange={onSelectedChange} selected="one" theme={menuTheme}>
                    <MenuItem key="one" caption="Un" theme={menuTheme} />
                    <MenuItem key="two" caption="Deux" theme={menuTheme} />
                </Menu>
            </>
        );
        const input = screen.getByRole("textbox");
        input.focus();

        fireEvent.keyDown(document, {key: "ArrowUp"});

        expect(onSelectedChange).toHaveBeenLastCalledWith("two");
        expect(container.querySelector('[data-key="two"]')!.classList.contains("menu-item-focused")).toBe(true);
        expect(document.activeElement).toBe(input);
    });

    test("ne ferme pas le menu après un clic si demandé", () => {
        const menu = createMenu();
        const onItemClick = vi.fn();
        render(
            <Menu {...menu} noCloseOnClick onItemClick={onItemClick} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        fireEvent.click(screen.getByText("Un"));

        expect(onItemClick).toHaveBeenCalledWith("one", "click");
        expect(menu.close).not.toHaveBeenCalled();
    });

    test("saute les séparateurs lors de la navigation clavier", () => {
        Element.prototype.scrollIntoView = vi.fn();
        const menu = createMenu();
        const onSelectedChange = vi.fn();
        const {container} = render(
            <Menu {...menu} onSelectedChange={onSelectedChange} theme={menuTheme}>
                <hr />
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        fireEvent.keyDown(document, {key: "ArrowDown"});

        expect(onSelectedChange).toHaveBeenLastCalledWith("one");
        expect(container.querySelector('[data-key="0"]')!.classList.contains("menu-item-focused")).toBe(false);
        expect(container.querySelector('[data-key="one"]')!.classList.contains("menu-item-focused")).toBe(true);
    });

    // En jsdom toutes les `BoundingClientRect` valent 0, donc l'ancre est toujours résolue en haut à gauche de l'écran.
    test.each([
        ["auto-fill", "bottom"],
        ["auto-fit", "bottom-left"],
        ["auto-left", "bottom-left"],
        ["auto-right", "bottom-right"],
        ["bottom-auto", "bottom-left"],
        ["top-auto", "top-left"],
        ["top-right", "top-right"]
    ] as const)("résout la position %s en %s", (position, expected) => {
        render(<AnchoredMenu position={position} />);

        const list = screen.getByRole("list");
        expect(resolvedPosition(list)).toBe(expected);
        expect(list.classList.contains("menu-full")).toBe(!expected.includes("-"));
    });

    test("ferme le menu lors d'un clic extérieur", () => {
        render(
            <>
                <AnchoredMenu />
                <button type="button">Outside</button>
            </>
        );
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(true);

        fireEvent.pointerDown(screen.getByRole("button", {name: "Outside"}));

        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(false);
    });

    test.each([true, false])("keepItemsInDOMWhenClosed=%s garde les items montés menu fermé", keepItems => {
        render(
            <Menu {...createMenu()} active={false} keepItemsInDOMWhenClosed={keepItems} theme={menuTheme}>
                <MenuItem key="one" caption="Un" theme={menuTheme} />
            </Menu>
        );

        expect(screen.queryByText("Un") !== null).toBe(keepItems);
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(false);
    });
});
