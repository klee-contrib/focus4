import {render, screen} from "@testing-library/react";
import {ReactElement} from "react";
import {createPortal} from "react-dom";
import {describe, expect, test, vi} from "vitest";

import {HeaderContext, ScrollableContext} from "../../utils/contexts";
import {HeaderContent} from "../content";
import {HeaderScrolling} from "../scrolling";
import {HeaderTopRow} from "../top-row";

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

function createScrollableContext(overrides = {}) {
    return {
        headerHeight: 0,
        level: 0,
        portal: (node: ReactElement) => createPortal(node, document.body),
        registerHeaderElement: vi.fn(() => vi.fn()),
        registerIntersect: vi.fn(() => vi.fn()),
        scrollTo: vi.fn(),
        ...overrides
    };
}

describe("Header", () => {
    test("HeaderScrolling est sticky par défaut sans HeaderContent", () => {
        const {container} = render(
            <HeaderScrolling theme={headerTheme}>
                <div>Top row</div>
            </HeaderScrolling>
        );

        expect(screen.getByText("Top row").textContent).toBe("Top row");
        expect(container.firstElementChild?.tagName).toBe("HEADER");
        expect(container.firstElementChild?.classList.contains("header-scrolling-sticky")).toBe(true);
    });

    test("HeaderScrolling n'est pas sticky par défaut avec HeaderContent", () => {
        const {container} = render(
            <HeaderScrolling theme={headerTheme}>
                <HeaderContent theme={headerTheme}>Contenu</HeaderContent>
            </HeaderScrolling>
        );

        expect(screen.getByText("Contenu").textContent).toBe("Contenu");
        expect(container.firstElementChild?.tagName).toBe("HEADER");
        expect(container.firstElementChild?.classList.contains("header-scrolling-sticky")).toBe(false);
    });

    test("HeaderTopRow enregistre son élément dans le Scrollable", () => {
        const registerHeaderElement = vi.fn<(node: HTMLElement) => () => void>(() => vi.fn());
        const scrollable = createScrollableContext({registerHeaderElement});
        render(
            <ScrollableContext.Provider value={scrollable}>
                <HeaderTopRow theme={headerTheme}>Navigation</HeaderTopRow>
            </ScrollableContext.Provider>
        );

        expect(registerHeaderElement).toHaveBeenCalledTimes(1);
        expect(registerHeaderElement.mock.calls[0][0].classList.contains("header-top-row")).toBe(true);
    });

    test("HeaderContent passe le header en sticky quand il sort de l'écran", () => {
        let onIntersect: ((ratio: number, isIntersecting: boolean) => void) | undefined;
        const registerIntersect = vi.fn((_node, callback) => {
            onIntersect = callback;
            return vi.fn();
        });
        const setSticky = vi.fn();
        const scrollable = createScrollableContext({registerIntersect});

        const {container} = render(
            <ScrollableContext.Provider value={scrollable}>
                <HeaderContext.Provider value={{sticky: false, setSticky}}>
                    <HeaderContent theme={headerTheme}>Contenu</HeaderContent>
                </HeaderContext.Provider>
            </ScrollableContext.Provider>
        );
        Object.defineProperty(container.firstElementChild!, "clientHeight", {value: 100});

        onIntersect?.(0.05, true);

        expect(registerIntersect).toHaveBeenCalledTimes(1);
        expect(setSticky).toHaveBeenCalledWith(true);
    });

    test("HeaderContent désactive le sticky quand il redevient visible", () => {
        let onIntersect: ((ratio: number, isIntersecting: boolean) => void) | undefined;
        const registerIntersect = vi.fn((_node, callback) => {
            onIntersect = callback;
            return vi.fn();
        });
        const setSticky = vi.fn();
        const scrollable = createScrollableContext({registerIntersect});

        const {container} = render(
            <ScrollableContext.Provider value={scrollable}>
                <HeaderContext.Provider value={{sticky: true, setSticky}}>
                    <HeaderContent theme={headerTheme}>Contenu</HeaderContent>
                </HeaderContext.Provider>
            </ScrollableContext.Provider>
        );
        Object.defineProperty(container.firstElementChild!, "clientHeight", {value: 100});

        onIntersect?.(0.3, true);

        expect(setSticky).toHaveBeenCalledWith(false);
    });
});
