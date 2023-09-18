import classNames from "classnames";
import {cloneElement, PointerEvent, ReactElement, ReactNode, useCallback, useRef} from "react";

import {useTheme} from "@focus4/styling";

import {PointerEvents} from "../types/pointer-events";

import rippleCss, {RippleCss} from "./__style__/ripple.css";
export {rippleCss, RippleCss};

export interface RippleProps<T extends HTMLElement = HTMLElement> extends PointerEvents<T> {
    /** Centre le ripple sur la cible au lieu de l'endroit cliqué. */
    centered?: boolean;
    /** Classe CSS à passer au Ripple */
    className?: string;
    /** Composant enfant dans lequel poser le ripple. */
    children?: ReactNode;
    /** Classe CSS de l'élément HTML dans lequel poser le ripple, si ce n'est pas l'élément racine. */
    rippleTarget?: string;
}

/**
 * Pose un Ripple au clic sur le composant/élément enfant.
 */
export function Ripple<T extends HTMLElement = HTMLElement>({
    centered,
    className,
    children,
    rippleTarget,
    ...props
}: RippleProps<T>) {
    const theme = useTheme("RTRipple", rippleCss, className ? {ripple: className} : {});

    const rippleState = useRef({
        isPointerOut: false,
        isFinishing: false,
        animation: undefined as Animation | undefined,
        element: null as HTMLDivElement | null
    });

    const getOptions = useCallback(function getOptions() {
        return {
            easing: "ease-in-out",
            duration: toMs(
                getComputedStyle(
                    rippleState.current?.element?.parentElement ?? document.documentElement
                ).getPropertyValue("--ripple-duration")
            )
        };
    }, []);

    const onRippleFinish = useCallback(function onRippleFinish() {
        if (!rippleState.current.element || !rippleState.current.isPointerOut || rippleState.current.isFinishing) {
            return;
        }
        rippleState.current.isFinishing = true;
        const anim = rippleState.current.element.animate([{opacity: 0.12}, {opacity: 0}], getOptions());
        anim.addEventListener(
            "finish",
            () => {
                if (rippleState.current.element?.parentElement) {
                    rippleState.current.element.parentElement.style.overflow = undefined!;
                    rippleState.current.element.parentElement.style.clipPath = "";
                    rippleState.current.element.remove();
                    rippleState.current.element = null;
                    rippleState.current.animation = undefined;
                }
            },
            {once: true}
        );
    }, []);

    const rippleIn = useCallback(function rippleIn() {
        rippleState.current.isPointerOut = false;
    }, []);

    const rippleOut = useCallback(function rippleOut() {
        rippleState.current.isPointerOut = true;
        onRippleFinish();
    }, []);

    const ripple = useCallback(
        function ripple(lol: PointerEvent<T>) {
            const target = lol.nativeEvent.target as HTMLElement;
            if (target?.closest("[disabled]")) {
                return;
            }

            const event = lol.nativeEvent;
            const element =
                (rippleTarget ? lol.currentTarget.querySelector<HTMLElement>(`.${rippleTarget}`) : null) ??
                lol.currentTarget;

            rippleState.current.isPointerOut = false;
            rippleState.current.element ??= document.createElement("div");

            const elementRect = element.getBoundingClientRect();
            const targetRect = (event.target as HTMLElement).getBoundingClientRect();
            const x = centered ? elementRect.width / 2 : event.offsetX + (targetRect.x - elementRect.x);
            const y = centered ? elementRect.height / 2 : event.offsetY + (targetRect.y - elementRect.y);
            const oWidth: number = element.offsetWidth;
            const oHeight: number = element.offsetHeight;

            const a = oWidth + 2 * Math.abs(oWidth / 2 - x);
            const b = oHeight + 2 * Math.abs(oHeight / 2 - y);
            const side = (a ** 2 + b ** 2) ** 0.5;

            rippleState.current.element.className = classNames(theme.ripple(), className);
            rippleState.current.element.style.top = `${y}px`;
            rippleState.current.element.style.left = `${x}px`;
            rippleState.current.element.style.width = `${side}px`;
            rippleState.current.element.style.height = `${side}px`;

            if (!rippleState.current.element.parentElement) {
                element.style.overflow = "hidden";
                element.appendChild(rippleState.current.element);
            }

            if (!rippleState.current.animation) {
                rippleState.current.animation = rippleState.current.element.animate(
                    [
                        {
                            transform: "translate(-50%, -50%) scale(0)"
                        },
                        {
                            transform: "translate(-50%, -50%) scale(1)"
                        }
                    ],
                    {...getOptions(), fill: "forwards"}
                );
                rippleState.current.animation.addEventListener("finish", onRippleFinish, {
                    once: true
                });
            } else {
                for (const anim of rippleState.current.element.getAnimations()) {
                    anim.cancel();
                }
                rippleState.current.animation.play();
            }

            rippleState.current.isFinishing = false;
        },
        [className, centered, rippleTarget]
    );

    const onPointerDown = useCallback(
        function onPointerDown(e: PointerEvent<T>) {
            ripple(e);
            props.onPointerDown?.(e);
        },
        [ripple, props.onPointerDown]
    );

    const onPointerEnter = useCallback(
        function onPointerEnter(e: PointerEvent<T>) {
            rippleIn();
            props.onPointerEnter?.(e);
        },
        [rippleIn, props.onPointerEnter]
    );

    const onPointerLeave = useCallback(
        function onPointerLeave(e: PointerEvent<T>) {
            rippleOut();
            props.onPointerLeave?.(e);
        },
        [rippleOut, props.onPointerLeave]
    );

    const onPointerUp = useCallback(
        function onPointerUp(e: PointerEvent<T>) {
            rippleOut();
            props.onPointerUp?.(e);
        },
        [rippleOut, props.onPointerUp]
    );

    return cloneElement(children as ReactElement, {onPointerDown, onPointerEnter, onPointerLeave, onPointerUp});
}

function toMs(d: string) {
    if (d.endsWith("ms")) {
        return +d.substring(0, d.length - 2);
    } else {
        return +d.substring(0, d.length - 1) * 1000;
    }
}
