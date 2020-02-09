import * as React from "react";
import {TIME_PICKER} from "react-toolbox/lib/identifiers";
import {TimePickerTheme} from "react-toolbox/lib/time_picker";
import RTClock from "react-toolbox/lib/time_picker/Clock";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtTimePickerTheme from "react-toolbox/components/time_picker/theme.css";
const timePickerTheme: TimePickerTheme = rtTimePickerTheme;
export {timePickerTheme};

export interface ClockProps {
    display?: "hours" | "minutes";
    format?: "24hr" | "ampm";
    onChange?: Function;
    onHandMoved?: Function;
    theme?: CSSProp<TimePickerTheme>;
    time?: Date;
}

export const Clock = React.forwardRef<unknown, ClockProps>((props, ref) => {
    const theme = useTheme(TIME_PICKER, timePickerTheme, props.theme);
    return <RTClock ref={ref} {...props} theme={fromBem(theme)} />;
});

export {TimePickerTheme};
