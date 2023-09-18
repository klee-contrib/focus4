import classNames from "classnames";
import {cloneElement, ReactElement, ReactNode, SyntheticEvent, useCallback, useRef} from "react";

import {useTheme} from "@focus4/styling";

import rippleCss, {RippleCss} from "./__style__/ripple.css";
export {rippleCss, RippleCss};

export interface RippleProps {
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
export function Ripple({centered, className, children, rippleTarget}: RippleProps) {
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
        function ripple({event, element}: {event: MouseEvent; element: HTMLElement}) {
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
        [className, centered]
    );

    const onPointerDown = useCallback(
        function onClick(event: SyntheticEvent) {
            const target = event.nativeEvent.target as HTMLElement;
            if (target?.closest("[disabled]")) {
                return;
            }
            ripple({
                event: event.nativeEvent as PointerEvent,
                element:
                    (rippleTarget ? event.currentTarget.querySelector(`.${rippleTarget}`) : null) ??
                    (event.currentTarget as HTMLElement)
            });
        },
        [ripple, rippleTarget]
    );

    return cloneElement(children as ReactElement, {
        onPointerDown,
        onPointerEnter: rippleIn,
        onPointerLeave: rippleOut,
        onPointerUp: rippleOut
    });
}

function toMs(d: string) {
    if (d.endsWith("ms")) {
        return +d.substring(0, d.length - 2);
    } else {
        return +d.substring(0, d.length - 1) * 1000;
    }
}
