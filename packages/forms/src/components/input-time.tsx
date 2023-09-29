import {uniqueId} from "lodash";
import {DateTime} from "luxon";
import {KeyboardEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";

import {config} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";
import {Clock, ClockCss, IconButton} from "@focus4/toolbox";

import {Input, InputProps} from "./input";

import inputTimeCss, {InputTimeCss} from "./__style__/input-time.css";
export {inputTimeCss};

/** Props de l'InputTime. */
export interface InputTimeProps {
    /** Format pour le composant d'horloge. */
    clockFormat?: "24hr" | "ampm";
    /** Position de l'horloge. Par défaut: "auto".  */
    clockPosition?: "auto" | "down" | "up";
    /** CSS pour le composant Clock. */
    clockTheme?: CSSProp<ClockCss>;
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
    /** Name pour l'input. */
    name?: string;
    /** Appelé lorsque l'heure change. */
    onChange: (time: string | undefined) => void;
    /** CSS. */
    theme?: CSSProp<InputTimeCss>;
    /** Valeur. */
    value: string | undefined;
    /** Code Timezone que l'on souhaite appliquer au InputTime dans le cas d'une Timezone différente de celle du navigateur (https://momentjs.com/timezone/) */
    timezoneCode?: string;
}

/**
 * Un champ de saisie d'heure avec double saisie en texte (avec un `Input`) et une horloge (`Clock`), qui s'affiche en dessous.
 */
export function InputTime({
    clockFormat = "24hr",
    clockPosition: pClockPosition = "auto",
    clockTheme,
    displayFrom = "left",
    error,
    id,
    inputFormat = "HH:mm",
    inputProps = {},
    name,
    onChange,
    value,
    theme: pTheme,
    timezoneCode
}: InputTimeProps) {
    const inputRef = useRef<Input<"string">>(null);

    /** Id unique de l'input time, pour gérer la fermeture en cliquant à l'extérieur. */
    const [inputTimeId] = useState(() => uniqueId("input-time-"));

    /** Convertit le texte en objet Luxon. */
    const toLuxon = useCallback(
        function toLuxon(v?: string) {
            if (isISOString(v)) {
                return DateTime.fromISO(v, timezoneCode ? {zone: timezoneCode} : {});
            } else {
                return DateTime.now();
            }
        },
        [timezoneCode]
    );

    /** Formatte l'heure (ISO String) en entrée. */
    const formatTime = useCallback(
        function formatDate(v?: string) {
            if (isISOString(v)) {
                return DateTime.fromISO(v, timezoneCode ? {zone: timezoneCode} : {}).toFormat(inputFormat);
            } else {
                return v;
            }
        },
        [inputFormat, timezoneCode]
    );

    /** Heure actuelle. */
    const [time, setTime] = useState(() => toLuxon(value));

    /** Contenu du champ texte. */
    const [timeText, setTimeText] = useState(() => formatTime(value));

    useEffect(() => {
        setTime(toLuxon(value));
        setTimeText(formatTime(value));
    }, [formatTime, toLuxon, value]);

    /** Affiche l'horloge. */
    const [showClock, setShowClock] = useState(false);

    /** Mode de l'horloge. */
    const [clockDisplay, setClockDisplay] = useState<"hours" | "minutes">("hours");

    /** Position de l'horloge. */
    const [clockPosition, setClockPosition] = useState(pClockPosition);

    const closeClock = useCallback(function closeClock() {
        setShowClock(false);
        setClockDisplay("hours");
        inputRef.current?.htmlInput?.blur();
    }, []);

    /** Appelé lorsqu'on quitte le champ texte. */
    const onInputBlur = useCallback(
        function onInputBlur() {
            const text = (timeText ?? "").trim() || undefined;

            const newTime = text ? DateTime.fromFormat(text, inputFormat) : DateTime.now();

            const dateTime = time.set({hour: newTime.hour, minute: newTime.minute});

            if (dateTime.isValid) {
                setTime(dateTime);
                onChange(dateTime.toISO() ?? "");
            } else {
                onChange(text);
            }
        },
        [inputFormat, onChange, time, timeText]
    );

    /** Ferme l'horloge lorsqu'on clic à l'extérieur du picker. */
    const onDocumentClick = useCallback(
        function onDocumentClick({target}: Event) {
            let parent = target as HTMLElement | null;

            while (parent && parent.getAttribute("data-id") !== inputTimeId) {
                parent = parent.parentElement;
            }

            if (showClock && !parent) {
                closeClock();
                onInputBlur();
            }
        },
        [closeClock, onInputBlur, showClock]
    );

    useEffect(() => {
        document.addEventListener("pointerdown", onDocumentClick);
        return () => document.removeEventListener("pointerdown", onDocumentClick);
    }, [onDocumentClick]);

    // Recalcule la position de l'horloge quand elle est automatique.
    useLayoutEffect(() => {
        if (showClock && pClockPosition === "auto") {
            const client = inputRef.current?.htmlInput?.getBoundingClientRect() ?? {top: 0, height: 0};
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            const up = client.top > screenHeight / 2 + client.height;
            setClockPosition(up ? "up" : "down");
        }
    }, [pClockPosition, showClock]);

    /** Date pour le TimePicker */
    const jsTime = useMemo(() => {
        if (timezoneCode) {
            return getPickerTime(time.toJSDate(), timezoneCode);
        }
        return time.toJSDate();
    }, [time]);

    const onClockChange = useCallback(
        function onClockChange(newTime: Date) {
            // Vérifie que la timezone existe
            if (timezoneCode) {
                newTime = getTimezoneTime(newTime, timezoneCode);
            }
            return onChange(DateTime.fromJSDate(newTime).toISO() ?? "");
        },
        [onChange, timezoneCode]
    );

    /** Au clic sur l'horloge. */
    const onHandMoved = useCallback(
        function onHandMoved() {
            if (clockDisplay === "hours") {
                setClockDisplay("minutes");
            } else {
                closeClock();
            }
        },
        [clockDisplay, closeClock]
    );

    /** Ferme l'horloge lorsqu'on appuie sur Entrée ou Tab. */
    const handleKeyDown = useCallback(
        function handleKeyDown({key}: KeyboardEvent) {
            if (key === "Tab" || key === "Enter") {
                closeClock();
                onInputBlur();
            }
        },
        [closeClock, onInputBlur]
    );

    const theme = useTheme("inputTime", inputTimeCss, pTheme);

    return (
        <div className={theme.input()} data-focus="input-time" data-id={inputTimeId}>
            <Input
                {...inputProps}
                ref={inputRef}
                autoComplete={config.autocompleteOffValue}
                error={error}
                id={id}
                mask={{pattern: inputFormat.replace(/\w/g, "1")}}
                name={name}
                onChange={setTimeText}
                onFocus={() => setShowClock(true)}
                onKeyDown={handleKeyDown}
                type="string"
                value={timeText ?? ""}
            />
            {showClock ? (
                <div
                    className={theme.clock({
                        [clockPosition]: true,
                        fromRight: displayFrom === "right"
                    })}
                >
                    <header className={theme.header()}>
                        <span
                            className={theme.hours({selected: clockDisplay === "hours"})}
                            id="hours"
                            onClick={() => setClockDisplay("hours")}
                        >
                            {`0${time.hour}`.slice(-2)}
                        </span>
                        <span className={theme.separator()}>:</span>
                        <span
                            className={theme.minutes({selected: clockDisplay === "minutes"})}
                            id="minutes"
                            onClick={() => setClockDisplay("minutes")}
                        >
                            {`0${time.minute}`.slice(-2)}
                        </span>
                        <IconButton icon="clear" onClick={closeClock} theme={{button: theme.toggle()}} />
                    </header>
                    <Clock
                        display={clockDisplay}
                        format={clockFormat}
                        onChange={onClockChange}
                        onHandMoved={onHandMoved}
                        theme={clockTheme}
                        time={jsTime}
                    />
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
function getPickerTime(tzDate: Date, timezoneCode: string) {
    const tzUTCOffset = DateTime.fromJSDate(tzDate, {zone: timezoneCode}).offset;
    const utcDate = new Date();
    utcDate.setTime(tzDate.getTime() + tzUTCOffset * 60000);

    const pickerDate = new Date();
    const pickerOffset = pickerDate.getTimezoneOffset();
    pickerDate.setTime(utcDate.getTime() + pickerOffset * 60000);

    return pickerDate;
}

/** Détermine la date à retourner en prenant en compte la timezone */
function getTimezoneTime(pickerDate: Date, timezoneCode: string) {
    const pickerOffset = pickerDate.getTimezoneOffset();
    const utcDate = new Date();
    utcDate.setTime(pickerDate.getTime() - pickerOffset * 60000);

    const tzOffset = DateTime.fromJSDate(pickerDate, {zone: timezoneCode}).offset;
    const tzDate = new Date();
    tzDate.setTime(utcDate.getTime() - tzOffset * 60000);
    return tzDate;
}
