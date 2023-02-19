import {uniqueId} from "lodash";
import {DateTime} from "luxon";
import {action, computed, makeObservable, observable} from "mobx";
import {observer} from "mobx-react";
import {Component, KeyboardEvent, ReactNode} from "react";

import {CSSProp, themr} from "@focus4/styling";
import {Calendar, CalendarProps, IconButton} from "@focus4/toolbox";

import {Input, InputProps} from "./input";

import inputDateCss, {InputDateCss} from "./__style__/input-date.css";
export {inputDateCss};

const Theme = themr("inputDate", inputDateCss);

export interface InputDateProps {
    /** Format de l'affichage de la date dans le calendrier. */
    calendarFormat?: string;
    /* Autres props du Calendar RT */
    calendarProps?: Omit<CalendarProps, "display" | "handleSelect" | "onChange" | "selectedDate">;
    /** Composant affiché depuis la gauche ou la droite. */
    displayFrom?: "left" | "right";
    /** Give an error node to display under the field. */
    error?: ReactNode;
    /** Format de la date dans l'input. */
    inputFormat?: string;
    /** Props de l'input. */
    inputProps?: Omit<InputProps<"string">, "error" | "mask" | "onChange" | "onFocus" | "onKeyDown" | "type" | "value">;
    /**
     * Définit la correspondance entre une date et l'ISOString (date/heure) associé.
     *
     * Par exemple, pour 24/10/2017 en UTC + 2
     *
     * "utc-midnight" : Minuit, en UTC. (-> 2017-10-24T00:00:00Z)
     *
     * "local-midnight" : Minuit, au fuseau horaire local. (-> 2017-10-24T00:00:00+02:00)
     *
     * "local-utc-midnight" : Minuit à l'heure locale, en UTC. (-> 2017-10-23T22:00:00Z)
     *
     * "date-only" : ISOString sans heure (-> 2017-10-23)
     *
     * En "utc-midnight", le composant ignore totalement la composante heure de la date qu'il reçoit,
     * alors qu'en "local-*" la date sera convertie dans le fuseau horaire local. Quelque soit le format choisi,
     * la composante heure sera toujours normalisée (comme choisi) en sortie de `onChange`.
     *
     * Par défaut "utc-midnight".
     */
    ISOStringFormat?: "date-only" | "local-midnight" | "local-utc-midnight" | "utc-midnight";
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

/** Composant d'input avec un calendrier (React-Toolbox). Diffère du DatePicker classique car il n'est pas affiché en plein écran et autorise la saisie manuelle. */
@observer
// eslint-disable-next-line react/no-unsafe
export class InputDate extends Component<InputDateProps> {
    protected calendar?: HTMLDivElement | null;

    /** Id unique de l'input date, pour gérer la fermeture en cliquant à l'extérieur. */
    protected readonly _inputDateId = uniqueId("input-date-");

    /** Date actuelle. */
    @observable protected date = this.toLuxon(this.props.value);

    /** Contenu du champ texte. */
    @observable protected dateText = this.formatDate(this.props.value);

    /** Affiche le calendrier. */
    @observable protected showCalendar = false;

    /** Mode du calendrier. */
    @observable protected calendarDisplay = "months" as "months" | "years";

    /** Position du calendrier. */
    @observable protected calendarPosition?: "down" | "up";

    constructor(props: InputDateProps) {
        super(props);
        makeObservable(this);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
    UNSAFE_componentWillMount() {
        document.addEventListener("mousedown", this.onDocumentClick);
    }

    @action
    // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
    UNSAFE_componentWillReceiveProps({value}: InputDateProps) {
        this.date = this.toLuxon(value);
        this.dateText = this.formatDate(value);
    }

    // Met à jour la position du calendrier.
    componentDidUpdate() {
        if (this.calendar && this.showCalendar) {
            const client = this.calendar.getBoundingClientRect();
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            if (!this.calendarPosition) {
                if (client.top + client.height > screenHeight) {
                    this.calendarPosition = "up";
                } else {
                    this.calendarPosition = "down";
                }
            }
        } else {
            this.calendarPosition = undefined;
        }
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.onDocumentClick);
    }

    @computed
    get jsDate() {
        const {timezoneCode} = this.props;
        // Vérifie que la timezone existe
        if (timezoneCode) {
            return getPickerDate(this.date.toJSDate(), timezoneCode);
        }
        const {ISOStringFormat = "utc-midnight"} = this.props;
        if (ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only") {
            return new Date(this.date.year, this.date.month, this.date.day);
        } else {
            const jsDate = this.date.toJSDate();
            jsDate.setHours(0);
            jsDate.setMinutes(0);
            jsDate.setSeconds(0);
            jsDate.setMilliseconds(0);
            return jsDate;
        }
    }

    @computed
    get zone() {
        const {timezoneCode, ISOStringFormat} = this.props;
        return timezoneCode
            ? timezoneCode
            : ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only"
            ? "utc"
            : undefined;
    }

