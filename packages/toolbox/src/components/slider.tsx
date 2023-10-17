import classNames from "classnames";
import {range} from "lodash";
import {PointerEvent as RPointerEvent, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {Ripple} from "./ripple";

import sliderCss, {SliderCss} from "./__style__/slider.css";
export {sliderCss, SliderCss};

export interface SliderProps extends PointerEvents<HTMLDivElement> {
    /** Classe CSS pour le composant racine. */
    className?: string;
    /** Désactive le Slider. */
    disabled?: boolean;
    /** Affiche un libellé au dessus de la poignée au survol avec la valeur exacte du Slider. */
    labeled?: boolean;
    /** Valeur maximale du Slider. Par défaut : 100. */
    max?: number;
    /** Valeur minimale du Slider. Par défaut : 0. */
    min?: number;
    /** Handler appelé au changement de la valeur du Slider. */
    onChange?: (value: number) => void;
    /** Valeur minimale par incrément du Slider. Par défaut : 1. */
    step?: number;
    /** Affiche des indicateurs pour chaque valeur de `step` sur le Slider. */
    ticks?: boolean;
    /** CSS. */
    theme?: CSSProp<SliderCss>;
    /** Valeur du Slider. */
    value: number;
}

/** Slider. */
export function Slider({
    className,
    disabled = false,
    labeled = false,
    max = 100,
    min = 0,
    onChange,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    step = 1,
    ticks = false,
    theme: pTheme,
    value
}: SliderProps) {
    const theme = useTheme("slider", sliderCss, pTheme);
    const track = useRef<HTMLDivElement>(null);

    const [focused, setFocused] = useState(false);

    // Taille du slider.
    const [width, setWidth] = useState(0);
    const [start, setStart] = useState(0);
    useLayoutEffect(() => {
        function getSize() {
            const {width: tw, x: tx} = track.current?.getBoundingClientRect() ?? {};
            setStart(tx ?? 0);
            setWidth(tw ?? 0);
        }

        getSize();
        if (track.current) {
            const observer = new ResizeObserver(getSize);
            observer.observe(track.current);
            return () => observer.disconnect();
        }
    }, []);

    // Sélection au pointeur.
    const handleChange = useCallback(
        function handleChange(x: number) {
            const decimals = (step.toString().split(".")[1] || []).length;
            const decimalPower = 10 ** decimals;

            const pos = ((x - start) / width) * (max - min);
            onChange?.(
                Math.round(Math.min(Math.max(Math.round(pos / step) * step + min, min), max) * decimalPower) /
                    decimalPower
            );
        },
        [max, min, onChange, start, width, step]
    );

    const handlePointerMove = useCallback(
        function handlePointerMove(e: PointerEvent) {
            e.stopPropagation();
            e.preventDefault();
            handleChange(e.pageX);
        },
        [handleChange]
    );

    const handlePointerUp = useCallback(
        function handlePointerUp(e: PointerEvent) {
            e.stopPropagation();
            e.preventDefault();
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
        },
        [handlePointerMove]
    );

    const handlePointerDown = useCallback(
        function handlePointerDown(e: RPointerEvent<HTMLDivElement>) {
            e.stopPropagation();
            e.preventDefault();
            handleChange(e.pageX);
            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
            onPointerDown?.(e);
        },
        [handlePointerMove]
    );

    // Navigation clavier.
    useEffect(() => {
        if (focused) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange?.(Math.max(min, value - step));
                } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange?.(Math.min(max, value + step));
                }
            };

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [focused, max, min, step, value]);

    const handleFocus = useCallback(function handleFocus() {
        setFocused(true);
    }, []);

    const handleBlur = useCallback(function handleBlur() {
        setFocused(false);
    }, []);

    const left = ((value - min) / (max - min)) * width;
    return (
        <Ripple
            onPointerDown={handlePointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            rippleTarget={theme.state()}
        >
            <div
                aria-disabled={disabled}
                aria-valuemax={max}
                aria-valuemin={min}
                aria-valuenow={value}
                className={classNames(theme.slider({disabled, labeled}), className)}
                role="slider"
            >
                <div ref={track} className={theme.track()} />
                <div className={theme.indicator()} data-value={value} style={{width: `${left}px`}} />
                {ticks ? (
                    <div className={theme.ticks()}>
                        {range(0, (max - min) / step + 1).map(i => (
                            <div key={`tick-${i}`} className={theme.tick({active: i * step <= value})} />
                        ))}
                    </div>
                ) : null}
                <div
                    className={theme.state()}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    style={{transform: `translateX(${left}px)`}}
                    tabIndex={0}
                >
                    <div className={theme.handle()} />
                </div>
            </div>
        </Ripple>
    );
}
