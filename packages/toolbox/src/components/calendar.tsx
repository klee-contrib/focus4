import classnames from "classnames";
import {AnimatePresence, motion} from "framer-motion";
import {groupBy, map, range, upperFirst} from "lodash";
import {DateTime} from "luxon";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {CSSProp, getSpringTransition, useTheme} from "@focus4/styling";

import {Button} from "./button";
import {IconButton} from "./icon-button";

import calendarCss, {CalendarCss} from "./__style__/calendar.css";
export {calendarCss, CalendarCss};

export interface CalendarProps {
    /** Classe CSS pour le composant racine. */
    className?: string;
    /** Date maximale autorisée pour la saisie. */
    max?: string;
    /** Date minimale autorisée pour la saisie. */
    min?: string;
    /**
     * Format de la date retournée par le Calendar. "yyyy-MM" limite la sélection à un mois uniquement, tandis que "yyyy" la limite à une année.
     * Par défaut : "yyyy-MM-dd"
     */
    format?: "yyyy-MM-dd" | "yyyy-MM" | "yyyy";
    /** Handler appelé à la sélection d'une date. */
    onChange?: (value: string) => void;
    /** CSS. */
    theme?: CSSProp<CalendarCss>;
    /** Date. */
    value?: string;
}

/**
 * Calendrier permettant de choisir un jour, un mois ou une année. Utilisé par `InputDate`.
 */
