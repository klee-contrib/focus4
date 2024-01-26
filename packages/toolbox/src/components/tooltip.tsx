import {cloneElement, PointerEvent, ReactElement, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import tooltipCss, {TooltipCss} from "./__style__/tooltip.css";
export {tooltipCss, TooltipCss};

export interface TooltipProps<T extends HTMLElement = HTMLElement> extends PointerEvents<T> {
    /** Composant enfant autour duquel poser la tooltip. */
    children: ReactElement;
    /** Comportement de la tooltip au clic. Par défaut : "hide". */
    clickBehavior?: "hide" | "none" | "show";
    /** Position de la tooltip ("vertical" = "top" ou "bottom", "horizontal" = "left" ou "right"). Par défaut : "vertical" */
    position?: "bottom" | "horizontal" | "left" | "right" | "top" | "vertical";
    /** Contenu de la tooltip. */
    tooltip: ReactNode;
    /** CSS. */
    theme?: CSSProp<TooltipCss>;
}

/**
 * Une tooltip permet d'afficher un bref libellé ou message à un utilisateur au survol.
 */
export function Tooltip({
    children,
    clickBehavior = "hide",
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    position: pPosition = "vertical",
    tooltip,
    theme: pTheme
}: TooltipProps) {
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState(pPosition);
    const [visible, setVisible] = useState(false);
    const [left, setLeft] = useState(0);
    const [top, setTop] = useState(0);

    const timeout = useRef<NodeJS.Timeout>();
    const tooltipNode = useRef<HTMLSpanElement>(null);

    const onTransformEnd = useCallback(function onTransformEnd(e: any) {
        if (e.propertyName === "transform") {
            tooltipNode.current?.removeEventListener("transitionend", onTransformEnd);
            setVisible(false);
        }
    }, []);

    useEffect(
        () => () => {
            tooltipNode.current?.removeEventListener("transitionend", onTransformEnd);
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
        },
        []
    );

    const getPosition = useCallback(
        function getPosition(element: HTMLElement) {
            if (pPosition === "horizontal") {
                const origin = element.getBoundingClientRect();
                const ww = window.innerWidth || document.documentElement.offsetWidth;
                const toRight = origin.left < ww / 2 - origin.width / 2;
                return toRight ? "right" : "left";
            } else if (pPosition === "vertical") {
                const origin = element.getBoundingClientRect();
                const wh = window.innerHeight || document.documentElement.offsetHeight;
                const toBottom = origin.top < wh / 2 - origin.height / 2;
                return toBottom ? "bottom" : "top";
            } else {
                return pPosition;
            }
        },
        [pPosition]
    );

    const activate = useCallback(function activate({
        top: newTop,
        left: newLeft,
        position: newPosition
    }: NonNullable<ReturnType<typeof calculatePosition>>) {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        setVisible(true);
        setPosition(newPosition);
        tooltipNode.current?.removeEventListener("transitionend", onTransformEnd);
        timeout.current = setTimeout(() => {
            setActive(true);
            setTop(newTop);
            setLeft(newLeft);
        }, 100);
    },
    []);

    const deactivate = useCallback(
        function deactivate() {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            if (active) {
                tooltipNode.current?.addEventListener("transitionend", onTransformEnd);
                setActive(false);
            } else if (visible) {
                setVisible(false);
            }
        },
        [active, visible]
    );

    const calculatePosition = useCallback(
        function calculatePosition(element: HTMLElement) {
            const {top: newTop, left: newLeft, height, width} = element.getBoundingClientRect();
            const xOffset = window.scrollX || window.pageXOffset;
            const yOffset = window.scrollY || window.pageYOffset;
            const newPosition = getPosition(element);
            switch (newPosition) {
                case "bottom":
                    return {
                        top: newTop + height + yOffset,
                        left: newLeft + width / 2 + xOffset,
                        position: newPosition
                    };
                case "top":
                    return {
                        top: newTop + yOffset,
                        left: newLeft + width / 2 + xOffset,
                        position: newPosition
                    };
                case "left":
                    return {
                        top: newTop + height / 2 + yOffset,
                        left: newLeft + xOffset,
                        position: newPosition
                    };
                case "right":
                    return {
                        top: newTop + height / 2 + yOffset,
                        left: newLeft + width + xOffset,
                        position: newPosition
                    };
            }
        },
        [getPosition]
    );

    const handlePointerEnter = useCallback(
        function handlePointerEnter(event: PointerEvent<HTMLElement>) {
            if (clickBehavior !== "show") {
                activate(calculatePosition(event.currentTarget as HTMLElement));
            }
            onPointerEnter?.(event);
        },
        [activate, calculatePosition, clickBehavior, onPointerEnter]
    );

    const handlePointerLeave = useCallback(
        function handlePointerLeave(event: PointerEvent<HTMLElement>) {
            deactivate();
            onPointerLeave?.(event);
        },
        [deactivate, onPointerLeave]
    );

    const handlePointerUp = useCallback(
        function handlePointerUp(event: PointerEvent<HTMLElement>) {
            if (clickBehavior === "hide" && active) {
                deactivate();
            } else if (clickBehavior === "show" && !active) {
                activate(calculatePosition(event.currentTarget as HTMLElement));
            }

            onPointerUp?.(event);
        },
        [activate, active, calculatePosition, clickBehavior, deactivate, onPointerUp]
    );

    const theme = useTheme("tooltip", tooltipCss, pTheme);

    return (
        <>
            {cloneElement(children, {
                onPointerDown,
                onPointerEnter: handlePointerEnter,
                onPointerLeave: handlePointerLeave,
                onPointerUp: handlePointerUp
            })}
            {visible && tooltip
                ? createPortal(
                      <span ref={tooltipNode} className={theme.tooltip({active, [position]: true})} style={{top, left}}>
                          <span className={theme.content()}>{tooltip}</span>
                      </span>,
                      document.body
                  )
                : null}
        </>
    );
}
