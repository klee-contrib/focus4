import {defaultAppTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {ReactElement} from "react";
import {describe, expect, test} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {HeaderActions} from "../actions";

setupComponentTest();

const headerTheme = {
    actions: "header-actions",
    content: "header-content",
    item: "header-item",
    "item--fillWidth": "header-item-fill",
    "item--stickyOnly": "header-item-sticky",
    scrolling: "header-scrolling",
    "scrolling--sticky": "header-scrolling-sticky",
    topRow: "header-top-row"
};

const appTheme = {
    ...defaultAppTheme,
    header: headerTheme,
    floatingActionButton: {
        button: "fab",
        "button--accent": "fab-accent",
        "button--disabled": "fab-disabled",
        "button--extended": "fab-extended",
        "button--large": "fab-large",
        "button--light": "fab-light",
        "button--lowered": "fab-lowered",
        "button--primary": "fab-primary",
        "button--small": "fab-small",
        focus: "fab-focus",
        icon: "fab-icon",
        label: "fab-label"
    },
    menu: {
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
    },
    tooltip: {content: "tooltip-content", tooltip: "tooltip"}
};

function renderActions(ui: ReactElement) {
    return render(<ThemeProvider appTheme={appTheme}>{ui}</ThemeProvider>);
}

describe("HeaderActions", () => {
    test("ne rend rien sans actions", () => {
        const {container} = renderActions(<HeaderActions />);
        expect(container.childElementCount).toBe(0);
    });

    test("affiche les actions principales avec tooltip sauf si désactivées", () => {
        renderActions(
            <HeaderActions
                primary={[
                    {icon: "add", label: "Ajouter", tooltip: {tooltip: "Créer"}},
                    {disabled: true, icon: "delete", label: "Supprimer", tooltip: {tooltip: "Effacer"}}
                ]}
            />
        );

        const add = screen.getByRole<HTMLButtonElement>("button", {name: "Ajouter"});
        const remove = screen.getByRole<HTMLButtonElement>("button", {name: "Supprimer"});
        expect(add.disabled).toBe(false);
        expect(remove.disabled).toBe(true);
        fireEvent.pointerEnter(add);
        expect(screen.getByText("Créer").textContent).toBe("Créer");
        expect(screen.queryByText("Effacer")).toBeNull();
    });

    test("affiche et ouvre les actions secondaires", () => {
        renderActions(
            <HeaderActions
                secondary={[{caption: "Exporter", onClick: () => undefined}]}
                secondaryButton={{label: "Plus", tooltip: {tooltip: "Actions secondaires"}}}
            />
        );

        const button = screen.getByRole("button", {name: "Plus"});
        expect(screen.queryByText("Exporter")).toBeNull();
        fireEvent.pointerEnter(button);
        expect(screen.getByText("Actions secondaires").textContent).toBe("Actions secondaires");
        fireEvent.click(button);
        expect(screen.getByText("Exporter").textContent).toBe("Exporter");
    });
});
