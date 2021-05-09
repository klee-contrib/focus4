import classnames from "classnames";
import {forwardRef, Ref, useCallback, useMemo} from "react";
import {PROGRESS_BAR} from "react-toolbox/lib/identifiers";
import {ProgressBarTheme} from "react-toolbox/lib/progress_bar/ProgressBar";
import prefixer from "react-toolbox/lib/utils/prefixer";

import {CSSProp, useTheme} from "@focus4/styling";
import rtProgressBarTheme from "react-toolbox/components/progress_bar/theme.css";
const progressBarTheme: ProgressBarTheme = rtProgressBarTheme;
export {progressBarTheme, ProgressBarTheme};

export interface ProgressBarProps {
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
    theme?: CSSProp<ProgressBarTheme>;
    /** Type of the progress bar, it can be circular or linear. */
    type?: "linear" | "circular";
    /** Value of the current progress. */
    value?: number;
}

export const ProgressBar = forwardRef(function RTProgressBar(
    {
        buffer = 0,
        className = "",
        max = 100,
        min = 0,
        mode = "indeterminate",
        multicolor = false,
        type = "linear",
        value = 0,
        theme: pTheme
    }: ProgressBarProps,
    ref: Ref<HTMLDivElement | SVGSVGElement>
) {
    const theme = useTheme(PROGRESS_BAR, progressBarTheme, pTheme);

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

    const circularStyle = useMemo(() => {
        return mode !== "indeterminate"
            ? {strokeDasharray: `${2 * Math.PI * 25 * calculateRatio(value)}, 400`}
            : undefined;
    }, [calculateRatio, mode, value]);

    const linearStyle = useMemo(() => {
        if (mode !== "indeterminate") {
            return {
                buffer: prefixer({transform: `scaleX(${calculateRatio(buffer)})`}),
                value: prefixer({transform: `scaleX(${calculateRatio(value)})`})
            };
        }
        return {};
    }, [buffer, calculateRatio, mode, value]);

    const _className = classnames(
        theme[type](),
        {
            [theme.indeterminate()]: mode === "indeterminate",
            [theme.multicolor()]: multicolor
        },
        className
    );

    return (
        <div
            data-react-toolbox="progress-bar"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            className={_className}
        >
            {type === "circular" ? (
                <svg ref={ref as Ref<SVGSVGElement>} className={theme.circle()} viewBox="0 0 60 60">
                    <circle className={theme.path()} style={circularStyle} cx="30" cy="30" r="25" />
                </svg>
            ) : (
                <div ref={ref as Ref<HTMLDivElement>}>
                    <span data-ref="buffer" className={theme.buffer()} style={linearStyle.buffer} />
                    <span data-ref="value" className={theme.value()} style={linearStyle.value} />
                </div>
            )}
        </div>
    );
});