export function Calendar({className, max, min, format = "yyyy-MM-dd", onChange, theme: pTheme, value}: CalendarProps) {
    const theme = useTheme("calendar", calendarCss, pTheme);

    const [date, setDate] = useState(value ? DateTime.fromISO(DateTime.fromISO(value).toFormat(format)) : undefined);
    useEffect(
        () => setDate(value ? DateTime.fromISO(DateTime.fromISO(value).toFormat(format)) : undefined),
        [format, value]
    );

    const [maxDate, setMaxDate] = useState(max ? DateTime.fromISO(DateTime.fromISO(max).toFormat(format)) : undefined);
    useEffect(
        () => setMaxDate(max ? DateTime.fromISO(DateTime.fromISO(max).toFormat(format)) : undefined),
        [format, max]
    );

    const [minDate, setMinDate] = useState(min ? DateTime.fromISO(DateTime.fromISO(min).toFormat(format)) : undefined);
    useEffect(
        () => setMinDate(min ? DateTime.fromISO(DateTime.fromISO(min).toFormat(format)) : undefined),
        [format, min]
    );

    const [viewChange, setViewChange] = useState<
        "days-to-months" | "months-to-days" | "months-to-years" | "years-to-months"
    >(format === "yyyy" ? "months-to-years" : format === "yyyy-MM" ? "days-to-months" : "months-to-days");
    const view = viewChange === "months-to-days" ? "days" : viewChange === "months-to-years" ? "years" : "months";
    const viewFormat = view === "days" ? "yyyy-MM-dd" : view === "months" ? "yyyy-MM" : "yyyy";

    const [displayedMonth, setDisplayedMonth] = useState(
        DateTime.fromISO((date ? date : DateTime.now()).toFormat("yyyyMM"))
    );

    const lines = useMemo(() => {
        if (view === "days") {
            const w = map(
                groupBy(
                    range(1, displayedMonth.daysInMonth).map(day => displayedMonth.set({day})),
                    getWeekNumber
                ),
                (items, line) => ({line, items})
            );

            while (w[0].items.length < 7) {
                w[0].items.splice(0, 0, w[0].items[0].minus({day: 1}));
            }

            while (w[w.length - 1].items.length < 7) {
                w[w.length - 1].items.push(w[w.length - 1].items[w[w.length - 1].items.length - 1].plus({day: 1}));
            }

            while (w.length < 6) {
                const nextDay = w[w.length - 1].items[w[w.length - 1].items.length - 1].plus({day: 1});
                w.push({
                    line: getWeekNumber(nextDay),
                    items: range(0, 7).map(day => nextDay.plus({day}))
                });
            }

            return w;
        } else if (view === "months") {
            const startMonth = DateTime.fromObject({year: displayedMonth.year, month: 1});
            return map(
                groupBy(
                    range(0, 12).map(month => startMonth.plus({month})),
                    m => `${m.year}-${m.month - ((m.month - 1) % 3)}`
                ),
                (items, line) => ({line, items})
            );
        } else {
            const start = +`${displayedMonth.year.toString().substring(0, 3)}0`;

            const years = map(
                groupBy(
                    range(0, 10).map(i => DateTime.fromObject({year: start + i})),
                    y => y.year - (y.year % 3)
                ),
                (items, line) => ({line, items})
            );

            while (years[0].items.length < 3) {
                years[0].items.splice(0, 0, years[0].items[0].minus({year: 1}));
            }

            while (years[years.length - 1].items.length < 3) {
                years[years.length - 1].items.push(
                    years[years.length - 1].items[years[years.length - 1].items.length - 1].plus({year: 1})
                );
            }

            return years;
        }
    }, [displayedMonth, view]);

    const isDisabled = useCallback(
        function isDisabled(d: DateTime) {
            return !!(maxDate && maxDate.toMillis() < d.toMillis()) || !!(minDate && minDate.toMillis() > d.toMillis());
        },
        [maxDate, minDate]
    );

    const root = useRef<HTMLDivElement>(null);
    const main = useRef<HTMLDivElement>(null);
    const [focused, setFocused] = useState(false);
    const [showRing, setShowRing] = useState(false);

    const [focusedDate, setFocusedDate] = useState((date ?? DateTime.now()).toFormat(viewFormat));
    useEffect(() => {
        let newDate = date ?? DateTime.now();

        if (newDate.toMillis() < lines[0].items[0].toMillis()) {
            newDate = lines[1].items[1];
        } else if (
            newDate.toMillis() > lines[lines.length - 1].items[lines[lines.length - 1].items.length - 1].toMillis()
        ) {
            newDate = lines[lines.length - 2].items[lines[lines.length - 2].items.length - 2];
        }

        setFocusedDate(newDate.toFormat(viewFormat));
        if (showRing) {
            setTimeout(
                () =>
                    main.current
                        ?.querySelector<HTMLButtonElement>(`[data-date='${newDate.toFormat(viewFormat)}']`)
                        ?.focus(),
                0
            );
        }
    }, [date, focused, showRing, viewFormat]);

    const onKeyDown = useCallback(
        function onKeyDown(e: KeyboardEvent) {
            const change =
                e.key === "ArrowLeft"
                    ? -1
                    : e.key === "ArrowRight"
                    ? 1
                    : e.key === "ArrowUp" && view === "days"
                    ? -7
                    : e.key === "ArrowUp"
                    ? -3
                    : e.key === "ArrowDown" && view === "days"
                    ? 7
                    : e.key === "ArrowDown"
                    ? 3
                    : 0;

            if (change) {
                const newDate = DateTime.fromFormat(focusedDate, viewFormat).plus(
                    view === "days" ? {day: change} : view === "months" ? {month: change} : {year: change}
                );

                if (isDisabled(newDate)) {
                    return;
                }

                setFocusedDate(newDate.toFormat(viewFormat));

                if (newDate.toMillis() < lines[0].items[0].toMillis()) {
                    setDisplayedMonth(
                        displayedMonth.minus(view === "days" ? {month: 1} : view === "months" ? {year: 1} : {year: 10})
                    );
                } else if (
                    newDate.toMillis() >
                    lines[lines.length - 1].items[lines[lines.length - 1].items.length - 1].toMillis()
                ) {
                    setDisplayedMonth(
                        displayedMonth.plus(view === "days" ? {month: 1} : view === "months" ? {year: 1} : {year: 10})
                    );
                }

                setTimeout(
                    () =>
                        main.current
                            ?.querySelector<HTMLButtonElement>(`[data-date='${newDate.toFormat(viewFormat)}']`)
                            ?.focus(),
                    0
                );
            }

            if (e.key === "PageUp" && view !== "years") {
                setViewChange(view === "months" ? "months-to-years" : "days-to-months");
            }
        },
        [displayedMonth, focusedDate, isDisabled, lines, view, viewFormat]
    );

    useEffect(() => {
        if (focused && main.current) {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [focused, onKeyDown]);

    const willShowRing = useRef(true);

    return (
        <div
            ref={root}
            className={classnames(className, theme.calendar({focused: showRing}))}
            onBlur={() => {
                setFocused(false);
                setShowRing(false);
            }}
            onClick={e => {
                setShowRing(false);
                willShowRing.current = e.pageX === 0 && e.pageY === 0;
                setFocused(true);
                root.current?.focus();
                willShowRing.current = true;
            }}
            onFocus={() => {
                setFocused(true);
                if (willShowRing.current) {
                    setShowRing(true);
                }
            }}
            onPointerDown={() => {
                willShowRing.current = false;
                setShowRing(false);
            }}
            tabIndex={focused ? -1 : 0}
        >
            <div className={theme.header()}>
                <Button
                    disabled={view === "years"}
                    icon={view === "days" ? "calendar_month" : "calendar_today"}
                    label={
                        view === "days"
                            ? upperFirst(displayedMonth.toLocaleString({month: "long", year: "numeric"}))
                            : view === "months"
                            ? displayedMonth.year.toString()
                            : `${displayedMonth.year.toString().substring(0, 3)}0 - ${displayedMonth.year
                                  .toString()
                                  .substring(0, 3)}9`
                    }
                    onClick={() => setViewChange(view === "days" ? "days-to-months" : "months-to-years")}
                    tabIndex={-1}
                />
                <div className={theme.controls()}>
                    <IconButton
                        icon="keyboard_arrow_up"
                        onClick={() =>
                            setDisplayedMonth(
                                displayedMonth.minus(
                                    view === "days" ? {month: 1} : view === "months" ? {year: 1} : {year: 10}
                                )
                            )
                        }
                        tabIndex={-1}
                    />
                    <IconButton
                        icon="keyboard_arrow_down"
                        onClick={() =>
                            setDisplayedMonth(
                                displayedMonth.plus(
                                    view === "days" ? {month: 1} : view === "months" ? {year: 1} : {year: 10}
                                )
                            )
                        }
                        tabIndex={-1}
                    />
                </div>
            </div>
            <div ref={main} className={theme.main()}>
                <AnimatePresence custom={viewChange} initial={false}>
                    <motion.div
                        key={view}
                        animate="animate"
                        className={theme[view]()}
                        custom={viewChange}
                        exit="exit"
                        initial="initial"
                        transition={getSpringTransition()}
                        variants={{
                            animate: {opacity: 1, scale: 1, transition: {delay: 0.2}},
                            exit:
                                view === "years"
                                    ? {opacity: 0, scale: 1.25}
                                    : view === "days"
                                    ? {opacity: 0, scale: 0.8}
                                    : v => ({
                                          opacity: 0,
                                          scale: v === "years-to-months" || v === "months-to-days" ? 1.25 : 0.8
                                      }),
                            initial:
                                view === "years" || view === "days"
                                    ? {opacity: 0, scale: 0.8}
                                    : v => ({
                                          opacity: 0,
                                          scale: v === "years-to-months" || v === "days-to-months" ? 0.8 : 1.25
                                      })
                        }}
                    >
                        {view === "days" ? (
                            <div className={theme.weekdays()}>
                                {lines[0].items.map(d => (
                                    <div key={d.weekday} className={theme.weekday()}>
                                        {d.weekdayShort}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {lines.map(l => (
                            <div key={l.line}>
                                {l.items.map(d => (
                                    <Button
                                        key={view === "days" ? d.day : view === "months" ? d.month : d.year}
                                        className={
                                            view === "days"
                                                ? theme.day({outside: d.month !== displayedMonth.month})
                                                : view === "months"
                                                ? theme.month({outside: d.year !== displayedMonth.year})
                                                : theme.year({
                                                      outside:
                                                          d.year.toString()[2] !== displayedMonth?.year.toString()[2]
                                                  })
                                        }
                                        color={
                                            (view === "days" &&
                                                ((!!date && d.equals(date)) ||
                                                    d.equals(
                                                        DateTime.now().set({
                                                            hour: 0,
                                                            minute: 0,
                                                            second: 0,
                                                            millisecond: 0
                                                        })
                                                    ))) ||
                                            (view === "months" &&
                                                ((d.year === date?.year && d.month === date?.month) ||
                                                    (d.year === DateTime.now().year &&
                                                        d.month === DateTime.now().month))) ||
                                            (view === "years" &&
                                                (d.year === date?.year || d.year === DateTime.now().year))
                                                ? "primary"
                                                : undefined
                                        }
                                        data-date={d.toFormat(viewFormat)}
                                        disabled={isDisabled(d)}
                                        label={
                                            view === "days"
                                                ? d.day.toString()
                                                : view === "months"
                                                ? d.monthLong!
                                                : d.year.toString()
                                        }
                                        onClick={e => {
                                            if (viewFormat === format) {
                                                onChange?.(d.toFormat(format));
                                                setTimeout(() => (e.target as HTMLElement)?.focus(), 0);
                                            } else {
                                                setDisplayedMonth(d);
                                                setViewChange(view === "months" ? "months-to-days" : "years-to-months");
                                            }
                                        }}
                                        tabIndex={-1}
                                        variant={
                                            (view === "years" && d.year === date?.year) ||
                                            (view === "months" && d.year === date?.year && d.month === date?.month) ||
                                            (view === "days" && date && d.equals(date))
                                                ? "filled"
                                                : (view === "years" && d.year === DateTime.now().year) ||
                                                  (view === "months" &&
                                                      d.year === DateTime.now().year &&
                                                      d.month === DateTime.now().month) ||
                                                  (view === "days" &&
                                                      d.equals(
                                                          DateTime.now().set({
                                                              hour: 0,
                                                              minute: 0,
                                                              second: 0,
                                                              millisecond: 0
                                                          })
                                                      ))
                                                ? "outlined"
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function getWeekNumber(day: DateTime) {
    // @ts-ignore
    if (day.localWeekNumber === 1 && day.month === 12) {
        // @ts-ignore
        return `${day.year + 1}-${day.localWeekNumber}`;
    }
    // @ts-ignore
    if (day.localWeekNumber > 50 && day.month === 1) {
        // @ts-ignore
        return `${day.year - 1}-${day.localWeekNumber}`;
    }
    // @ts-ignore
    return `${day.year}-${day.localWeekNumber}`;
}
