import {uniqueId} from "lodash";
import {DateTime} from "luxon";
import {action, makeObservable, observable} from "mobx";
import {observer} from "mobx-react";
import {Component, createRef, KeyboardEvent, ReactNode} from "react";

import {CSSProp, themr} from "@focus4/styling";
import {Clock, ClockCss, IconButton} from "@focus4/toolbox";

import {Input, InputProps} from "./input";

import inputTimeCss, {InputTimeCss} from "./__style__/input-time.css";
export {inputTimeCss};

const Theme = themr("inputTime", inputTimeCss);

/** Props de l'InputTime. */
export interface InputTimeProps {
    /** Format du compoasnt Clock. */
    clockFormat?: "24hr" | "ampm";
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

/** Composant d'input avec une horloge (React-Toolbox). Diffère du TimePicker classique car il n'est pas affiché en plein écran et autorise la saisie manuelle. */
@observer
// eslint-disable-next-line react/no-unsafe
export class InputTime extends Component<InputTimeProps> {
    protected clock?: HTMLDivElement | null;
    protected inputRef = createRef<Input<"string">>();

    /** Id unique de l'input time, pour gérer la fermeture en cliquant à l'extérieur. */
    protected readonly _inputTimeId = uniqueId("input-time-");

    /** Heure actuelle. */
    @observable protected time = this.toLuxon(this.props.value);

    /** Contenu du champ texte. */
    @observable protected timeText = this.formatTime(this.props.value);

    /** Affiche l'horloge. */
    @observable protected showClock = false;

    /** Mode de l'horloge. */
    @observable protected clockDisplay = "hours" as "hours" | "minutes";

    /** Position de l'horloge. */
    @observable protected clockPosition?: "down" | "up";

    constructor(props: InputTimeProps) {
        super(props);
        makeObservable(this);
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.onDocumentClick);
    }

    @action
    // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
    UNSAFE_componentWillReceiveProps({value}: InputTimeProps) {
        this.time = this.toLuxon(value);
        this.timeText = this.formatTime(value);
    }

    // Met à jour la position du calendrier.
    componentDidUpdate() {
        if (this.clock && this.showClock) {
            const client = this.clock.getBoundingClientRect();
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            if (!this.clockPosition) {
                if (client.top + client.height > screenHeight) {
                    this.clockPosition = "up";
                } else {
                    this.clockPosition = "down";
                }
            }
        } else {
            this.clockPosition = undefined;
        }
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.onDocumentClick);
    }

    /** Convertit le texte en objet momentJS. */
    toLuxon(value?: string) {
        const {timezoneCode} = this.props;
        if (isISOString(value)) {
            return DateTime.fromISO(value, timezoneCode ? {zone: timezoneCode} : {});
        } else {
            return DateTime.now();
        }
    }

    /** Recupère la date pour le TimePicker */
    getTime() {
        const {timezoneCode} = this.props;
        // Vérifie que la timezone existe
        if (timezoneCode) {
            return getPickerTime(this.time.toJSDate(), timezoneCode);
        }
        return this.time.toJSDate();
    }

    /** Formatte l'heure (ISO String) en entrée. */
    formatTime(value?: string) {
        const {inputFormat = "HH:mm", timezoneCode} = this.props;
        if (isISOString(value)) {
            return DateTime.fromISO(value, timezoneCode ? {zone: timezoneCode} : {}).toFormat(inputFormat);
        } else {
            return value;
        }
    }

    @action.bound
    closeClock() {
        this.showClock = false;
        this.clockDisplay = "hours";
        this.inputRef.current?.htmlInput?.blur();
    }

    /** Ferme le calendrier lorsqu'on clic à l'extérieur du picker. */
    @action.bound
    onDocumentClick({target}: Event) {
        let parent = target as HTMLElement | null;

        while (parent && parent.getAttribute("data-id") !== this._inputTimeId) {
            parent = parent.parentElement;
        }

        if (this.showClock && !parent) {
            this.closeClock();
            this.onInputBlur();
        }
    }

    /** Appelé lorsqu'on quitte le champ texte. */
    @action.bound
    onInputBlur() {
        const {inputFormat = "HH:mm", onChange} = this.props;
        const text = (this.timeText ?? "").trim() || undefined;

        const time = text ? DateTime.fromFormat(text, inputFormat) : DateTime.now();

        const dateTime = this.time.set({hour: time.hour, minute: time.minute});

        if (dateTime.isValid) {
            this.time = dateTime;
            onChange(dateTime.toISO() ?? "");
        } else {
            onChange(text);
        }
    }

    /** Au clic sur l'horloge. */
    @action.bound
    onClockChange(time: Date) {
        const {timezoneCode} = this.props;
        // Vérifie que la timezone existe
        if (timezoneCode) {
            time = getTimezoneTime(time, timezoneCode);
        }
        return this.props.onChange(DateTime.fromJSDate(time).toISO() ?? "");
    }

    @action.bound
    onHandMoved() {
        if (this.clockDisplay === "hours") {
            this.clockDisplay = "minutes";
        } else {
            this.closeClock();
        }
    }

    /** Ferme l'horloge lorsqu'on appuie sur Entrée ou Tab. */
    @action.bound
    handleKeyDown({key}: KeyboardEvent) {
        if (key === "Tab" || key === "Enter") {
            this.closeClock();
            this.onInputBlur();
        }
    }

    render() {
        const {
            clockFormat = "24hr",
            clockTheme,
            displayFrom = "left",
            error,
            id,
            inputFormat = "HH:mm",
            inputProps = {},
            name,
            theme: pTheme
        } = this.props;
        return (
            <Theme theme={pTheme}>
                {theme => (
                    <div className={theme.input()} data-focus="input-time" data-id={this._inputTimeId}>
                        <Input
                            {...inputProps}
                            {...{autoComplete: "off"}}
                            ref={this.inputRef}
                            error={error}
                            id={id}
                            mask={{pattern: inputFormat.replace(/\w/g, "1")}}
                            name={name}
                            onChange={value => (this.timeText = value)}
                            onFocus={() => (this.showClock = true)}
                            onKeyDown={this.handleKeyDown}
                            type="string"
                            value={this.timeText ?? ""}
                        />
                        {this.showClock ? (
                            <div
                                ref={clo => (this.clock = clo)}
                                className={theme.clock({
                                    [this.clockPosition ?? "down"]: true,
                                    fromRight: displayFrom === "right"
                                })}
                            >
                                <header className={theme.header()}>
                                    <span
                                        className={theme.hours({selected: this.clockDisplay === "hours"})}
                                        id="hours"
                                        onClick={() => (this.clockDisplay = "hours")}
                                    >
                                        {`0${this.time.hour}`.slice(-2)}
                                    </span>
                                    <span className={theme.separator()}>:</span>
                                    <span
                                        className={theme.minutes({selected: this.clockDisplay === "minutes"})}
                                        id="minutes"
                                        onClick={() => (this.clockDisplay = "minutes")}
                                    >
                                        {`0${this.time.minute}`.slice(-2)}
                                    </span>
                                    <IconButton
                                        icon="clear"
                                        onClick={this.closeClock}
                                        theme={{toggle: theme.toggle()}}
                                    />
                                </header>
                                <Clock
                                    display={this.clockDisplay}
                                    format={clockFormat}
                                    onChange={this.onClockChange}
                                    onHandMoved={this.onHandMoved}
                                    theme={clockTheme}
                                    time={this.getTime()}
                                />
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
