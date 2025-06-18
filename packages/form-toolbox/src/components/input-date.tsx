import {DateTime} from "luxon";
import {FocusEvent, KeyboardEvent, useCallback, useEffect, useId, useRef, useState} from "react";

import {CSSProp, uiConfig, useTheme} from "@focus4/styling";
import {Calendar, CalendarCss, Menu, useMenu} from "@focus4/toolbox";

import {Input, InputProps} from "./input";

import inputDateCss, {InputDateCss} from "./__style__/input-date.css";

export {inputDateCss};

export interface InputDateProps {
    /**
     * Format de la date à choisir dans le Calendar. "yyyy-MM" limite la sélection à un mois uniquement, tandis que "yyyy" la limite à une année.
     * Par défaut : "yyyy-MM-dd"
     */
    calendarFormat?: "yyyy-MM-dd" | "yyyy-MM" | "yyyy";
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
    /** Date maximale autorisée pour la saisie dans le Calendar. */
    max?: string;
    /** Date minimale autorisée pour la saisie dans le Calendar. */
    min?: string;
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
    theme?: CSSProp<CalendarCss & InputDateCss>;
    /** Valeur. */
    value?: string;
}

/**
 * Un champ de saisie de date avec double saisie en texte (avec un [`Input`](/docs/composants-focus4∕form-toolbox-input--docs)) et un calendrier ([`Calendar`](/docs/composants-focus4∕toolbox-calendar--docs)), qui s'affiche dans un [`Menu`](/docs/composants-focus4∕toolbox-menu--docs) en dessous ou au dessus.
 *
 * - Réexpose toutes les options du `TextField` et du `Calendar`.
 * - Affiche un masque de saisie sur le champ texte.
 * - Permet de choisir parmi 4 formats de dates (et la saisie de jour/mois/année du `Calendar`)
 * - Peut gérer un fuseau horaire séparé.
 */
export function InputDate({
    calendarFormat = "yyyy-MM-dd",
    calendarPosition = "left",
    error,
    id,
    inputFormat = "MM/dd/yyyy",
    inputProps = {},
    ISOStringFormat = "utc-midnight",
    max,
    min,
    name,
    onChange,
    theme: pTheme,
    timezoneCode,
    value
}: InputDateProps) {
    const theme = useTheme("inputDate", inputDateCss, pTheme);

    const zone =
        timezoneCode ?? (ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only" ? "utc" : undefined);

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

    const rootRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<{focus: () => void}>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    /** Id unique de l'input date, pour gérer la fermeture en cliquant à l'extérieur. */
    const inputDateId = useId();

    /** Date actuelle. */
    const [date, setDate] = useState(() => toLuxon(value));

    /** Contenu du champ texte. */
    const [dateText, setDateText] = useState(() => formatDate(value));

    useEffect(() => {
        setDate(toLuxon(value));
        setDateText(formatDate(value));
    }, [formatDate, toLuxon, value]);

    const menu = useMenu();

    /** Transforme la date selon le format de date/timezone souhaité. */
    const transformDate = useCallback(
        function transformDate(newDate: string, targetInputFormat: string) {
            let dateTime = targetInputFormat
                ? DateTime.fromFormat(newDate, targetInputFormat, zone ? {zone} : {})
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

    /** Au clic sur le calendrier. */
    const onCalendarChange = useCallback(
        function onCalendarChange(newValue: string, fromKeyDown: boolean) {
            const {year, month, day} = DateTime.fromISO(newValue);
            let newDate = date.set({year, month, day});
            if (ISOStringFormat === "local-utc-midnight") {
                newDate = newDate.toUTC();
            }
            onChange(
                ISOStringFormat === "date-only"
                    ? newDate.toFormat("yyyy-MM-dd")
                    : (newDate.toISO({suppressMilliseconds: true}) ?? "")
            );
            setTimeout(() => {
                if (fromKeyDown) {
                    inputRef.current?.focus();
                }
                menu.close();
            }, 50);
        },
        [date, ISOStringFormat, onChange]
    );

    const commitDate = useCallback(
        function commitDate(newDateText?: string) {
            const text = (newDateText ?? dateText ?? "").trim() || undefined;
            const transformedDate = text ? transformDate(text, inputFormat) : undefined;

            if (transformedDate?.isValid) {
                const {year, month, day} = transformedDate;
                let newDate = date.set({year, month, day});
                if (ISOStringFormat === "local-utc-midnight") {
                    newDate = newDate.toUTC();
                }
                onChange(
                    ISOStringFormat === "date-only"
                        ? newDate.toFormat("yyyy-MM-dd")
                        : (newDate.toISO({suppressMilliseconds: true}) ?? "")
                );
            } else {
                onChange(text);
            }
        },
        [date, dateText, inputFormat, ISOStringFormat, onChange, transformDate]
    );

    /** Appelé lorsqu'on quitte le champ texte. */
    const onInputBlur = useCallback(
        function onInputBlur(e: FocusEvent<HTMLInputElement>) {
            if (rootRef.current?.contains(e.relatedTarget)) {
                return;
            }
            commitDate();
        },
        [commitDate]
    );

    /** Gestion bascule navigation dans le Calendrier. */
    const onKeyDown = useCallback(
        function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                menu.open();
                setTimeout(() => calendarRef.current?.focus(), 50);
            } else if (e.key === "Enter") {
                commitDate();
            }
        },
        [commitDate]
    );

    /** Permet de commit la date dès que la saisie dans le champ texte est "complète". */
    const onInputChange = useCallback(
        function onInputChange(text?: string) {
            setDateText(text);
            if (text?.replaceAll("_", "").length === inputFormat.length) {
                commitDate(text);
            }
        },
        [commitDate, inputFormat]
    );

    return (
        <div ref={rootRef} className={theme.input()} data-focus="input-date" data-id={inputDateId}>
            <Input
                {...inputProps}
                ref={inputRef}
                autoComplete={uiConfig.autocompleteOffValue}
                error={error}
                fieldRef={menu.anchor}
                id={id}
                mask={{pattern: inputFormat.replaceAll(/\w/g, "1")}}
                name={name}
                onBlur={onInputBlur}
                onChange={onInputChange}
                onFocus={menu.open}
                onKeyDown={onKeyDown}
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
                <Calendar
                    ref={calendarRef}
                    className={theme.calendar()}
                    format={calendarFormat}
                    max={max}
                    min={min}
                    onChange={onCalendarChange}
                    tabIndex={-1}
                    theme={theme}
                    value={value}
                />
            </Menu>
        </div>
    );
}

/** Détermine si une valeur est un ISO String. */
function isISOString(value?: string): value is string {
    return value ? DateTime.fromISO(value).isValid : false;
}
