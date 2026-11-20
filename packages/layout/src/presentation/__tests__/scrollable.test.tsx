import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {ReactNode, useContext, useEffect, useState} from "react";
import {describe, expect, test, vi} from "vitest";

import {ScrollableContext} from "../../utils/contexts";
import {Scrollable} from "../scrollable";

setupComponentTest();

const theme = {
    backToTop: "scrollable-back-to-top",
    container: "scrollable-container",
    scrollable: "scrollable"
};

class ResizeObserverStub {
    disconnect() {
        return undefined;
    }
    observe() {
        return undefined;
    }
}

class IntersectionObserverStub {
    disconnect() {
        return undefined;
    }
    observe() {
        return undefined;
    }
    unobserve() {
        return undefined;
    }
}

function Controls() {
    const {portal, registerHeaderElement, registerIntersect, scrollTo} = useContext(ScrollableContext);
    const [value, setValue] = useState(0);

    return (
        <>
            <button type="button" onClick={() => scrollTo({top: 20})}>
                scroll
            </button>
            <button type="button" onClick={() => setValue(current => current + 1)}>
                change
            </button>
            <div
                ref={node => {
                    if (node) {
                        registerHeaderElement(node);
                    }
                }}
            />
            <div
                ref={node => {
                    if (node) {
                        registerIntersect(node, () => undefined);
                    }
                }}
            />
            <output>{value}</output>
            {portal(<span>portal</span>)}
        </>
    );
}

function ObservableControls() {
    const {registerHeaderElement, registerIntersect} = useContext(ScrollableContext);
    useEffect(() => {
        const header = screen.getByTestId("header");
        const target = screen.getByTestId("target");
        const disposeHeader = registerHeaderElement(header);
        const disposeIntersect = registerIntersect(target, () => undefined);
        return () => {
            disposeHeader();
            disposeIntersect();
        };
    }, []);
    return (
        <>
            <div data-testid="header" />
            <div data-testid="target" />
        </>
    );
}

function renderScrollable(children: ReactNode, props = {}) {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    HTMLElement.prototype.scrollTo ??= () => undefined;
    const scrollTo = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => undefined);
    const result = renderWithTheme(
        <Scrollable theme={theme} {...props}>
            {children}
        </Scrollable>
    );
    return {result, scrollTo};
}

describe("Scrollable", () => {
    test("expose ses contrôles et rend un portal", () => {
        const {scrollTo} = renderScrollable(<Controls />);

        fireEvent.click(screen.getByRole("button", {name: "change"}));
        expect(screen.getByText("portal").textContent).toBe("portal");
        fireEvent.click(screen.getByRole("button", {name: "scroll"}));
        expect(scrollTo).toHaveBeenCalledWith({behavior: "smooth", top: 20});
    });

    test("réinitialise le scroll et affiche le bouton de retour en haut", () => {
        const {scrollTo} = renderScrollable(<span>content</span>, {
            backToTopOffset: 10,
            resetScrollOnChildrenChange: true
        });
        const scrollable = screen.getByText("content").parentElement!;
        expect(scrollable.classList.contains("scrollable")).toBe(true);

        Object.defineProperty(scrollable, "scrollTop", {configurable: true, value: 20});
        fireEvent.scroll(scrollable);
        expect(screen.getByRole("button").tagName).toBe("BUTTON");
        fireEvent.click(screen.getByRole("button"));
        expect(scrollTo).toHaveBeenCalledWith({behavior: "smooth", top: 0});
    });

    test("observe les en-têtes et intersections puis nettoie les observateurs", () => {
        let onResize: ResizeObserverCallback | undefined;
        let onIntersect: IntersectionObserverCallback | undefined;
        const disconnectResize = vi.fn();
        const disconnectIntersect = vi.fn();
        const observe = vi.fn();
        const unobserve = vi.fn();
        vi.stubGlobal(
            "ResizeObserver",
            class {
                constructor(callback: ResizeObserverCallback) {
                    onResize = callback;
                }
                disconnect = disconnectResize;
                observe = observe;
            }
        );
        vi.stubGlobal(
            "IntersectionObserver",
            class {
                constructor(callback: IntersectionObserverCallback) {
                    onIntersect = callback;
                }
                disconnect = disconnectIntersect;
                observe = observe;
                unobserve = unobserve;
            }
        );
        const result = renderWithTheme(
            <Scrollable theme={theme}>
                <ObservableControls />
            </Scrollable>
        );
        const header = screen.getByTestId("header");
        const target = screen.getByTestId("target");

        onResize?.([], {} as ResizeObserver);
        onIntersect?.(
            [{intersectionRatio: 0.456, isIntersecting: true, target}] as unknown as IntersectionObserverEntry[],
            {} as IntersectionObserver
        );
        result.unmount();

        expect(observe).toHaveBeenCalledWith(header);
        expect(observe).toHaveBeenCalledWith(target);
        expect(disconnectResize).toHaveBeenCalled();
        expect(disconnectIntersect).toHaveBeenCalled();
        expect(unobserve).toHaveBeenCalledWith(target);
    });
});