    /** Convertit le texte en objet Luxon. */
    toLuxon(value?: string) {
        if (isISOString(value)) {
            return DateTime.fromISO(value, this.zone ? {zone: this.zone} : {});
        } else {
            return (this.zone === "utc" ? DateTime.utc() : DateTime.now()).set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            });
        }
    }

    /** Formatte la date (ISO String) en entrée selon le format demandé. */
    formatDate(value?: string) {
        const {inputFormat = "MM/DD/YYYY", timezoneCode} = this.props;
        if (isISOString(value)) {
            return DateTime.fromISO(value, timezoneCode ? {zone: timezoneCode} : {}).toFormat(inputFormat);
        } else {
            return value;
        }
    }

    /** Ferme le calendrier lorsqu'on clic à l'extérieur du picker. */
    @action.bound
    onDocumentClick({target}: Event) {
        let parent = target as HTMLElement | null;

        while (parent && parent.getAttribute("data-id") !== this._inputDateId) {
            parent = parent.parentElement;
        }

        if (this.showCalendar && !parent) {
            this.showCalendar = false;
            this.onInputBlur();
        }
    }

    /** Appelé lorsqu'on quitte le champ texte. */
    @action.bound
    onInputBlur() {
        const {inputFormat = "MM/DD/YYYY", ISOStringFormat = "utc-midnight", onChange} = this.props;
        const text = (this.dateText ?? "").trim() || undefined;

        const date = this.transformDate(text, inputFormat);

        if (date.isValid) {
            this.date = date;
            onChange(ISOStringFormat === "date-only" ? date.toFormat("YYYY-MM-DD") : date.toISO());
        } else {
            onChange(text);
        }
    }

    /** Au clic sur le calendrier. */
    @action.bound
    onCalendarChange(date: Date, dayClick: boolean) {
        const {ISOStringFormat = "utc-midnight", timezoneCode} = this.props;
        // Vérifie que la timezone existe
        if (timezoneCode) {
            date = getTimezoneTime(date, timezoneCode);
        } else if (ISOStringFormat === "utc-midnight" || ISOStringFormat === "date-only") {
            /*
             * La date reçue est toujours à minuit en "local-midnight".
             * Dans ce cas, on modifie l'heure pour se mettre à minuit UTC en local.
             */
            date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
        }
        const correctedDate =
            ISOStringFormat === "date-only"
                ? this.transformDate(date).toFormat("YYYY-MM-DD")
                : this.transformDate(date).toISO();
        this.props.onChange(correctedDate);
        if (!dayClick) {
            this.calendarDisplay = "months";
        } else {
            this.showCalendar = false;
        }
    }

    /** Ferme le calendrier lorsqu'on appuie sur Entrée ou Tab. */
    @action.bound
    handleKeyDown({key}: KeyboardEvent) {
        if (key === "Tab" || key === "Enter") {
            this.showCalendar = false;
            this.onInputBlur();
        }
    }

    /** Transforme la date selon le format de date/timezone souhaité. */
    transformDate(date: Date): DateTime; // Depuis le calendrier.
    transformDate(date: string | undefined, inputFormat: string): DateTime; // Depuis la saisie manuelle.
    transformDate(date: Date | string | undefined, inputFormat?: string) {
        const {ISOStringFormat = "utc-midnight"} = this.props;

        let dateTime =
            typeof date === "string" && inputFormat
                ? DateTime.fromFormat(date, inputFormat, this.zone ? {zone: this.zone} : {})
                : date instanceof Date
                ? DateTime.fromJSDate(date, this.zone ? {zone: this.zone} : {})
                : this.zone === "utc"
                ? DateTime.utc()
                : DateTime.now();

        if (ISOStringFormat === "local-utc-midnight") {
            dateTime = dateTime.toUTC();
        }

        return dateTime;
    }

    displayedDate() {
        const {ISOStringFormat} = this.props;
        if (ISOStringFormat === "local-utc-midnight") {
            return this.date.toLocal();
        } else {
            return this.date;
        }
    }

    render() {
        const {
            calendarFormat = "ddd, MMM D",
            calendarProps = {},
            displayFrom = "left",
            error,
            inputFormat = "MM/DD/YYYY",
            inputProps = {},
            theme: pTheme
        } = this.props;
        return (
            <Theme theme={pTheme}>
                {theme => (
                    <div className={theme.input()} data-focus="input-date" data-id={this._inputDateId}>
                        <Input
                            {...inputProps}
                            {...{autoComplete: "off"}}
                            error={error}
                            mask={{pattern: inputFormat.replace(/\w/g, "1")}}
                            onChange={value => (this.dateText = value)}
                            onFocus={() => (this.showCalendar = true)}
                            onKeyDown={this.handleKeyDown}
                            type="string"
                            value={this.dateText ?? ""}
                        />
                        {this.showCalendar ? (
                            <div
                                ref={cal => (this.calendar = cal)}
                                className={theme.calendar({
                                    [this.calendarPosition ?? "down"]: true,
                                    fromRight: displayFrom === "right"
                                })}
                            >
                                <header className={theme.header({[this.calendarDisplay]: true})}>
                                    <span
                                        className={theme.year()}
                                        id="years"
                                        onClick={() => (this.calendarDisplay = "years")}
                                    >
                                        {this.displayedDate().year}
                                    </span>
                                    <h3
                                        className={theme.date()}
                                        id="months"
                                        onClick={() => (this.calendarDisplay = "months")}
                                    >
                                        {this.displayedDate().toFormat(calendarFormat)}
                                    </h3>
                                    <IconButton
                                        icon="clear"
                                        onClick={() => (this.showCalendar = false)}
                                        theme={{toggle: theme.toggle()}}
                                    />
                                </header>
                                <div className={theme.calendarWrapper()}>
                                    <Calendar
                                        {...calendarProps}
                                        display={this.calendarDisplay}
                                        handleSelect={() => null}
                                        onChange={this.onCalendarChange}
                                        selectedDate={this.jsDate}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
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
