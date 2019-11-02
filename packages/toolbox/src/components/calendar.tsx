import * as React from "react";
import {DatePickerLocale, DatePickerTheme} from "react-toolbox/lib/date_picker";
import calendarFactory from "react-toolbox/lib/date_picker/Calendar";
import {DATE_PICKER} from "react-toolbox/lib/identifiers";

import {fromBem, useTheme} from "@focus4/styling";
import rtDatePickerTheme from "react-toolbox/components/date_picker/theme.css";
const datePickerTheme: DatePickerTheme = rtDatePickerTheme;
export {datePickerTheme};

import {IconButton} from "./button";

export interface CalendarProps {
    disabledDates?: Date[];
    display?: "months" | "years";
    enabledDates?: Date[];
    handleSelect?: Function;
    locale?: string | DatePickerLocale;
    maxDate?: Date;
    minDate?: Date;
    onChange: Function;
    selectedDate?: Date;
    sundayFirstDayOfWeek?: boolean;
    theme?: {};
}

const RTCalendar = calendarFactory(IconButton);
export const Calendar = React.forwardRef<unknown, CalendarProps>((props, ref) => {
    const theme = useTheme(DATE_PICKER, datePickerTheme, props.theme);
    return <RTCalendar ref={ref} {...props} theme={fromBem(theme)} />;
});

export {DatePickerTheme};
