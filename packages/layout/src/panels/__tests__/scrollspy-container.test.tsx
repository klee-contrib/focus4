import {defaultAppTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {useContext, useEffect, useRef} from "react";
import {describe, expect, test, vi} from "vitest";

import {ThemeProvider, toBem} from "@focus4/styling";

import {ScrollableContext, ScrollspyContext} from "../../utils";
import {ScrollspyContainer, ScrollspyMenu, ScrollspyMenuProps} from "../scrollspy-container";

setupComponentTest();

const theme = {
    active: "active",
    content: "content",
    focus: "focus",
    icon: "icon",
    menu: "menu",
    scrollspy: "scrollspy"
};

const menuTheme = toBem(theme);

function Menu({initiallyRetracted, panels, scrollToPanel}: ScrollspyMenuProps) {
    return (
        <div>
            <span data-testid="initially-retracted">{String(initiallyRetracted)}</span>
            {panels.map(panel => (
                <button key={panel.id} type="button" onClick={() => scrollToPanel(panel.id, true)}>
                    {panel.title}
                </button>
            ))}
            <button type="button" onClick={() => scrollToPanel("missing")}>
                missing
            </button>
        </div>
    );
}

function RegisteredPanel() {
    const ref = useRef<HTMLDivElement>(null);
    const {registerPanel} = useContext(ScrollspyContext);
    useEffect(() => registerPanel("details", {node: ref.current!, title: "Détails"}), [registerPanel]);
    return (
        <div ref={ref}>
            <button type="button">focusable</button>
        </div>
    );
}

function renderScrollspy(scrollTo = vi.fn(), initiallyRetracted = false) {
    return render(
        <ThemeProvider appTheme={{...defaultAppTheme, scrollspy: theme}}>
            <ScrollableContext.Provider
                value={{
                    headerHeight: 10,
                    level: 0,
                    portal: () => null,
                    registerHeaderElement: () => () => undefined,
                    registerIntersect: () => () => undefined,
                    scrollTo
                }}
            >
                <ScrollspyContainer MenuComponent={Menu} initiallyRetracted={initiallyRetracted} theme={theme}>
                    <RegisteredPanel />
                </ScrollspyContainer>
            </ScrollableContext.Provider>
        </ThemeProvider>
    );
}

describe("ScrollspyContainer", () => {
    test("transmet l'état de rétraction initiale au menu personnalisé", () => {
        renderScrollspy(undefined, true);

        expect(screen.getByTestId("initially-retracted").textContent).toBe("true");
    });

    test("enregistre un panel et le sélectionne avec focus", () => {
        const scrollTo = vi.fn();
        renderScrollspy(scrollTo);

        fireEvent.click(screen.getByRole("button", {name: "Détails"}));
        expect(scrollTo).toHaveBeenCalledWith({top: -10});
    });

    test("ignore un panel inconnu", () => {
        const scrollTo = vi.fn();
        renderScrollspy(scrollTo);

        fireEvent.click(screen.getByRole("button", {name: "missing"}));
        expect(scrollTo).not.toHaveBeenCalled();
    });

    test("interagit avec le menu par défaut", () => {
        const scrollToPanel = vi.fn();
        render(
            <ThemeProvider
                appTheme={{...defaultAppTheme, lateralMenu: {button: "lateral-button", menu: "lateral-menu"}}}
            >
                <ScrollspyMenu
                    activeId="details"
                    headerHeight={12}
                    panels={[
                        {id: "details", title: "Détails", icon: "info"},
                        {id: "other", title: "Autre"}
                    ]}
                    scrollToPanel={scrollToPanel}
                    theme={menuTheme}
                />
            </ThemeProvider>
        );

        const active = screen.getByText("Détails").closest("li")!;
        expect(active.classList.contains("active")).toBe(true);
        expect(screen.getByText("info").textContent).toBe("info");
        fireEvent.click(active);
        fireEvent.keyUp(active, {code: "Enter"});
        fireEvent.keyUp(active, {code: "Space"});
        expect(scrollToPanel.mock.calls).toEqual([["details"], ["details", true]]);
    });

    test("rétracte initialement le menu par défaut", () => {
        render(
            <ThemeProvider
                appTheme={{...defaultAppTheme, lateralMenu: {button: "lateral-button", menu: "lateral-menu"}}}
            >
                <ScrollspyMenu
                    activeId="details"
                    headerHeight={12}
                    initiallyRetracted
                    panels={[]}
                    scrollToPanel={vi.fn()}
                    theme={menuTheme}
                />
            </ThemeProvider>
        );

        expect(screen.getByText("keyboard_arrow_right")).toBeTruthy();
    });
});
