import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Tab, Tabs} from "../tabs";

const tabsTheme = {
    content: "tabs-content",
    focus: "tabs-focus",
    icon: "tabs-icon",
    label: "tabs-label",
    navigation: "tabs-navigation",
    pointer: "tabs-pointer",
    tab: "tab",
    "tab--active": "tab-active",
    "tab--disabled": "tab-disabled",
    tabs: "tabs",
    "tabs--secondary": "tabs-secondary"
};

describe("Tabs component", () => {
    setupComponentTest();

    test("Rend les tabs et le contenu associé", () => {
        render(
            <Tabs index={1} theme={tabsTheme}>
                <Tab label="Premier">Contenu 1</Tab>
                <Tab label="Deuxième">Contenu 2</Tab>
            </Tabs>
        );

        expect(screen.getByRole("tab", {name: "Premier"}).ariaSelected).toBe("false");
        expect(screen.getByRole("tab", {name: "Deuxième"}).ariaSelected).toBe("true");
        const panels = screen.getAllByRole("tabpanel");
        expect(panels.map(panel => panel.textContent)).toEqual(["Contenu 1", "Contenu 2"]);
        expect(panels.map(panel => panel.style.transform)).toEqual(["translateX(-100%)", "translateX(-100%)"]);
        expect(panels[0].parentElement?.className).toBe("tabs-content");
    });

    test("Appelle onChange au clic et à Entrée", () => {
        const onChange = vi.fn();
        render(
            <Tabs onChange={onChange} theme={tabsTheme}>
                <Tab label="Premier" />
                <Tab label="Deuxième" />
            </Tabs>
        );

        const secondTab = screen.getByRole("tab", {name: "Deuxième"});
        fireEvent.click(secondTab);
        fireEvent.keyDown(secondTab, {key: "Enter"});

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(1, 1);
        expect(onChange).toHaveBeenNthCalledWith(2, 1);
    });

    test("N'appelle pas onChange sur un tab désactivé", () => {
        const onChange = vi.fn();
        render(
            <Tabs onChange={onChange} theme={tabsTheme}>
                <Tab label="Premier" />
                <Tab disabled label="Deuxième" />
            </Tabs>
        );

        const disabledTab = screen.getByRole("tab", {name: "Deuxième"});
        expect(disabledTab.classList.contains("tab-disabled")).toBe(true);
        expect(disabledTab.hasAttribute("tabindex")).toBe(false);

        fireEvent.click(disabledTab);
        expect(onChange).not.toHaveBeenCalled();
    });

    test("Appelle onActive quand un tab devient actif", () => {
        const onActive = vi.fn();
        const {rerender} = render(<Tab label="Direct" onActive={onActive} theme={tabsTheme} />);

        expect(onActive).not.toHaveBeenCalled();

        rerender(<Tab active label="Direct" onActive={onActive} theme={tabsTheme} />);
        expect(onActive).toHaveBeenCalledTimes(1);
    });

    test("Applique la variante secondaire", () => {
        const {container} = render(
            <Tabs secondary theme={tabsTheme}>
                <Tab label="Premier" />
            </Tabs>
        );

        expect(container.firstElementChild?.classList.contains("tabs-secondary")).toBe(true);
    });
});
