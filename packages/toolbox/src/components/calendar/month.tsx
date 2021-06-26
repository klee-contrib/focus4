import range from "ramda/src/range";
import {useCallback, useMemo} from "react";
import {DatePickerLocale, DatePickerTheme} from "react-toolbox/lib/date_picker";
import time from "react-toolbox/lib/utils/time";

import {ToBem} from "@focus4/styling";

import {Day} from "./day";

export interface MonthProps {
    disabledDates?: Date[];
    enabledDates?: Date[];
    locale?: string | DatePickerLocale;
    maxDate?: Date;
    minDate?: Date;
    onDayClick: (day: number) => void;
    selectedDate: Date;
    sundayFirstDayOfWeek: boolean;
    theme: ToBem<DatePickerTheme>;
    viewDate: Date;
}

export function Month({
    disabledDates = [],
    enabledDates = [],
    locale,
    maxDate,
    minDate,
    onDayClick,
    selectedDate,
    sundayFirstDayOfWeek,
    theme,
    viewDate
}: MonthProps) {
    const isDayDisabled = useCallback(
        (date: Date) => {
            const compareDate = (compDate: Date) => date.getTime() === compDate.getTime();
            const dateInDisabled = disabledDates.filter(compareDate).length > 0;
            const dateInEnabled = enabledDates.filter(compareDate).length > 0;
            return (
                time.dateOutOfRange(date, minDate, maxDate) ||
                (enabledDates.length > 0 && !dateInEnabled) ||
                dateInDisabled
            );
        },
        [disabledDates, enabledDates, maxDate, minDate]
    );

    const days = useMemo(
        () =>
            range(1, time.getDaysInMonth(viewDate) + 1).map(i => {
                const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
                return (
                    <Day
                        key={i}
                        day={i}
                        disabled={isDayDisabled(date)}
                        onClick={onDayClick}
                        selectedDate={selectedDate}
                        sundayFirstDayOfWeek={sundayFirstDayOfWeek}
                        theme={theme}
                        viewDate={viewDate}
                    />
                );
            }),
        [isDayDisabled, onDayClick, selectedDate, sundayFirstDayOfWeek, theme, viewDate]
    );

    const weeks = useMemo(() => {
        const dayLabels = range(0, 7).map(d => time.getDayOfWeekLetter(d, locale));
        const source = sundayFirstDayOfWeek ? dayLabels : [...dayLabels.slice(1), dayLabels[0]];
        return source.map((day, i) => <span key={i}>{day}</span>);
    }, [locale, sundayFirstDayOfWeek]);

    const fullMonth = time.getFullMonth(viewDate, locale);
    const fullYear = viewDate.getFullYear();

    return (
        <div data-react-toolbox="month" className={theme.month()}>
            <span className={theme.title()}>
                {fullMonth} {fullYear}
            </span>
            <div className={theme.week()}>{weeks}</div>
            <div className={theme.days()}>{days}</div>
        </div>
    );
}
