import range from "ramda/src/range";
import {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import rtDatePickerTheme from "react-toolbox/components/date_picker/theme.css";
import {DatePickerLocale, DatePickerTheme} from "react-toolbox/lib/date_picker";
import {DATE_PICKER} from "react-toolbox/lib/identifiers";
import time from "react-toolbox/lib/utils/time";
import {getAnimationModule} from "react-toolbox/lib/utils/utils";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, useTheme} from "@focus4/styling";
const datePickerTheme: DatePickerTheme = rtDatePickerTheme;
export {datePickerTheme, DatePickerTheme};

import {IconButton} from "../button";
import {Month} from "./month";

export interface CalendarProps {
    disabledDates?: Date[];
    display?: "months" | "years";
    enabledDates?: Date[];
    handleSelect?: Function;
    locale?: string | DatePickerLocale;
    maxDate?: Date;
    minDate?: Date;
    onChange: (date: Date, dayClick: boolean) => void;
    selectedDate?: Date;
    sundayFirstDayOfWeek?: boolean;
    theme?: CSSProp<DatePickerTheme>;
}

export function Calendar({
    disabledDates,
    display = "months",
    enabledDates,
    handleSelect,
    locale,
    onChange,
    maxDate,
    minDate,
    selectedDate = new Date(),
    sundayFirstDayOfWeek = false,
    theme: pTheme
}: CalendarProps) {
    const theme = useTheme(DATE_PICKER, datePickerTheme, pTheme);
    const yearsNode = useRef<HTMLUListElement | null>(null);
    const activeYearNode = useRef<HTMLLIElement | null>(null);

    const [direction, setDirection] = useState<"left" | "right">("right");
    const [viewDate, setViewDate] = useState(selectedDate);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            const handleDayArrowKey = (date: Date) => {
                setViewDate(date);
                onChange(date, false);
            };

            switch (e.key) {
                case "Enter":
                    e.preventDefault();
                    handleSelect?.();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    handleDayArrowKey(time.addDays(selectedDate, -1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    handleDayArrowKey(time.addDays(selectedDate, -7));
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    handleDayArrowKey(time.addDays(selectedDate, 1));
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    handleDayArrowKey(time.addDays(selectedDate, 7));
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", handleKeys);
        return () => document.removeEventListener("keydown", handleKeys);
    }, [handleSelect, onChange, selectedDate]);

    useEffect(() => {
        if (activeYearNode.current && yearsNode.current) {
            const offset = yearsNode.current.offsetHeight / 2 + activeYearNode.current.offsetHeight / 2;
            yearsNode.current.scrollTop = activeYearNode.current.offsetTop - offset;
        }
    });

    const handleDayClick = useCallback(
        (day: number) => {
            onChange(time.setDay(viewDate, day), true);
        },
        [onChange, viewDate]
    );

    const handleYearClick = useCallback(
        (event: MouseEvent<HTMLLIElement>) => {
            const year = parseInt(event.currentTarget.id, 10);
            const vDate = time.setYear(selectedDate, year);
            setViewDate(vDate);
            onChange(vDate, false);
        },
        [onChange, selectedDate]
    );

    const changeViewMonth = useCallback(
        (dir: "left" | "right") => {
            setDirection(dir);
            setViewDate(time.addMonths(viewDate, dir === "left" ? -1 : 1));
        },
        [viewDate]
    );

    const years = useMemo(
        () => (
            <ul data-react-toolbox="years" className={theme.years()} ref={yearsNode}>
                {range(1900, 2100).map(year => (
                    <li
                        className={year === viewDate.getFullYear() ? theme.active() : ""}
                        id={`${year}`}
                        key={year}
                        onClick={handleYearClick}
                        ref={node => {
                            if (year === viewDate.getFullYear()) {
                                activeYearNode.current = node;
                            }
                        }}
                    >
                        {year}
                    </li>
                ))}
            </ul>
        ),
        [handleYearClick, theme, viewDate]
    );

    const months = useMemo(() => {
        const animation = direction === "left" ? "slideLeft" : "slideRight";
        const animationModule = getAnimationModule(animation, theme);
        return (
            <div data-react-toolbox="calendar">
                <IconButton className={theme.prev()} icon="chevron_left" onClick={() => changeViewMonth("left")} />
                <IconButton className={theme.next()} icon="chevron_right" onClick={() => changeViewMonth("right")} />
                <TransitionGroup component={null}>
                    <CSSTransition classNames={animationModule} timeout={350}>
                        <Month
                            disabledDates={disabledDates}
                            enabledDates={enabledDates}
                            key={viewDate.getMonth()}
                            locale={locale}
                            maxDate={maxDate}
                            minDate={minDate}
                            onDayClick={handleDayClick}
                            selectedDate={selectedDate}
                            sundayFirstDayOfWeek={sundayFirstDayOfWeek}
                            theme={theme}
                            viewDate={viewDate}
                        />
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }, [
        changeViewMonth,
        direction,
        disabledDates,
        enabledDates,
        locale,
        handleDayClick,
        maxDate,
        minDate,
        selectedDate,
        sundayFirstDayOfWeek,
        theme,
        viewDate
    ]);

    return <div className={theme.calendar()}>{display === "months" ? months : years}</div>;
}
