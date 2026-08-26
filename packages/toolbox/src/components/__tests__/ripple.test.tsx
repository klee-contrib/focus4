import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Ripple} from "../ripple";

function setRect(element: HTMLElement, rect: Partial<DOMRect>) {
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
        bottom: rect.top! + rect.height!,
        height: rect.height!,
        left: rect.left!,
        right: rect.left! + rect.width!,
        top: rect.top!,
        width: rect.width!,
        x: rect.left!,
        y: rect.top!,
        toJSON: () => undefined
    } as DOMRect);
    Object.defineProperty(element, "offsetWidth", {configurable: true, value: rect.width});
    Object.defineProperty(element, "offsetHeight", {configurable: true, value: rect.height});
}

describe("Ripple component", () => {
    setupComponentTest();

    test("Ajoute un ripple au pointer down et propage les handlers", () => {
        const onPointerDown = vi.fn();
        const onPointerUp = vi.fn();
        render(
            <Ripple className="custom-ripple" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                <button type="button">Cliquer</button>
            </Ripple>
        );
        const button = screen.getByRole("button", {name: "Cliquer"});
        setRect(button, {top: 20, left: 10, width: 100, height: 40});

        fireEvent.pointerDown(button, {clientX: 20, clientY: 30, offsetX: 10, offsetY: 10});
        fireEvent.pointerUp(button);

        expect(onPointerDown).toHaveBeenCalledTimes(1);
        expect(onPointerUp).toHaveBeenCalledTimes(1);
        expect(button.querySelector(".custom-ripple")).toBeTruthy();
    });

    test("Ne pose pas de ripple quand il est disabled", () => {
        render(
            <Ripple disabled>
                <button type="button">Cliquer</button>
            </Ripple>
        );
        const button = screen.getByRole("button", {name: "Cliquer"});
        setRect(button, {top: 0, left: 0, width: 80, height: 30});

        fireEvent.pointerDown(button, {offsetX: 5, offsetY: 5});

        expect(button.querySelector("div")).toBeNull();
    });

    test("Peut centrer le ripple sur une cible interne", () => {
        render(
            <Ripple centered className="custom-ripple" rippleTarget="inner-target">
                <button type="button">
                    <span className="inner-target">Cible</span>
                </button>
            </Ripple>
        );
        const button = screen.getByRole("button", {name: "Cible"});
        const target = screen.getByText("Cible");
        setRect(button, {top: 0, left: 0, width: 120, height: 60});
        setRect(target, {top: 10, left: 10, width: 40, height: 20});

        fireEvent.pointerDown(target, {offsetX: 0, offsetY: 0});

        expect(target.querySelector<HTMLDivElement>(".custom-ripple")?.style.left).toBe("20px");
        expect(target.querySelector<HTMLDivElement>(".custom-ripple")?.style.top).toBe("10px");
    });
});
