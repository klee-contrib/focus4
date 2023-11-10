import {uniqueId} from "lodash";
import {DateTime} from "luxon";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {config} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";
import {Calendar, CalendarProps, Menu, useMenu} from "@focus4/toolbox";

import {Input, InputProps} from "./input";

import inputDateCss, {InputDateCss} from "./__style__/input-date.css";
export {inputDateCss};

export interface InputDateProps {
    /** Format de l'affichage de la date dans le calendrier. */
    calendarFormat?: Intl.DateTimeFormatOptions;
    /**
     * Détermine la position du Calendrier par rapport au champ texte.
     *
     * Le calendrier peut être placé en haut/en bas et à gauche/à droite (`top-left`, `top-right`, `bottom-left` ou `bottom-right`).
     *
     * La position peut être déterminée automatiquement selon la position du champ sur la page au moment de l'ouverture du calendrier.
     * Il est possible de choisir entre
     * - `auto` (`bottom-left`, `bottom-right`, `top-left`, `top-right`)
     * - `left` (`bottom-left`, `top-left`)
     * - `right` (`bottom-right` ou `top-right`)
     * - `top` (`top-left` ou `top-right`)
     * - `bottom` (`bottom-left` ou `bottom-right`)
     *
     * Par défaut : `left`.
     */
    calendarPosition?:
        | "auto"
        | "bottom-left"
        | "bottom-right"
        | "bottom"
        | "left"
        | "right"
        | "top-left"
        | "top-right"
        | "top";
    /* Autres props du Calendar RT */
    calendarProps?: Omit<CalendarProps, "display" | "handleSelect" | "onChange" | "selectedDate">;
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Id pour l'input. */
    id?: string;
    /** Format de la date dans l'input. */
    inputFormat?: string;
    /** Props de l'input. */
    inputProps?: Omit<
        InputProps<"string">,
        "error" | "id" | "mask" | "name" | "onChange" | "onFocus" | "onKeyDown" | "type" | "value"
    >;
    /**
     * Définit la correspondance entre une date et l'ISOString (date/heure) associé.
     *
     * Par exemple, pour 24/10/2017 en UTC + 2 :
     * - "utc-midnight" : Minuit, en UTC. (-> 2017-10-24T00:00:00Z)
     * - "local-midnight" : Minuit, au fuseau horaire local. (-> 2017-10-24T00:00:00+02:00)
     * - "local-utc-midnight" : Minuit à l'heure locale, en UTC. (-> 2017-10-23T22:00:00Z)
     * - "date-only" : ISOString sans heure (-> 2017-10-23)
     *
     * En "utc-midnight", le composant ignore totalement la composante heure de la date qu'il reçoit,
     * alors qu'en "local-*" la date sera convertie dans le fuseau horaire local. Quelque soit le format choisi,
     * la composante heure sera toujours normalisée (comme choisi) en sortie de `onChange`.
     *
     * Par défaut "utc-midnight".
     */
    ISOStringFormat?: "date-only" | "local-midnight" | "local-utc-midnight" | "utc-midnight";
    /** Name pour l'input. */
    name?: string;
    /** Appelé lorsque la date change. */
    onChange: (date: string | undefined) => void;
    /**
     * Code Timezone que l'on souhaite appliquer au DatePicker dans le cas d'une Timezone différente de celle du navigateur (https://moment.github.io/luxon/#/zones)
     * Incompatible avec l'usage de ISOStringFormat
     */
    timezoneCode?: string;
    /** CSS. */
    theme?: CSSProp<InputDateCss>;
    /** Valeur. */
    value: string | undefined;
}

/**
 * Un champ de saisie de date avec double saisie en texte (avec un `Input`) et un calendrier (`Calendar`), qui s'affiche en dessous.
 */
