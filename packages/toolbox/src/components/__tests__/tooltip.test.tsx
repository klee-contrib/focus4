import {fireEvent, render, screen} from "@testing-library/react";
import {act} from "react";
import {afterEach, describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Tooltip} from "../tooltip";

const tooltipTheme = {
    content: "tooltip-content",
    tooltip: "tooltip",
    "tooltip--active": "tooltip-active",
    "tooltip--bottom": "tooltip-bottom",
    "tooltip--left": "tooltip-left",
    "tooltip--right": "tooltip-right",
    "tooltip--top": "tooltip-top"
};

(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

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
}

describe("Tooltip component", () => {
    setupComponentTest();

    afterEach(() => {
        vi.useRealTimers();
    });

    test("Affiche une tooltip au survol en position verticale automatique", async () => {
        vi.useFakeTimers();
        render(
            <Tooltip theme={tooltipTheme} tooltip="Aide">
                <button type="button">Info</button>
            </Tooltip>
        );
        const button = screen.getByRole("button", {name: "Info"});
        setRect(button, {top: 10, left: 20, width: 80, height: 30});

        fireEvent.pointerEnter(button);

        expect(screen.getByText("Aide").textContent).toBe("Aide");
        await act(() => vi.advanceTimersByTime(100));
        const tooltip = screen.getByText("Aide").parentElement!;
        expect([tooltip.classList.contains("tooltip-bottom"), tooltip.classList.contains("tooltip-active")]).toEqual([
            true,
            true
        ]);
    });

    test("Choisit gauche ou droite pour la position horizontale automatique", async () => {
        vi.useFakeTimers();
        const {rerender} = render(
            <Tooltip position="horizontal" theme={tooltipTheme} tooltip="Aide droite">
                <button type="button">Info</button>
            </Tooltip>
        );
        const button = screen.getByRole("button", {name: "Info"});
        setRect(button, {top: 50, left: 10, width: 80, height: 30});

        fireEvent.pointerEnter(button);
        await act(() => vi.advanceTimersByTime(100));
        expect(screen.getByText("Aide droite").parentElement!.classList.contains("tooltip-right")).toBe(true);

        fireEvent.pointerLeave(button);
        rerender(
            <Tooltip position="horizontal" theme={tooltipTheme} tooltip="Aide gauche">
                <button type="button">Info</button>
            </Tooltip>
        );
        const nextButton = screen.getByRole("button", {name: "Info"});
        setRect(nextButton, {top: 50, left: 900, width: 80, height: 30});

        fireEvent.pointerEnter(nextButton);
        await act(() => vi.advanceTimersByTime(100));
        expect(screen.getByText("Aide gauche").parentElement!.classList.contains("tooltip-left")).toBe(true);
    });

    test("Peut être affichée au clic quand clickBehavior=show", async () => {
        vi.useFakeTimers();
        const onPointerUp = vi.fn();
        render(
            <Tooltip clickBehavior="show" onPointerUp={onPointerUp} position="top" theme={tooltipTheme} tooltip="Aide">
                <button type="button">Info</button>
            </Tooltip>
        );
        const button = screen.getByRole("button", {name: "Info"});
        setRect(button, {top: 50, left: 40, width: 80, height: 30});

        fireEvent.pointerEnter(button);
        expect(screen.queryByText("Aide")).toBeNull();

        fireEvent.pointerUp(button);
        await act(() => vi.advanceTimersByTime(100));

        expect(onPointerUp).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Aide").parentElement!.classList.contains("tooltip-top")).toBe(true);
    });
});
