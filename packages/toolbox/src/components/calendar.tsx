import {range} from "lodash";
import {DateTime} from "luxon";
import {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import {CSSProp, cssTransitionProps, fromBem, ToBem, useTheme} from "@focus4/styling";

import {IconButton} from "./icon-button";

import calendarCss, {CalendarCss} from "./__style__/calendar.css";
export {calendarCss, CalendarCss};

export interface CalendarProps {
    disabledDates?: Date[];
    display?: "months" | "years";
    enabledDates?: Date[];
    handleSelect?: () => void;
    maxDate?: Date;
    minDate?: Date;
    onChange: (date: Date, dayClick: boolean) => void;
    selectedDate?: Date;
    sundayFirstDayOfWeek?: boolean;
    theme?: CSSProp<CalendarCss>;
}

/**
 * Affiche un calendrier. Utilisé par l'[`InputDate`](components/forms.md#inputdate).
 */
export function Calendar({
    disabledDates,
    display = "months",
    enabledDates,
    handleSelect,
    onChange,
    maxDate,
    minDate,
    selectedDate = new Date(),
    sundayFirstDayOfWeek = false,
    theme: pTheme
}: CalendarProps) {
    const theme = useTheme("RTCalendar", calendarCss, pTheme);
    const yearsNode = useRef<HTMLUListElement | null>(null);
    const activeYearNode = useRef<HTMLLIElement | null>(null);

    const [pending, setPending] = useState<{days?: number; months?: number}>({});
    const [animation, setAnimation] = useState({enter: "", enterActive: "", exit: "", exitActive: ""});
    const [viewDate, setViewDate] = useState(selectedDate);

    const setAnimationLeft = useCallback(() => {
        const css = fromBem(theme);
        setAnimation({
            enter: css.slideLeftEnter!,
            enterActive: css.slideLeftEnterActive!,
            exit: css.slideLeftLeave!,
            exitActive: css.slideLeftLeaveActive!
        });
    }, [theme]);

    const setAnimationRight = useCallback(() => {
        const css = fromBem(theme);
        setAnimation({
            enter: css.slideRightEnter!,
            enterActive: css.slideRightEnterActive!,
            exit: css.slideRightLeave!,
            exitActive: css.slideRightLeaveActive!
        });
    }, [theme]);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            const handleDayArrowKey = (days: number) => {
                setPending({days});
                const newDate = new Date(selectedDate.getTime());
                newDate.setDate(selectedDate.getDate() + days);
                onChange(newDate, false);
            };

            switch (e.key) {
                case "Enter":
                    e.preventDefault();
                    handleSelect?.();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    handleDayArrowKey(-1);
                    setAnimationLeft();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    handleDayArrowKey(-7);
                    setAnimationLeft();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    handleDayArrowKey(+1);
                    setAnimationRight();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    handleDayArrowKey(+7);
                    setAnimationRight();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", handleKeys);
        return () => document.removeEventListener("keydown", handleKeys);
    }, [handleSelect, onChange, selectedDate, setAnimationLeft, setAnimationRight]);

    useEffect(() => {
        if (activeYearNode.current && yearsNode.current) {
            const offset = yearsNode.current.offsetHeight / 2 + activeYearNode.current.offsetHeight / 2;
            yearsNode.current.scrollTop = activeYearNode.current.offsetTop - offset;
        }
    });

    const handleDayClick = useCallback(
        (day: number) => {
            const newDate = new Date(viewDate.getTime());
            newDate.setDate(day);
            onChange(newDate, true);
        },
        [onChange, viewDate]
    );

    const handleYearClick = useCallback(
        (event: MouseEvent<HTMLLIElement>) => {
            const year = parseInt(event.currentTarget.id, 10);
            const newDate = new Date(selectedDate.getTime());
            newDate.setFullYear(year);
            setViewDate(newDate);
            onChange(newDate, false);
        },
        [onChange, selectedDate]
    );

    const years = useMemo(
        () => (
            <ul ref={yearsNode} className={theme.years()} data-react-toolbox="years">
                {range(1900, 2100).map(year => (
                    <li
                        key={year}
                        ref={node => {
                            if (year === viewDate.getFullYear()) {
                                activeYearNode.current = node;
                            }
                        }}
                        className={year === viewDate.getFullYear() ? theme.active() : ""}
                        id={`${year}`}
                        onClick={handleYearClick}
                    >
                        {year}
                    </li>
                ))}
            </ul>
        ),
        [handleYearClick, theme, viewDate]
    );

    useEffect(() => {
        if (pending.days) {
            const newDate = new Date(selectedDate.getTime());
            newDate.setDate(selectedDate.getDate() + pending.days);
            setViewDate(newDate);
            setPending({});
        } else if (pending.months) {
            const newDate = new Date(viewDate.getTime());
            newDate.setMonth(viewDate.getMonth() + pending.months);
            setViewDate(newDate);
            setPending({});
        }
    }, [pending, selectedDate, viewDate]);

    const months = useMemo(
        () => (
            <div data-react-toolbox="calendar">
                <IconButton
                    className={theme.prev()}
                    icon="chevron_left"
                    onClick={() => {
                        setAnimationLeft();
                        setPending({months: -1});
                    }}
                />
                <IconButton
                    className={theme.next()}
                    icon="chevron_right"
                    onClick={() => {
                        setAnimationRight();
                        setPending({months: +1});
                    }}
                />
                <TransitionGroup component={null}>
                    <CSSTransition key={viewDate.getMonth()} {...cssTransitionProps(animation)}>
                        <Month
                            disabledDates={disabledDates}
                            enabledDates={enabledDates}
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
        ),
        [
            disabledDates,
            enabledDates,
            handleDayClick,
            maxDate,
            minDate,
            selectedDate,
            setAnimationLeft,
            setAnimationRight,
            sundayFirstDayOfWeek,
            theme,
            viewDate
        ]
    );

    return <div className={theme.calendar()}>{display === "months" ? months : years}</div>;
}

