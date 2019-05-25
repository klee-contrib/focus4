import * as React from "react";
import {PROGRESS_BAR} from "react-toolbox/lib/identifiers";
import {ProgressBar as RTProgressBar, ProgressBarProps, ProgressBarTheme} from "react-toolbox/lib/progress_bar";

import {useTheme} from "@focus4/styling";
import rtProgressBarTheme from "react-toolbox/components/progress_bar/theme.css";
const progressBarTheme: ProgressBarTheme = rtProgressBarTheme;
export {progressBarTheme};

export const ProgressBar = React.forwardRef<RTProgressBar, ProgressBarProps>((props, ref) => {
    const theme = useTheme(PROGRESS_BAR, progressBarTheme, props.theme);
    return <RTProgressBar ref={ref} {...props} theme={theme} />;
});

export {ProgressBarProps, ProgressBarTheme};
