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
});
