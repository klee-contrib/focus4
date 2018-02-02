import {autobind} from "core-decorators";
import {uniqueId} from "lodash";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import moment from "moment";
import * as React from "react";
import {themr} from "react-css-themr";
import {IconButton} from "react-toolbox/lib/button";
import {TimePickerTheme} from "react-toolbox/lib/time_picker";
import Clock from "react-toolbox/lib/time_picker/Clock";

import {Input} from "../components";

import * as styles from "react-toolbox/lib/time_picker/theme.css";
import {calendar, clock, down, fromRight, input, toggle, upClock} from "./__style__/input-date.css";

/** Props de l'InputTime. */
export interface InputTimeProps {
    /** Désactive l'input. */
    disabled?: boolean;
    /** Composant affiché depuis la gauche ou la droite. */
    displayFrom?: "left" | "right";
    /** Message d'erreur. */
    error?: string | null;
    /** Format de l'heure dans l'input. */
    inputFormat?: string;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé au clic sur le calendrier ou au blur (n'est pas synchronisé avec le texte). */
    onChange: (date?: string) => void;
    /** Placeholder. */
    placeholder?: string;
    /** CSS. */
    theme?: TimePickerTheme;
    /** Valeur. */
    value?: string;
}

/** Composant d'input avec une horloge (React-Toolbox). Diffère du TimePicker classique car il n'est pas affiché en plein écran et autorise la saisie manuelle. */
@autobind
@observer
export class InputTime extends React.Component<InputTimeProps, void> {

    private clock?: HTMLDivElement;
    private clockComp?: any;

    /** Id unique de l'input time, pour gérer la fermeture en cliquant à l'extérieur. */
    private readonly _inputTimeId = uniqueId("input-time-");

    /** Heure actuelle. */
    @observable private time = this.toMoment(this.props.value);

    /** Contenu du champ texte. */
    @observable private timeText = this.formatTime(this.props.value);

    /** Affiche l'horloge. */
    @observable private showClock = false;

    /** Mode de l'horloge. */
    @observable private clockDisplay = "hours" as "hours" | "minutes";

    /** Position de l'horloge. */
    @observable private clockPosition?: "up" | "down";

    componentWillMount() {
        document.addEventListener("mousedown", this.onDocumentClick);
        window.addEventListener("scroll", this.resetClockCenter);
    }

    @action
    componentWillReceiveProps({value}: InputTimeProps) {
        this.time = this.toMoment(value);
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
        window.removeEventListener("scroll", this.resetClockCenter);
    }

    /** Reset le centre de l'horloge au scroll, parce que c'est pas prévu par le composant... */
    resetClockCenter() {
        if (this.clockComp) {
            this.clockComp.handleCalculateShape();
        }
    }

    /** Convertit le texte en objet momentJS. */
    toMoment(value?: string) {
        if (isISOString(value)) {
            return moment(value, moment.ISO_8601);
        } else {
            return moment();
        }
    }

    /** Formatte l'heure (ISO String) en entrée. */
    formatTime(value?: string) {
        const {inputFormat = "HH:mm"} = this.props;
        if (isISOString(value)) {
            return moment(value, moment.ISO_8601)
                .format(inputFormat);
        } else {
            return value;
        }
    }

    /** Ferme le calendrier lorsqu'on clic à l'extérieur du picker. */
    @action
    onDocumentClick({target}: Event) {
        let parent = target as HTMLElement | null;

        while (parent && parent.getAttribute("data-id") !== this._inputTimeId) {
            parent = parent.parentElement;
        }

        if (this.showClock && !parent) {
            this.showClock = false;
            this.onInputBlur();
        }
    }

    /** Appelé lorsqu'on quitte le champ texte. */
    @action
    onInputBlur() {
        const {inputFormat = "HH:mm", onChange} = this.props;
        const text = (this.timeText || "").trim() || undefined;

        const time = moment(text, inputFormat, true);

        const dateTime = this.time.clone();
        dateTime.hours(time.hours());
        dateTime.minutes(time.minutes());

        if (dateTime.isValid()) {
            this.time = dateTime;
            onChange(dateTime.format());
        } else {
            onChange(text);
        }

    }

    /** Au clic sur l'horloge. */
    onClockChange(time: Date) {
        this.props.onChange(moment(time)
            .format());
    }

    @action
    onHandMoved() {
        if (this.clockDisplay === "hours") {
            this.clockDisplay = "minutes";
        } else {
            this.clockDisplay = "hours";
            this.showClock = false;
        }
    }

    /** Ferme l'horloge lorsqu'on appuie sur Entrée ou Tab. */
    @action
    handleKeyDown({key}: KeyboardEvent) {
        if (key === "Tab" || key === "Enter") {
            this.showClock = false;
            this.onInputBlur();
        }
    }

    render() {
        const {error, name, placeholder, disabled, theme, inputFormat = "HH:mm", displayFrom = "left"} = this.props;
        return (
            <div data-focus="input-time" data-id={this._inputTimeId} className={input}>
                <Input
                    disabled={disabled}
                    error={error}
                    mask={{pattern: inputFormat.replace(/\w/g, "1")}}
                    name={name}
                    onChange={(value: string) => this.timeText = value}
                    onKeyDown={this.handleKeyDown}
                    onFocus={() => this.showClock = true}
                    hint={placeholder}
                    value={this.timeText || ""}
                />
                {this.showClock ?
                    <div
                        ref={clo => this.clock = clo}
                        className={`${calendar} ${theme!.dialog} ${this.clockDisplay === "hours" ? theme!.hoursDisplay : theme!.minutesDisplay} ${displayFrom === "right" ? fromRight : ""} ${this.clockPosition === "up" ? upClock : down}`}
                    >
                        <header className={theme!.header}>
                            <span id="hours" className={theme!.hours} onClick={() => this.clockDisplay = "hours"}>
                                {(`0${this.time.hours()}`).slice(-2)}
                            </span>
                            <span className={theme!.separator}>:</span>
                            <span id="minutes" className={theme!.minutes} onClick={() => this.clockDisplay = "minutes"}>
                                {(`0${this.time.minutes()}`).slice(-2)}
                            </span>
                            <IconButton icon="clear" theme={{ toggle }} onClick={() => this.showClock = false} />
                        </header>
                        <div className={`${theme!.clockWrapper} ${clock}`}>
                            <Clock
                                ref={c => this.clockComp = c}
                                display={this.clockDisplay}
                                format="24hr"
                                onChange={this.onClockChange}
                                onHandMoved={this.onHandMoved}
                                theme={theme}
                                time={this.time.toDate()}
                            />
                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("RTTimePicker", styles)(InputTime);

/** Détermine si une valeur est un ISO String. */
function isISOString(value?: string) {
    return moment(value, moment.ISO_8601, true)
        .isValid();
}