interface MonthProps {
    disabledDates?: Date[];
    enabledDates?: Date[];
    maxDate?: Date;
    minDate?: Date;
    onDayClick: (day: number) => void;
    selectedDate: Date;
    sundayFirstDayOfWeek: boolean;
    theme: ToBem<CalendarCss>;
    viewDate: Date;
}

function Month({
    disabledDates = [],
    enabledDates = [],
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
                (!!minDate && !(date >= minDate)) ||
                (!!maxDate && !(date <= maxDate)) ||
                (enabledDates.length > 0 && !dateInEnabled) ||
                dateInDisabled
            );
        },
        [disabledDates, enabledDates, maxDate, minDate]
    );

    const days = useMemo(
        () =>
            range(1, getDaysInMonth(viewDate) + 1).map(i => {
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
        const dayLabels = range(1, 8).map(d =>
            DateTime.fromFormat(`${d}`, "c").toLocaleString({weekday: "short"}).toLowerCase()
        );
        const source = sundayFirstDayOfWeek ? [dayLabels[6], ...dayLabels.slice(0, 6)] : dayLabels;
        return source.map((day, i) => <span key={i}>{day}</span>);
    }, [sundayFirstDayOfWeek]);

    return (
        <div className={theme.month()} data-react-toolbox="month">
            <span className={theme.title()}>
                {DateTime.fromJSDate(viewDate).toLocaleString({month: "long", year: "numeric"})}
            </span>
            <div className={theme.week()}>{weeks}</div>
            <div className={theme.days()}>{days}</div>
        </div>
    );
}

function getDaysInMonth(d: Date) {
    const resultDate = new Date(d.getFullYear(), d.getMonth(), 1);
    resultDate.setMonth(resultDate.getMonth() + 1);
    resultDate.setDate(resultDate.getDate() - 1);
    return resultDate.getDate();
}

interface DayProps {
    day: number;
    disabled: boolean;
    onClick: (day: number) => void;
    selectedDate: Date;
    sundayFirstDayOfWeek: boolean;
    theme: ToBem<CalendarCss>;
    viewDate: Date;
}

function Day({day, disabled, onClick, selectedDate, sundayFirstDayOfWeek, theme, viewDate}: DayProps) {
    const handleClick = useCallback(() => {
        if (!disabled && onClick) {
            onClick(day);
        }
    }, [day, disabled, onClick]);

    const dayStyle = useMemo(() => {
        if (day === 1) {
            const e = sundayFirstDayOfWeek ? 0 : 1;
            const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() - e;
            return {
                marginLeft: `${(firstDay >= 0 ? firstDay : 6) * (100 / 7)}%`
            };
        }
        return undefined;
    }, [day, sundayFirstDayOfWeek, viewDate]);

    const active = useMemo(() => {
        const sameYear = viewDate.getFullYear() === selectedDate.getFullYear();
        const sameMonth = viewDate.getMonth() === selectedDate.getMonth();
        const sameDay = day === selectedDate.getDate();
        return sameYear && sameMonth && sameDay;
    }, [day, selectedDate, viewDate]);

    return (
        <div className={theme.day({active, disabled})} data-react-toolbox="day" style={dayStyle}>
            <span onClick={handleClick}>{day}</span>
        </div>
    );
}
