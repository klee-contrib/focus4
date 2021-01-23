import {forwardRef} from "react";
import {PROGRESS_BAR} from "react-toolbox/lib/identifiers";
import {
    ProgressBar as RTProgressBar,
    ProgressBarProps as RTProgressBarProps,
    ProgressBarTheme
} from "react-toolbox/lib/progress_bar/ProgressBar";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtProgressBarTheme from "react-toolbox/components/progress_bar/theme.css";
const progressBarTheme: ProgressBarTheme = rtProgressBarTheme;
export {progressBarTheme};

type ProgressBarProps = Omit<RTProgressBarProps, "theme"> & {theme?: CSSProp<ProgressBarTheme>};
export const ProgressBar = forwardRef<RTProgressBar, ProgressBarProps>((props, ref) => {
    const theme = useTheme(PROGRESS_BAR, progressBarTheme, props.theme);
    return <RTProgressBar ref={ref} {...props} theme={fromBem(theme)} />;
});

export {ProgressBarProps, ProgressBarTheme};
