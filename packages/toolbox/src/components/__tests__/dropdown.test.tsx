import {fireEvent, render, screen} from "@testing-library/react";
import {ReactElement} from "react";
import {describe, expect, test, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {defaultAppTheme, setupComponentTest} from "../../__tests__/test-utils";
import {Dropdown} from "../dropdown";

const dropdownTheme = {
    dropdown: "dropdown",
    "dropdown--disabled": "dropdown-disabled",
    "dropdown--singleLine": "dropdown-single-line",
    field: "dropdown-field",
    hint: "dropdown-hint",
    input: "dropdown-input",
    inputContainer: "dropdown-input-container",
    value: "dropdown-value",
    "value--disabled": "dropdown-value-disabled",
    "value--selected": "dropdown-value-selected",
    supportingText: "dropdown-supporting-text",
    icon: "dropdown-icon",
    label: "dropdown-label",
    outline: "dropdown-outline",
    prefix: "dropdown-prefix",
    progress: "dropdown-progress",
    suffix: "dropdown-suffix",
    textField: "dropdown-text-field",
    tooltip: "dropdown-tooltip",
    trailingButton: "dropdown-trailing-button"
};

const values = [
    {key: "one", label: "Un"},
    {key: "two", label: "Deux"}
];

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

function renderDropdown(ui: ReactElement) {
    return render(<ThemeProvider appTheme={{...defaultAppTheme, menu: menuTheme}}>{ui}</ThemeProvider>);
}

function getReadonlyInput(container: HTMLElement) {
    return container.querySelector("span.dropdown-input")!;
}

function resolvedMenuPosition() {
    const list = screen.getByRole("list");
    const vertical = list.style.top ? "bottom" : "top";
    const horizontal = list.style.left ? "left" : list.style.right ? "right" : "";
    return horizontal ? `${vertical}-${horizontal}` : vertical;
}

describe("Dropdown component", () => {
    setupComponentTest();

    test("Rend la valeur sélectionnée et l'option undefined", () => {
        renderDropdown(<Dropdown theme={dropdownTheme} undefinedLabel="Aucune" value="one" values={values} />);

        expect(screen.getByRole("listbox").dataset.value).toBe("one");
        expect(screen.getAllByText("Un")).toHaveLength(2);
        expect(screen.getByText("Aucune").textContent).toBe("Aucune");
        expect(screen.getByRole("option", {name: "Un"}).classList.contains("dropdown-value-selected")).toBe(true);
    });

    test("Affiche le libellé undefined comme hint quand hasUndefined=false", () => {
        const {container} = renderDropdown(
            <Dropdown hasUndefined={false} theme={dropdownTheme} undefinedLabel="Choisir" values={values} />
        );

        expect(screen.getByText("Choisir").classList.contains("dropdown-hint")).toBe(true);
        expect(container.querySelectorAll("[role='option']")).toHaveLength(2);
    });

    test("Sélectionne la valeur suivante au clavier quand le menu est fermé", () => {
        const onChange = vi.fn();
        const {container} = renderDropdown(
            <Dropdown onChange={onChange} theme={dropdownTheme} value="one" values={values} />
        );
        const input = getReadonlyInput(container);

        fireEvent.focus(input);
        fireEvent.keyDown(document, {key: "ArrowDown"});

        expect(onChange).toHaveBeenCalledWith("two");
    });

    test("Revient à la dernière valeur avec ArrowUp depuis undefined", () => {
        const onChange = vi.fn();
        const {container} = renderDropdown(<Dropdown onChange={onChange} theme={dropdownTheme} values={values} />);

        fireEvent.focus(getReadonlyInput(container));
        fireEvent.keyDown(document, {key: "ArrowUp"});

        expect(onChange).toHaveBeenCalledWith("two");
    });

    test("N'utilise pas les flèches quand disableArrowSelectionWhenClosed=true", () => {
        const onChange = vi.fn();
        const {container} = renderDropdown(
            <Dropdown disableArrowSelectionWhenClosed onChange={onChange} theme={dropdownTheme} values={values} />
        );

        fireEvent.focus(getReadonlyInput(container));
        fireEvent.keyDown(document, {key: "ArrowDown"});

        expect(onChange).not.toHaveBeenCalled();
    });

    test("Marque les options désactivées sans désactiver toute la dropdown", () => {
        renderDropdown(
            <Dropdown disabled={["two"]} sizing="no-fit-single-line" theme={dropdownTheme} values={values} />
        );

        const listbox = screen.getByRole("listbox");
        expect(listbox.ariaDisabled).toBe("false");
        expect(screen.getByRole("option", {name: "Deux"}).classList.contains("dropdown-value-disabled")).toBe(true);
        expect(listbox.classList.contains("dropdown-single-line")).toBe(true);
    });

    test("ouvre le menu avec Entrée et sélectionne une option", () => {
        const onChange = vi.fn();
        const {container} = renderDropdown(<Dropdown onChange={onChange} theme={dropdownTheme} values={values} />);
        const input = getReadonlyInput(container);

        fireEvent.focus(input);
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(false);

        fireEvent.keyDown(document, {key: "Enter"});
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(true);

        fireEvent.click(screen.getByRole("option", {name: "Deux"}));

        expect(onChange).toHaveBeenCalledWith("two");
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(false);
    });

    test("conserve le menu ouvert après une sélection et accepte un libellé personnalisé", () => {
        const onChange = vi.fn();
        const LineComponent = ({item}: {item: {key: string; label: string}}) => <strong>{item.label} custom</strong>;
        const {container} = renderDropdown(
            <Dropdown
                LineComponent={LineComponent}
                getKey={item => item.key}
                getLabel={item => item.label}
                noCloseOnChange
                onChange={onChange}
                theme={dropdownTheme}
                value="one"
                values={values}
            />
        );

        fireEvent.click(getReadonlyInput(container));
        fireEvent.click(screen.getByRole("option", {name: "Deux"}));

        expect(onChange).toHaveBeenCalledWith("two");
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(true);
        expect(screen.getByRole("option", {name: "Deux"}).querySelector("strong")!.textContent).toBe("Deux custom");
    });

    test("ouvre le menu avec Espace mais reste marquée désactivée", () => {
        const onChange = vi.fn();
        const {container} = renderDropdown(
            <Dropdown disabled theme={dropdownTheme} onChange={onChange} values={values} />
        );

        fireEvent.focus(getReadonlyInput(container));
        fireEvent.keyDown(document, {key: "Space"});

        const listbox = screen.getByRole("listbox");
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(true);
        expect([listbox.ariaDisabled, listbox.classList.contains("dropdown-disabled")]).toEqual(["true", true]);
        expect(onChange).not.toHaveBeenCalled();
    });

    // En jsdom toutes les `BoundingClientRect` valent 0, donc les positions "auto" tombent toujours en bas à gauche.
    test.each([
        ["auto", "fit-to-field-and-wrap", "bottom"],
        ["auto", "no-fit-single-line", "bottom-left"],
        ["up", "fit-to-field-single-line", "top"],
        ["up", "no-fit-single-line", "top-left"],
        ["down", "fit-to-field-and-wrap", "bottom"],
        ["down", "fit-to-values", "bottom-left"]
    ] as const)("positionne le menu en %s / %s sur %s", (direction, sizing, expected) => {
        const {container} = renderDropdown(
            <Dropdown direction={direction} sizing={sizing} theme={dropdownTheme} values={values} />
        );

        fireEvent.click(getReadonlyInput(container));

        expect(resolvedMenuPosition()).toBe(expected);
        expect(screen.getByRole("list").classList.contains("menu-full")).toBe(!expected.includes("-"));
        expect(screen.getByRole("listbox").classList.contains("dropdown-single-line")).toBe(
            sizing !== "fit-to-field-and-wrap"
        );
    });

    test("affiche le libellé, rend la valeur sélectionnée via LineComponent et ferme le menu au clic sur un trailing", () => {
        const onTrailingClick = vi.fn();
        const LineComponent = ({item}: {item: {key: string; label: string}}) => <strong>{item.label}</strong>;
        const {container} = renderDropdown(
            <Dropdown
                LineComponent={LineComponent}
                label="Choix"
                onChange={() => undefined}
                theme={dropdownTheme}
                trailing={{icon: "clear", onClick: onTrailingClick}}
                value="one"
                values={values}
            />
        );

        fireEvent.click(getReadonlyInput(container));
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(true);

        expect(screen.getByText("Choix").classList.contains("dropdown-label")).toBe(true);
        expect(getReadonlyInput(container).querySelector("strong")!.textContent).toBe("Un");

        fireEvent.click(container.querySelector("button")!);

        expect(onTrailingClick).toHaveBeenCalledOnce();
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(false);
    });

    test("sélectionne l'option undefined quand elle est autorisée", () => {
        const onChange = vi.fn();
        const {container} = renderDropdown(
            <Dropdown onChange={onChange} theme={dropdownTheme} value="one" values={values} />
        );

        fireEvent.click(getReadonlyInput(container));
        fireEvent.click(screen.getByRole("option", {name: ""}));

        expect(onChange).toHaveBeenCalledWith(undefined);
        expect(screen.getByRole("list").classList.contains("menu-active")).toBe(false);
    });
});
