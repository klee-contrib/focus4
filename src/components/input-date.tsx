import {autobind} from "core-decorators";
import {isArray, uniqueId} from "lodash";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import moment from "moment";
import * as React from "react";
import {themr} from "react-css-themr";
import {IconButton} from "react-toolbox/lib/button";
import {DatePickerTheme} from "react-toolbox/lib/date_picker";
import calendarFactory from "react-toolbox/lib/date_picker/Calendar";
import {Input} from "react-toolbox/lib/input";

import * as styles from "react-toolbox/lib/date_picker/theme.css";
import {calendar, fromRight, input, toggle} from "./__style__/input-date.css";

const Calendar = calendarFactory(IconButton);

export interface InputDateProps {
    /** Format de l'affichage de la date dans le calendrier. */
    calendarFormat?: string;
    /** Désactive l'input. */
    disabled?: boolean;
    /** Composant affiché depuis la gauche ou la droite. */
    displayFrom?: "left" | "right";
    /** Message d'erreur. */
    error?: string | null;
    /** Format de la date dans l'input. */
    inputFormat?: string | string[];
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
     * Par défaut "utc-midnight".
     */
    ISOStringFormat?: "utc-midnight" | "local-midnight" | "local-utc-midnight";
    /** Nom de l'input. */
    name?: string;
    /** Est appelé au clic sur le calendrier ou au blur (n'est pas synchronisé avec le texte). */
    onChange: (date?: string) => void;
    /** Placeholder. */
    placeholder?: string;
    /** CSS. */
    theme?: DatePickerTheme;
    /** Valeur. */
    value?: string;
}

/** Composant d'input avec un calendrier (React-Toolbox). Diffère du DatePicker classique car il n'est pas affiché en plein écran et autorise la saisie manuelle. */
@autobind
@observer
export class InputDate extends React.Component<InputDateProps, void> {

    /** Id unique de l'input date, pour gérer la fermeture en cliquant à l'extérieur. */
    private readonly _inputDateId = uniqueId("input-date-");

    /** Date actuelle. */
    @observable private date = this.toMoment(this.props.value);

    /** Contenu du champ texte. */
    @observable private dateText = this.formatDate(this.props.value);

    /** Affiche le calendrier. */
    @observable private showCalendar = false;

    /** Mode du calendrier. */
    @observable private calendarDisplay = "months" as "months" | "years";

    componentWillMount() {
        document.addEventListener("mousedown", this.onDocumentClick);
    }

    @action
    componentWillReceiveProps({value}: InputDateProps) {
        this.date = this.toMoment(value);
        this.dateText = this.formatDate(value);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.onDocumentClick);
    }

    /** Convertit le texte en objet MomentJS. */
    toMoment(value?: string) {
        const {ISOStringFormat = "utc-midnight"} = this.props;
        const m = ISOStringFormat === "utc-midnight" ? moment.utc : moment;

        if (isISOString(value)) {
            return m(value, moment.ISO_8601);
        } else {
            return m()
                .hour(0)
                .minute(0)
                .second(0);
        }
    }

    /** Formatte la date (ISO String) en entrée selon le format demandé. */
    formatDate(value?: string) {
        const {inputFormat = "MM/DD/YYYY"} = this.props;
        if (isISOString(value)) {
            // Le format d'ISO String n'importe peu, ça revient au même une fois formatté.
            return moment(value, moment.ISO_8601)
                .format(isArray(inputFormat) ? inputFormat[0] : inputFormat);
        } else {
            return value;
        }
    }

    /** Ferme le calendrier lorsqu'on clic à l'extérieur du picker. */
    @action
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
    @action
    onInputBlur() {
        const {inputFormat = "MM/DD/YYYY", onChange} = this.props;
        const text = (this.dateText || "").trim() || undefined;

        const date = this.transformDate(text, inputFormat, true);

        if (date.isValid()) {
            this.date = date;
            onChange(date.format());
        } else {
            onChange(text);
        }

    }

    /** Au clic sur le calendrier. */
    @action
    onCalendarChange(date: Date, dayClick: boolean) {
        const {ISOStringFormat = "utc-midnight"} = this.props;

        // On arrange la date pour forcer le minuit demandé, au cas où la date d'entrée ne soit pas dans la même timezone.
        if (ISOStringFormat === "utc-midnight") {
            date.setUTCHours(0);
        } else {
            date.setHours(0);
        }
        date.setMinutes(0);
        date.setSeconds(0);

        const correctedDate = this.transformDate(date)
            .format();
        this.props.onChange(correctedDate);
        if (!dayClick) {
            this.calendarDisplay = "months";
        } else {
            this.showCalendar = false;
        }
    }

    /** Ferme le calendrier lorsqu'on appuie sur Entrée ou Tab. */
    @action
    handleKeyDown({key}: KeyboardEvent) {
        if (key === "Tab" || key === "Enter") {
            this.showCalendar = false;
            this.onInputBlur();
        }
    }

    /** Transforme la date selon le format de date/timezone souhaité. */
    transformDate(date: Date): moment.Moment; // Depuis le calendrier.
    transformDate(date: string | undefined, inputFormat: string | string[], strict: true): moment.Moment; // Depuis la saisie manuelle.
    transformDate(...params: any[]) {
        const {ISOStringFormat = "utc-midnight"} = this.props;

        // Dans les deux cas, la date d'entrée est bien en "local-midnight".
        if (ISOStringFormat === "local-midnight") {
            return moment(...params);
        } else if (ISOStringFormat === "utc-midnight") {
            return moment.utc(...params);
        } else {
            return moment(...params)
                .utcOffset(0);
        }
    }

    render() {
        const {error, name, placeholder, disabled, theme, calendarFormat = "ddd, MMM D", displayFrom = "left"} = this.props;
        return (
            <div data-focus="input-date" data-id={this._inputDateId} className={input}>
                <Input
                    disabled={disabled}
                    error={error}
                    name={name}
                    onChange={(value: string) => this.dateText = value}
                    onKeyDown={this.handleKeyDown}
                    onFocus={() => this.showCalendar = true}
                    hint={placeholder}
                    value={this.dateText || ""}
                />
                {this.showCalendar ?
                    <div className={`${calendar} ${displayFrom === "right" ? fromRight : ""}`}>
                        <header className={`${theme!.header} ${(theme as any)[`${this.calendarDisplay}Display`]}`}>
                            <span id="years" className={theme!.year} onClick={() => this.calendarDisplay = "years"}>
                                {this.date.year()}
                            </span>
                            <h3 id="months" className={theme!.date} onClick={() => this.calendarDisplay = "months"}>
                                {this.date.format(calendarFormat)}
                            </h3>
                            <IconButton icon="clear" theme={{ toggle }} onClick={() => this.showCalendar = false} />
                        </header>
                        <div className={theme!.calendarWrapper}>
                            <Calendar
                                handleSelect={() => null}
                                selectedDate={this.date.toDate()}
                                display={this.calendarDisplay}
                                locale={moment.locale()}
                                onChange={this.onCalendarChange}
                                theme={theme}
                            />
                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("RTDatePicker", styles)(InputDate);

/** Détermine si une valeur est un ISO String. */
function isISOString(value?: string) {
    return moment(value, moment.ISO_8601, true)
        .isValid();
}
