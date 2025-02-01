import classnames from "classnames";
import {differenceBy, groupBy, range, sortBy, uniqBy, upperFirst} from "es-toolkit";
import {animate, AnimatePresence, motion} from "framer-motion";
import {DateTime} from "luxon";
import {ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";

import {CSSProp, getSpringTransition, useTheme} from "@focus4/styling";

import {Button} from "./button";
import {IconButton} from "./icon-button";

import calendarCss, {CalendarCss} from "./__style__/calendar.css";
export {calendarCss};
export type {CalendarCss};

export interface CalendarProps {
    /** Classe CSS pour le composant racine. */
    className?: string;
    /**
     * Format de la date à choisir. "yyyy-MM" limite la sélection à un mois uniquement, tandis que "yyyy" la limite à une année.
     * Par défaut : "yyyy-MM-dd"
     */
    format?: "yyyy-MM-dd" | "yyyy-MM" | "yyyy";
    /** Date maximale autorisée pour la saisie. */
    max?: string;
    /** Date minimale autorisée pour la saisie. */
    min?: string;
    /** Handler appelé à la sélection d'une date. */
    onChange?: (value: string, fromKeyDown: boolean) => void;
    /** TabIndex pour le Calendar. Par défaut : 0. */
    tabIndex?: number;
    /** CSS. */
    theme?: CSSProp<CalendarCss>;
    /** Date. */
    value?: string;
}

/**
 * Un calendrier permet à un utilisateur de choisir une date.
 *
 * - Intégré avec un champ de saisie texte via le composant [`InputDate`](/docs/composants-focus4∕forms-inputdate--docs).
 * - Peut être configuré pour limiter la saisie à un mois ou une année.
 */
export const Calendar = forwardRef(function Calendar(
    {className, max, min, format = "yyyy-MM-dd", onChange, tabIndex = 0, theme: pTheme, value}: CalendarProps,
    ref: ForwardedRef<{focus: () => void}>
) {
    const theme = useTheme("calendar", calendarCss, pTheme);

    const [date, setDate] = useState(handleValue(value, format));
    const [displayedMonth, setDisplayedMonth] = useState(DateTime.fromISO((date ?? DateTime.now()).toFormat("yyyyMM")));

    const [maxDate, setMaxDate] = useState(handleValue(max, format));
    useEffect(() => setMaxDate(handleValue(max, format)), [format, max]);

    const [minDate, setMinDate] = useState(handleValue(min, format));
    useEffect(() => setMinDate(handleValue(min, format)), [format, min]);

    const isDisabled = useCallback(
        function isDisabled(d: DateTime) {
            return !!(maxDate && maxDate.toMillis() < d.toMillis()) || !!(minDate && minDate.toMillis() > d.toMillis());
        },
        [maxDate, minDate]
    );

    const [viewChange, setViewChange] = useState<
        "days-to-months" | "months-to-days" | "months-to-years" | "years-to-months"
    >(format === "yyyy" ? "months-to-years" : format === "yyyy-MM" ? "days-to-months" : "months-to-days");
    const view = viewChange === "months-to-days" ? "days" : viewChange === "months-to-years" ? "years" : "months";
    const viewFormat = view === "days" ? "yyyy-MM-dd" : view === "months" ? "yyyy-MM" : "yyyy";

    const lines = useMemo(() => getLines(displayedMonth, view), [displayedMonth, view]);

    const [transitionLines, setTransitionLines] = useState<
        {
            line: string;
            items: DateTime[];
        }[]
    >([]);

    const allLines = sortBy(
        uniqBy(transitionLines.concat(lines), l => l.line),
        [l => l.line]
    );

    const root = useRef<HTMLDivElement>(null);
    const main = useRef<HTMLDivElement>(null);
    const displayed = useRef<HTMLDivElement>();
    const animationId = useRef<number>(0);

    const changeDisplayedMonth = useCallback(
        async function changeDisplayedMonth(direction: "down" | "up") {
            const change = view === "days" ? {month: 1} : view === "months" ? {year: 1} : {year: 10};
            const d = displayedMonth[direction === "up" ? "minus" : "plus"](change);
            setDisplayedMonth(d);
            if (displayed.current) {
                const oldLines = getLines(displayedMonth, view);
                const linesAbove = getLines(displayedMonth.minus(change), view);
                const newLinesAbove = differenceBy(linesAbove, oldLines, l => l.line);
                const linesBelow = getLines(displayedMonth.plus(change), view);
                const newLinesBelow = differenceBy(linesBelow, oldLines, l => l.line);
                const newTransitionLines = differenceBy(
                    oldLines.concat(direction === "up" ? newLinesBelow : newLinesAbove),
                    direction === "up" ? linesAbove : linesBelow,
                    l => l.line
                );
                setTransitionLines(newTransitionLines);

                const id = ++animationId.current;
                const lineHeight = displayed.current.querySelector("button")?.parentElement?.clientHeight ?? 0;
                await animate([
                    [displayed.current, {y: -lineHeight * newLinesAbove.length}, {duration: 0}],
                    [
                        displayed.current,
                        {
                            y:
                                direction === "up"
                                    ? 0
                                    : -lineHeight *
                                      differenceBy(oldLines.concat(newLinesAbove), linesBelow, l => l.line).length
                        },
                        {duration: 0.275}
                    ],
                    [displayed.current, {y: 0}, {duration: 0}]
                ]);
                if (id === animationId.current) {
                    for (const line of newTransitionLines) {
                        const dLine = displayed.current.querySelector<HTMLElement>(`[data-line='${line.line}']`);
                        if (dLine) {
                            dLine.style.display = "none";
                        }
                    }
                    setTransitionLines([]);
                }
            }
        },
        [displayedMonth, view]
    );

    useEffect(() => {
        const newDate = handleValue(value, format);
        setDate(newDate);
        if (newDate) {
            const newDisplayedMonth = DateTime.fromISO(newDate.toFormat("yyyyMM"));
            let dir: "down" | "up" | undefined;
            if (view === "days") {
                dir =
                    newDisplayedMonth.month + 1 === displayedMonth.month
                        ? "up"
                        : newDisplayedMonth.month - 1 === displayedMonth.month
                        ? "down"
                        : undefined;
            } else if (view === "months") {
                dir =
                    newDisplayedMonth.year + 1 === displayedMonth.year
                        ? "up"
                        : newDisplayedMonth.year - 1 === displayedMonth.year
                        ? "down"
                        : undefined;
            } else {
                const ndmy = +`${newDisplayedMonth.year.toString().substring(0, 3)}0`;
                const dmy = +`${displayedMonth.year.toString().substring(0, 3)}0`;
                dir = ndmy + 10 === dmy ? "up" : ndmy - 10 === dmy ? "down" : undefined;
            }

            if (dir) {
                changeDisplayedMonth(dir);
            } else {
                setDisplayedMonth(newDisplayedMonth);
            }
        }
    }, [format, value]);

    const changeView = useCallback((v: typeof viewChange) => {
        setViewChange(v);
        setTransitionLines([]);
    }, []);

    useImperativeHandle(ref, () => ({
        focus() {
            root.current?.focus();
        }
    }));

    const [focused, setFocused] = useState(false);

    const [focusedDate, setFocusedDate] = useState((date ?? DateTime.now()).toFormat(viewFormat));
    useEffect(() => {
        let newDate = DateTime.fromISO(focusedDate);

        if (
            focusedDate.length < viewFormat.length ||
            newDate.toMillis() < lines[0].items[0].toMillis() ||
            newDate.toMillis() > lines[lines.length - 1].items[lines[lines.length - 1].items.length - 1].toMillis()
        ) {
            const middle = lines[Math.floor((lines.length - 1) / 2)];
            newDate = middle.items[(middle.items.length - 1) / 2];
        }

        setFocusedDate(newDate.toFormat(viewFormat));
        if (focused) {
            setTimeout(
                () =>
                    main.current
                        ?.querySelector<HTMLButtonElement>(`[data-date='${newDate.toFormat(viewFormat)}']`)
                        // @ts-ignore
                        ?.focus({preventScroll: true, focusVisible: true}),
                0
            );
        }
    }, [focused, viewFormat]);

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

            if (change || e.key === "PageUp" || e.key === "PageDown") {
                e.preventDefault();
                e.stopPropagation();

                const newDate =
                    e.key === "PageUp" || e.key === "PageDown"
                        ? DateTime.fromFormat(focusedDate, viewFormat)[e.key === "PageUp" ? "minus" : "plus"](
                              view === "days" ? {month: 1} : view === "months" ? {year: 1} : {year: 10}
                          )
                        : DateTime.fromFormat(focusedDate, viewFormat).plus(
                              view === "days" ? {day: change} : view === "months" ? {month: change} : {year: change}
                          );

                if (isDisabled(newDate)) {
                    return;
                }

                setFocusedDate(newDate.toFormat(viewFormat));

                if (
                    (view === "days" && newDate.toFormat("yyyy-MM") < displayedMonth.toFormat("yyyy-MM")) ||
                    (view === "months" && newDate.year < displayedMonth.year) ||
                    (view === "years" && `${newDate.year}`.substring(0, 3) < `${displayedMonth.year}`.substring(0, 3))
                ) {
                    changeDisplayedMonth("up");
                } else if (
                    (view === "days" && newDate.toFormat("yyyy-MM") > displayedMonth.toFormat("yyyy-MM")) ||
                    (view === "months" && newDate.year > displayedMonth.year) ||
                    (view === "years" && `${newDate.year}`.substring(0, 3) > `${displayedMonth.year}`.substring(0, 3))
                ) {
                    changeDisplayedMonth("down");
                }

                setTimeout(
                    () =>
                        main.current
                            ?.querySelector<HTMLButtonElement>(`[data-date='${newDate.toFormat(viewFormat)}']`)
                            // @ts-ignore
                            ?.focus({preventScroll: true, focusVisible: true}),
                    0
                );
            }

            if (e.key === "Backspace" && view !== "years") {
                changeView(view === "months" ? "months-to-years" : "days-to-months");
            }
        },
        [changeDisplayedMonth, displayedMonth, focusedDate, isDisabled, lines, view, viewFormat]
    );

    useEffect(() => {
        if (focused && main.current) {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [focused, onKeyDown]);

    return (
        <div
            ref={root}
            className={classnames(className, theme.calendar())}
            onBlur={useCallback(() => {
                setFocused(false);
            }, [])}
            onClick={useCallback(() => {
                setFocused(true);
                root.current?.focus();
            }, [])}
            onFocus={useCallback(() => {
                setFocused(true);
            }, [])}
            tabIndex={focused ? -1 : tabIndex}
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
                    onClick={useCallback(
                        () => changeView(view === "days" ? "days-to-months" : "months-to-years"),
                        [view]
                    )}
                    tabIndex={-1}
                />
                <div className={theme.controls()}>
                    <IconButton
                        icon="keyboard_arrow_up"
                        onClick={useCallback(
                            () => changeDisplayedMonth("up"),
                            [changeDisplayedMonth, displayedMonth, view]
                        )}
                        tabIndex={-1}
                    />
                    <IconButton
                        icon="keyboard_arrow_down"
                        onClick={useCallback(
                            () => changeDisplayedMonth("down"),
                            [changeDisplayedMonth, displayedMonth, view]
                        )}
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
                        <div
                            ref={useCallback((d: HTMLDivElement | null) => {
                                if (d) {
                                    displayed.current = d;
                                }
                            }, [])}
                        >
                            {allLines.map(l => (
                                <div key={l.line} data-line={l.line}>
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
                                                              d.year.toString()[2] !==
                                                              displayedMonth?.year.toString()[2]
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
                                                    onChange?.(d.toFormat(format), e.pageX === 0 && e.pageY === 0);
                                                    setTimeout(() => (e.target as HTMLElement)?.focus(), 0);
                                                } else {
                                                    setDisplayedMonth(d);
                                                    setTransitionLines([]);
                                                    changeView(
                                                        view === "months" ? "months-to-days" : "years-to-months"
                                                    );
                                                }
                                            }}
                                            tabIndex={-1}
                                            variant={
                                                (view === "years" && d.year === date?.year) ||
                                                (view === "months" &&
                                                    d.year === date?.year &&
                                                    d.month === date?.month) ||
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
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

function handleValue(value: string | undefined, format: string) {
    if (!value) {
        return undefined;
    }

    const date = DateTime.fromISO(value);

    if (!date.isValid) {
        return undefined;
    }

    return DateTime.fromISO(date.toFormat(format));
}

function getLines(displayedMonth: DateTime, view: "days" | "months" | "years") {
    if (view === "days") {
        const w = Object.entries(
            groupBy(
                range(1, displayedMonth.daysInMonth!).map(day => displayedMonth.set({day})),
                getWeekNumber
            )
        ).map(([line, items]) => ({line, items}));

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
        return Object.entries(
            groupBy(
                range(0, 12).map(month => startMonth.plus({month})),
                m => `${m.year}-${`${m.month - ((m.month - 1) % 3)}`.padStart(2, "0")}`
            )
        ).map(([line, items]) => ({line, items}));
    } else {
        const start = +`${displayedMonth.year.toString().substring(0, 3)}0`;

        const years = Object.entries(
            groupBy(
                range(0, 10).map(i => DateTime.fromObject({year: start + i})),
                y => y.year - (y.year % 3)
            )
        ).map(([line, items]) => ({line, items}));

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
}

function getWeekNumber(day: DateTime) {
    if (day.localWeekNumber === 1 && day.month === 12) {
        return `${day.year + 1}-${`${day.localWeekNumber}`.padStart(2, "0")}`;
    }
    if (day.localWeekNumber > 50 && day.month === 1) {
        return `${day.year - 1}-${`${day.localWeekNumber}`.padStart(2, "0")}`;
    }
    return `${day.year}-${`${day.localWeekNumber}`.padStart(2, "0")}`;
}
