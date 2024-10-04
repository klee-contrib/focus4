import classNames from "classnames";
import {cloneElement, PointerEvent, ReactElement, useCallback, useRef} from "react";

import {useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import rippleCss, {RippleCss} from "./__style__/ripple.css";
export {rippleCss};
export type {RippleCss};

export interface RippleProps<T extends HTMLElement = HTMLElement> extends PointerEvents<T> {
    /** Centre le ripple sur la cible au lieu de l'endroit cliqué. */
    centered?: boolean;
    /** Classe CSS à passer au Ripple */
    className?: string;
    /** Composant enfant dans lequel poser le ripple. */
    children: ReactElement;
    /** Force la désactivation du ripple. */
    disabled?: boolean;
    /** Classe CSS de l'élément HTML dans lequel poser le ripple, si ce n'est pas l'élément racine. */
    rippleTarget?: string;
}

/**
 * Le `Ripple` est un composant à poser autour d'un autre élément pour y ajouter un effet "ripple" lors du clic.
 *
 * Tous les composants qui attendent un clic d'un utilisateur dans leur action principale en sont munis.
 */
export function Ripple<T extends HTMLElement = HTMLElement>({
    centered,
    className,
    children,
    disabled,
    rippleTarget,
    ...props
}: RippleProps<T>) {
    const theme = useTheme("ripple", rippleCss, className ? {ripple: className} : {});

    const state = useRef({
        isPointerOut: false,
        isFinishing: new Set<HTMLDivElement>(),
        ripples: new Map<HTMLDivElement, Animation>()
    });

    const getOptions = useCallback(function getOptions(ripple: HTMLDivElement) {
        const parent = getComputedStyle(ripple?.parentElement ?? document.documentElement);
        return {
            easing: "ease-in-out",
            duration: toMs(parent.getPropertyValue("--ripple-duration")),
            opacity: parent.getPropertyValue("--ripple-opacity")
        };
    }, []);

    const onRippleFinish = useCallback(function onRippleFinish(ripple: HTMLDivElement) {
        if (!ripple || !state.current.isPointerOut || state.current.isFinishing.has(ripple)) {
            return;
        }
        const {opacity, ...options} = getOptions(ripple);
        state.current.isFinishing.add(ripple);
        const anim = ripple.animate([{opacity}, {opacity: 0}], options);
        anim.addEventListener(
            "finish",
            () => {
                if (ripple?.parentElement) {
                    ripple.parentElement.style.overflow = undefined!;
                    ripple.parentElement.style.clipPath = "";
                    ripple.remove();
                    state.current.ripples.delete(ripple);
                    state.current.isFinishing.delete(ripple);
                }
            },
            {once: true}
        );
    }, []);

    const clearRipples = useCallback(function clearRipples() {
        state.current.isPointerOut = true;
        state.current.ripples.forEach((_, ripple) => onRippleFinish(ripple));
    }, []);

    const addRipple = useCallback(
        function addRipple(lol: PointerEvent<T>) {
            const target = lol.nativeEvent.target as HTMLElement;
            if (!!disabled || target?.closest("[disabled]")) {
                return;
            }

            const event = lol.nativeEvent;
            const element =
                (rippleTarget ? lol.currentTarget.querySelector<HTMLElement>(`.${rippleTarget}`) : null) ??
                lol.currentTarget;

            state.current.isPointerOut = false;
            const ripple = document.createElement("div");

            const elementRect = element.getBoundingClientRect();
            const targetRect = (event.target as HTMLElement).getBoundingClientRect();
            const x = centered ? elementRect.width / 2 : event.offsetX + (targetRect.x - elementRect.x);
            const y = centered ? elementRect.height / 2 : event.offsetY + (targetRect.y - elementRect.y);
            const oWidth: number = element.offsetWidth;
            const oHeight: number = element.offsetHeight;

            const a = oWidth + 2 * Math.abs(oWidth / 2 - x);
            const b = oHeight + 2 * Math.abs(oHeight / 2 - y);
            const side = (a ** 2 + b ** 2) ** 0.5;

            ripple.className = classNames(theme.ripple(), className);
            ripple.style.top = `${y}px`;
            ripple.style.left = `${x}px`;
            ripple.style.width = `${side}px`;
            ripple.style.height = `${side}px`;

            element.style.overflow = "hidden";
            element.appendChild(ripple);

            const {opacity, ...options} = getOptions(ripple);
            const animation = ripple.animate(
                [
                    {
                        transform: "translate(-50%, -50%) scale(0)"
                    },
                    {
                        transform: "translate(-50%, -50%) scale(1)"
                    }
                ],
                {...options, fill: "forwards"}
            );
            animation.addEventListener("finish", () => onRippleFinish(ripple), {
                once: true
            });

            state.current.ripples.set(ripple, animation);
        },
        [className, centered, disabled, rippleTarget]
    );

    const onPointerDown = useCallback(
        function onPointerDown(e: PointerEvent<T>) {
            addRipple(e);
            props.onPointerDown?.(e);
        },
        [addRipple, props.onPointerDown]
    );

    const onPointerEnter = useCallback(
        function onPointerEnter(e: PointerEvent<T>) {
            state.current.isPointerOut = false;
            props.onPointerEnter?.(e);
        },
        [props.onPointerEnter]
    );

    const onPointerLeave = useCallback(
        function onPointerLeave(e: PointerEvent<T>) {
            clearRipples();
            props.onPointerLeave?.(e);
        },
        [clearRipples, props.onPointerLeave]
    );

    const onPointerUp = useCallback(
        function onPointerUp(e: PointerEvent<T>) {
            clearRipples();
            props.onPointerUp?.(e);
        },
        [clearRipples, props.onPointerUp]
    );

    return cloneElement(children, {onPointerDown, onPointerEnter, onPointerLeave, onPointerUp});
}

function toMs(d: string) {
    if (d.endsWith("ms")) {
        return +d.substring(0, d.length - 2);
    } else {
        return +d.substring(0, d.length - 1) * 1000;
    }
}
