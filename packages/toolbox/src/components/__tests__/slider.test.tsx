import {act, createEvent, fireEvent, screen} from "@testing-library/react";
import {afterAll, beforeAll, describe, expect, test, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {defaultAppTheme, renderWithTheme, setupComponentTest} from "../../__tests__/test-utils";
import {Slider} from "../slider";

const sliderTheme = {
    handle: "slider-handle",
    indicator: "slider-indicator",
    slider: "slider",
    "slider--disabled": "slider-disabled",
    "slider--labeled": "slider-labeled",
    ripple: "slider-ripple",
    state: "slider-state",
    tick: "slider-tick",
    "tick--active": "slider-tick-active",
    ticks: "slider-ticks",
    track: "slider-track"
};

function getSlider() {
    return screen.getByRole("slider");
}

function setRect(element: Element, left: number, width: number) {
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
        bottom: 40,
        height: 40,
        left,
        right: left + width,
        top: 0,
        width,
        x: left,
        y: 0,
        toJSON: () => undefined
    } as DOMRect);
}

let resizeTrack: (() => void) | undefined;

describe("Slider component", () => {
    setupComponentTest();

    beforeAll(() => {
        if (typeof ResizeObserver === "undefined") {
            vi.stubGlobal(
                "ResizeObserver",
                class ResizeObserver {
                    constructor(callback: ResizeObserverCallback) {
                        resizeTrack = () => callback([], this);
                    }
                    observe() {
                        return undefined;
                    }
                    unobserve() {
                        return undefined;
                    }
                    disconnect() {
                        return undefined;
                    }
                }
            );
        }
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    test("Rend la valeur et les bornes avec les options de présentation", () => {
        renderWithTheme(<Slider labeled max={10} min={0} step={2} theme={sliderTheme} ticks value={4} />);

        const slider = getSlider();
        expect([slider.ariaValueNow, slider.ariaValueMin, slider.ariaValueMax]).toEqual(["4", "0", "10"]);
        expect([slider.classList.contains("slider"), slider.classList.contains("slider-labeled")]).toEqual([
            true,
            true
        ]);
        expect(slider.querySelectorAll(".slider-tick")).toHaveLength(6);
        expect(slider.querySelectorAll(".slider-tick-active")).toHaveLength(3);
    });

    test("Calcule la valeur au pointer down et relaie les handlers de pointeur", () => {
        const onChange = vi.fn();
        const onPointerDown = vi.fn();
        renderWithTheme(
            <ThemeProvider appTheme={{...defaultAppTheme, ripple: {ripple: "slider-ripple"}}}>
                <Slider max={100} onChange={onChange} onPointerDown={onPointerDown} theme={sliderTheme} value={0} />
            </ThemeProvider>
        );

        const slider = getSlider();
        const track = slider.querySelector(".slider-track")!;
        setRect(track, 10, 100);
        act(() => resizeTrack?.());
        const pointerDown = createEvent.pointerDown(slider);
        Object.defineProperty(pointerDown, "pageX", {value: 60});
        fireEvent(slider, pointerDown);

        expect(onChange).toHaveBeenCalledWith(50);
        expect(onPointerDown).toHaveBeenCalledTimes(1);
    });

    test("Navigue au clavier et respecte les bornes", () => {
        const onChange = vi.fn();
        renderWithTheme(<Slider max={10} min={0} onChange={onChange} step={2} theme={sliderTheme} value={8} />);

        const state = getSlider().querySelector(".slider-state")!;
        fireEvent.focus(state);
        fireEvent.keyDown(document, {key: "ArrowRight"});
        fireEvent.keyDown(document, {key: "ArrowLeft"});

        expect(onChange).toHaveBeenNthCalledWith(1, 10);
        expect(onChange).toHaveBeenNthCalledWith(2, 6);
    });

    test("Expose l'état disabled sans modifier la valeur contrôlée", () => {
        renderWithTheme(<Slider disabled theme={sliderTheme} value={25} />);

        const slider = getSlider();
        expect(slider.ariaDisabled).toBe("true");
        expect(slider.classList.contains("slider-disabled")).toBe(true);
        expect(slider.ariaValueNow).toBe("25");
    });

    test("Reste contrôlable sans handler de changement", () => {
        renderWithTheme(<Slider theme={sliderTheme} value={25} />);

        const state = getSlider().querySelector(".slider-state")!;
        fireEvent.focus(state);
        fireEvent.keyDown(document, {key: "ArrowRight"});

        expect(getSlider().ariaValueNow).toBe("25");
    });
});
