import classNames from "classnames";
import {forwardRef, Ref, useCallback, useMemo} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import progressBarCss, {ProgressBarCss} from "./__style__/progress-bar.css";
export {progressBarCss, ProgressBarCss};

export interface ProgressBarProps extends PointerEvents<HTMLDivElement> {
    /** Value of a secondary progress bar useful for buffering. */
    buffer?: number;
    className?: string;
    /** Maximum value permitted. */
    max?: number;
    /** Minimum value permitted. */
    min?: number;
    /** Mode of the progress bar, it can be determinate or indeterminate. */
    mode?: "determinate" | "indeterminate";
    /** If true, the circular progress bar will be changing its color. */
    multicolor?: boolean;
    /** Classnames object defining the component style. */
    theme?: CSSProp<ProgressBarCss>;
    /** Type of the progress bar, it can be circular or linear. */
    type?: "circular" | "linear";
    /** Value of the current progress. */
    value?: number;
}

/**
 * Une barre de chargement ou un spinner (`linear` ou `circular`). Peut être utilisé de façon déterminée ou indéterminée.
 */
export const ProgressBar = forwardRef<HTMLDivElement | SVGSVGElement, ProgressBarProps>(function RTProgressBar(
    {
        buffer = 0,
        className = "",
        max = 100,
        min = 0,
        mode = "indeterminate",
        multicolor = false,
        onPointerDown,
        onPointerEnter,
        onPointerLeave,
        onPointerUp,
        theme: pTheme,
        type = "linear",
        value = 0
    },
    ref
) {
    const theme = useTheme("RTProgressBar", progressBarCss, pTheme);

    const calculateRatio = useCallback(
        (v: number) => {
            if (v < min) {
                return 0;
            }
            if (v > max) {
                return 1;
            }
            return (v - min) / (max - min);
        },
        [max, min]
    );

    const circularStyle = useMemo(
        () =>
            mode !== "indeterminate"
                ? {strokeDasharray: `${Math.PI * 2 * 25 * calculateRatio(value)}, 400`}
                : undefined,
        [calculateRatio, mode, value]
    );

    const linearStyle = useMemo(() => {
        if (mode !== "indeterminate") {
            return {
                buffer: {transform: `scaleX(${calculateRatio(buffer)})`},
                value: {transform: `scaleX(${calculateRatio(value)})`}
            };
        }
        return {};
    }, [buffer, calculateRatio, mode, value]);

    return (
        <div
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={value}
            className={classNames(
                theme.progressBar({[type]: true, indeterminate: mode === "indeterminate", multicolor}),
                className
            )}
            data-react-toolbox="progress-bar"
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
        >
            {type === "circular" ? (
                <svg ref={ref as Ref<SVGSVGElement>} className={theme.circle()} viewBox="0 0 60 60">
                    <circle className={theme.path()} cx="30" cy="30" r="25" style={circularStyle} />
                </svg>
            ) : (
                <div ref={ref as Ref<HTMLDivElement>}>
                    <span className={theme.buffer()} data-ref="buffer" style={linearStyle.buffer} />
                    <span className={theme.value()} data-ref="value" style={linearStyle.value} />
                </div>
            )}
        </div>
    );
});
