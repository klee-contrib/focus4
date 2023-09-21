import {uniqueId} from "lodash";
import {DateTime} from "luxon";
import {KeyboardEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";

import {config} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";
import {Calendar, CalendarProps, IconButton} from "@focus4/toolbox";

import {Input, InputProps} from "./input";

import inputDateCss, {InputDateCss} from "./__style__/input-date.css";
export {inputDateCss};

export interface InputDateProps {
    /** Format de l'affichage de la date dans le calendrier. */
    calendarFormat?: Intl.DateTimeFormatOptions;
    /** Position du calendrier. Par défaut: "auto".  */
    calendarPosition?: "auto" | "down" | "up";
    /* Autres props du Calendar RT */
    calendarProps?: Omit<CalendarProps, "display" | "handleSelect" | "onChange" | "selectedDate">;
    /** Composant affiché depuis la gauche ou la droite. */
    displayFrom?: "left" | "right";
    /** Give an error node to display under the field. */
    error?: ReactNode;
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
    calendarPosition: pCalendarPosition = "auto",
    calendarProps,
    displayFrom = "left",
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

    /** Affiche le calendrier. */
    const [showCalendar, setShowCalendar] = useState(false);

    /** Mode du calendrier. */
    const [calendarDisplay, setCalendarDisplay] = useState<"months" | "years">("months");

    /** Position du calendrier. */
    const [calendarPosition, setCalendarPosition] = useState(pCalendarPosition);

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

    /** Appelé lorsqu'on quitte le champ texte. */
    const onInputBlur = useCallback(
        function onInputBlur() {
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

    /** Ferme le calendrier lorsqu'on clic à l'extérieur du picker. */
    const onDocumentClick = useCallback(
        function onDocumentClick({target}: Event) {
            let parent = target as HTMLElement | null;

            while (parent && parent.getAttribute("data-id") !== inputDateId) {
                parent = parent.parentElement;
            }

            if (showCalendar && !parent) {
                setShowCalendar(false);
                onInputBlur();
            }
        },
        [onInputBlur, showCalendar]
    );

    useEffect(() => {
        document.addEventListener("pointerdown", onDocumentClick);
        return () => document.removeEventListener("pointerdown", onDocumentClick);
    }, [onDocumentClick]);

    // Recalcule la position du calendrier quand elle est automatique.
    useLayoutEffect(() => {
        if (showCalendar && pCalendarPosition === "auto") {
            const client = inputRef.current?.htmlInput?.getBoundingClientRect() ?? {top: 0, height: 0};
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            const up = client.top > screenHeight / 2 + client.height;
            setCalendarPosition(up ? "up" : "down");
        }
    }, [pCalendarPosition, showCalendar]);

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
                setShowCalendar(false);
            }
        },
        [ISOStringFormat, onChange, timezoneCode, transformDate]
    );

    const handleKeyDown = useCallback(
        function handleKeyDown({key}: KeyboardEvent) {
            if (key === "Tab" || key === "Enter") {
                setShowCalendar(false);
                onInputBlur();
            }
        },
        [onInputBlur]
    );

    const theme = useTheme("inputDate", inputDateCss, pTheme);

    return (
        <div className={theme.input()} data-focus="input-date" data-id={inputDateId}>
            <Input
                {...inputProps}
                ref={inputRef}
                autoComplete={config.autocompleteOffValue}
                error={error}
                id={id}
                mask={{pattern: inputFormat.replace(/\w/g, "1")}}
                name={name}
                onChange={setDateText}
                onFocus={() => setShowCalendar(true)}
                onKeyDown={handleKeyDown}
                type="string"
                value={dateText ?? ""}
            />
            {showCalendar ? (
                <div
                    className={theme.calendar({
                        [calendarPosition]: true,
                        fromRight: displayFrom === "right"
                    })}
                >
                    <header className={theme.header({[calendarDisplay]: true})}>
                        <span className={theme.year()} id="years" onClick={() => setCalendarDisplay("years")}>
                            {displayedDate.year}
                        </span>
                        <h3 className={theme.date()} id="months" onClick={() => setCalendarDisplay("months")}>
                            {displayedDate.toLocaleString(calendarFormat)}
                        </h3>
                        <IconButton
                            icon="clear"
                            onClick={() => setShowCalendar(false)}
                            theme={{toggle: theme.toggle()}}
                        />
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
            ) : null}
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
