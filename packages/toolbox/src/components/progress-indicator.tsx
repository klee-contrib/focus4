import classNames from "classnames";
import {useEffect, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import progressIndicatorCss, {ProgressIndicatorCss} from "./__style__/progress-indicator.css";

export {progressIndicatorCss};
export type {ProgressIndicatorCss};

export interface ProgressIndicatorProps extends PointerEvents<HTMLDivElement> {
    /** Classe CSS pour l'élément racine. */
    className?: string;
    /** Progression indéterminée */
    indeterminate?: boolean;
    /** Valeur maximum. Par défaut: 100. */
    max?: number;
    /** Valeur minimum. Par défaut: 0. */
    min?: number;
    /** CSS. */
    theme?: CSSProp<ProgressIndicatorCss>;
    /** Valeur courante (entre `min` et `max`). Par défaut : 0. */
    value?: number;
}

/**
 * Un indicateur de chargement permet d'afficher le status d'un processus en cours, ici sous forme circulaire.
 *
 * Il peut indiquer une progression déterminée comme indéterminée.
 */
export function CircularProgressIndicator({
    className,
    indeterminate = false,
    max = 100,
    min = 0,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme,
    value = 0
}: ProgressIndicatorProps) {
    const theme = useTheme("progressIndicator", progressIndicatorCss, pTheme);

    const indicatorRef = useRef<SVGCircleElement>(null);
    const animation = useRef<Animation>(null);

    useEffect(() => {
        if (indicatorRef.current) {
            if (indeterminate) {
                animation.current = indicatorRef.current.animate(
                    [
                        {
                            strokeDasharray: "100 100",
                            strokeDashoffset: "100",
                            transform: "rotate(-90deg)"
                        },
                        {
                            strokeDasharray: "100 100",
                            strokeDashoffset: "-100",
                            transform: "rotate(270deg)"
                        }
                    ],
                    {
                        duration: getDuration(indicatorRef.current),
                        iterations: Infinity,
                        fill: "none"
                    }
                );
            } else {
                animation.current?.cancel();
            }
        }
    }, [indeterminate]);

    value = Math.max(Math.min(value, max), min);
    const progress = ((value - min) / (max - min)) * 100;

    return (
        <div
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={value}
            className={classNames(theme.circular(), className)}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            role="progressbar"
        >
            <svg viewBox="0 0 48 48">
                <circle className={theme.track()} cx="24" cy="24" r="17" />
                <circle
                    ref={indicatorRef}
                    className={theme.indicator({circular: true})}
                    cx="24"
                    cy="24"
                    pathLength={100}
                    r="17"
                    strokeDasharray={!indeterminate ? `${progress} ${100 - progress}` : ""}
                    strokeDashoffset="0"
                />
            </svg>
        </div>
    );
}

/**
 * Un indicateur de chargement permet d'afficher le status d'un processus en cours, ici sous forme linéaire.
 *
 * Il peut indiquer une progression déterminée comme indéterminée.
 */
export function LinearProgressIndicator({
    className,
    indeterminate = false,
    max = 100,
    min = 0,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme,
    value = 0
}: ProgressIndicatorProps) {
    const theme = useTheme("progressIndicator", progressIndicatorCss, pTheme);

    const indicatorRef = useRef<SVGLineElement>(null);
    const animation = useRef<Animation>(null);

    useEffect(() => {
        if (indicatorRef.current) {
            if (indeterminate) {
                animation.current = indicatorRef.current.animate(
                    [
                        {
                            strokeDasharray: "0 100",
                            strokeDashoffset: "0",
                            offset: 0
                        },
                        {
                            strokeDasharray: "95 5",
                            strokeDashoffset: "0",
                            offset: 0.25
                        },
                        {
                            strokeDasharray: "100 0",
                            strokeDashoffset: "0",
                            offset: 0.45
                        },
                        {
                            strokeDasharray: "100 0",
                            strokeDashoffset: "0",
                            offset: 0.55
                        },
                        {
                            strokeDasharray: "5 95",
                            strokeDashoffset: "-95",
                            offset: 0.9
                        },
                        {
                            strokeDasharray: "0 100",
                            strokeDashoffset: "-100",
                            offset: 1
                        }
                    ],
                    {
                        duration: getDuration(indicatorRef.current),
                        easing: "ease-in-out",
                        iterations: Infinity,
                        fill: "none"
                    }
                );
            } else {
                animation.current?.cancel();
            }
        }
    }, [indeterminate]);

    value = Math.max(Math.min(value, max), min);
    const progress = ((value - min) / (max - min)) * 100;

    return (
        <div
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={value}
            className={classNames(theme.linear(), className)}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            role="progressbar"
        >
            <svg preserveAspectRatio="none" viewBox="0 0 100 4">
                <line className={theme.track({linear: true})} pathLength={100} x1="0" x2="100" y1="2" y2="2" />
                <line
                    ref={indicatorRef}
                    className={theme.indicator({linear: true})}
                    pathLength={100}
                    strokeDasharray={!indeterminate ? `${progress} ${100 - progress}` : ""}
                    x1="0"
                    x2="100"
                    y1="2"
                    y2="2"
                />
            </svg>
        </div>
    );
}

function getDuration(element: Element) {
    const durationRaw = getComputedStyle(element).getPropertyValue(`--progress-indicator-animation-duration`);

    return durationRaw.endsWith("ms")
        ? +durationRaw.replace("ms", "")
        : durationRaw.endsWith("s")
          ? +durationRaw.replace("s", "") * 1000
          : +durationRaw;
}