export function InputDate({
    calendarFormat = {weekday: "short", month: "short", day: "2-digit"},
    calendarPosition = "left",
    calendarProps,
    error,
    id,
    inputFormat = "MM/dd/yyyy",
    inputProps = {},
    ISOStringFormat = "utc-midnight",
    name,
    onChange,
    theme: pTheme,
    timezoneCode,
    value
}: InputDateProps) {
    const zone = timezoneCode
        ? timezoneCode
        : ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only"
        ? "utc"
        : undefined;

    /** Convertit le texte en objet Luxon. */
    const toLuxon = useCallback(
        function toLuxon(v?: string) {
            if (isISOString(v)) {
                return DateTime.fromISO(v, zone ? {zone} : {});
            } else {
                return (zone === "utc" ? DateTime.utc() : DateTime.now()).set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                });
            }
        },
        [zone]
    );

    /** Formatte la date (ISO String) en entrée selon le format demandé. */
    const formatDate = useCallback(
        function formatDate(v?: string) {
            if (isISOString(v)) {
                return DateTime.fromISO(v, timezoneCode ? {zone: timezoneCode} : {}).toFormat(inputFormat);
            } else {
                return v;
            }
        },
        [inputFormat, timezoneCode]
    );

    const inputRef = useRef<Input<"string">>(null);

    /** Id unique de l'input date, pour gérer la fermeture en cliquant à l'extérieur. */
    const [inputDateId] = useState(() => uniqueId("input-date-"));

    /** Date actuelle. */
    const [date, setDate] = useState(() => toLuxon(value));

    /** Contenu du champ texte. */
    const [dateText, setDateText] = useState(() => formatDate(value));

    useEffect(() => {
        setDate(toLuxon(value));
        setDateText(formatDate(value));
    }, [formatDate, toLuxon, value]);

    const menu = useMenu();

    /** Mode du calendrier. */
    const [calendarDisplay, setCalendarDisplay] = useState<"months" | "years">("months");

    /** Transforme la date selon le format de date/timezone souhaité. */
    const transformDate = useCallback(
        function transformDate(newDate: Date | string, targetInputFormat?: string) {
            let dateTime =
                typeof newDate === "string" && targetInputFormat
                    ? DateTime.fromFormat(newDate, targetInputFormat, zone ? {zone} : {})
                    : newDate instanceof Date
                    ? DateTime.fromJSDate(newDate, zone ? {zone} : {})
                    : zone === "utc"
                    ? DateTime.utc()
                    : DateTime.now();

            if (ISOStringFormat === "local-utc-midnight") {
                dateTime = dateTime.toUTC();
            }

            return dateTime;
        },
        [ISOStringFormat, zone]
    );

    const jsDate = useMemo(() => {
        // Vérifie que la timezone existe
        if (timezoneCode) {
            return getPickerDate(date.toJSDate(), timezoneCode);
        }
        if (ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only") {
            return new Date(date.year, date.month - 1, date.day);
        } else {
            const res = date.toJSDate();
            res.setHours(0);
            res.setMinutes(0);
            res.setSeconds(0);
            res.setMilliseconds(0);
            return res;
        }
    }, [date, ISOStringFormat, timezoneCode]);

    const displayedDate = useMemo(() => {
        if (ISOStringFormat === "local-utc-midnight") {
            return date.toLocal();
        } else {
            return date;
        }
    }, [date, ISOStringFormat]);

    /** Au clic sur le calendrier. */
    const onCalendarChange = useCallback(
        function onCalendarChange(newDate: Date, dayClick: boolean) {
            // Vérifie que la timezone existe
            if (timezoneCode) {
                newDate = getTimezoneTime(newDate, timezoneCode);
            } else if (ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only") {
                /*
                 * La date reçue est toujours à minuit en "local-midnight".
                 * Dans ce cas, on modifie l'heure pour se mettre à minuit UTC en local.
                 */
                newDate.setHours(newDate.getHours() - newDate.getTimezoneOffset() / 60);
            }
            const correctedDate =
                ISOStringFormat === "date-only"
                    ? transformDate(newDate).toFormat("yyyy-MM-dd")
                    : transformDate(newDate).toISO() ?? "";
            onChange(correctedDate);
            if (!dayClick) {
                setCalendarDisplay("months");
            } else {
                menu.close();
            }
        },
        [ISOStringFormat, onChange, timezoneCode, transformDate]
    );

    const commitDate = useCallback(
        function commitDate() {
            const text = (dateText ?? "").trim() || undefined;
            const newDate = text ? transformDate(text, inputFormat) : undefined;

            if (newDate?.isValid) {
                setDate(newDate);
                onChange(ISOStringFormat === "date-only" ? newDate.toFormat("yyyy-MM-dd") : newDate.toISO() ?? "");
            } else {
                onChange(text);
            }
        },
        [dateText, inputFormat, ISOStringFormat, onChange, transformDate]
    );

    /** Appelé lorsqu'on quitte le champ texte. */
    const onInputBlur = useCallback(
        function onInputBlur() {
            if (menu.active) {
                return;
            }
            commitDate();
        },
        [commitDate, menu.active]
    );

    /** Gestion appuie sur "Entrée". */
    const onKeyDown = useCallback(
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter") {
                menu.close();
                commitDate();
            }
        },
        [commitDate]
    );

    useEffect(() => {
        if (menu.active) {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [menu.active, onKeyDown]);

    const theme = useTheme("inputDate", inputDateCss, pTheme);

    return (
        <div className={theme.input()} data-focus="input-date" data-id={inputDateId}>
            <Input
                {...inputProps}
                ref={inputRef}
                autoComplete={config.autocompleteOffValue}
                error={error}
                fieldRef={menu.anchor}
                id={id}
                mask={{pattern: inputFormat.replace(/\w/g, "1")}}
                name={name}
                onBlur={onInputBlur}
                onChange={setDateText}
                onFocus={menu.open}
                type="string"
                value={dateText ?? ""}
            />
            <Menu
                {...menu}
                noList
                noSelection
                position={
                    calendarPosition === "bottom"
                        ? "bottom-auto"
                        : calendarPosition === "top"
                        ? "top-auto"
                        : calendarPosition === "left"
                        ? "auto-left"
                        : calendarPosition === "right"
                        ? "auto-right"
                        : calendarPosition === "auto"
                        ? "auto-fit"
                        : calendarPosition
                }
            >
                <div className={theme.calendar()}>
                    <header className={theme.header({[calendarDisplay]: true})}>
                        <span className={theme.year()} id="years" onClick={() => setCalendarDisplay("years")}>
                            {displayedDate.year}
                        </span>
                        <h3 className={theme.date()} id="months" onClick={() => setCalendarDisplay("months")}>
                            {displayedDate.toLocaleString(calendarFormat)}
                        </h3>
                    </header>
                    <div className={theme.calendarWrapper()}>
                        <Calendar
                            {...calendarProps}
                            display={calendarDisplay}
                            handleSelect={() => null}
                            onChange={onCalendarChange}
                            selectedDate={jsDate}
                        />
                    </div>
                </div>
            </Menu>
        </div>
    );
}

/** Détermine si une valeur est un ISO String. */
function isISOString(value?: string): value is string {
    return value ? DateTime.fromISO(value).isValid : false;
}

/** Détermine la date pour le picker en prenant en compte la timezone */
function getPickerDate(tzDate: Date, timezoneCode: string) {
    const tzUTCOffset = DateTime.fromJSDate(tzDate, {zone: timezoneCode}).offset;
    const utcDate = new Date();
    utcDate.setTime(tzDate.getTime() + tzUTCOffset * 60000);

    const pickerDate = new Date();
    const pickerOffset = pickerDate.getTimezoneOffset();
    pickerDate.setTime(utcDate.getTime() + pickerOffset * 60000);

    return pickerDate;
}

/** Détermine la date pour retourné en prenant en compte la timezone */
function getTimezoneTime(pickerDate: Date, timezoneCode: string) {
    const pickerOffset = pickerDate.getTimezoneOffset();
    const utcDate = new Date();
    utcDate.setTime(pickerDate.getTime() - pickerOffset * 60000);

    const tzOffset = DateTime.fromJSDate(pickerDate, {zone: timezoneCode}).offset;
    const tzDate = new Date();
    tzDate.setTime(utcDate.getTime() - tzOffset * 60000);
    return tzDate;
}
