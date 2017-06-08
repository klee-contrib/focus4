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

import * as theme from "react-toolbox/lib/date_picker/theme.css";
import {calendar, input, toggle} from "./__style__/input-date.css";

const Calendar = calendarFactory(IconButton);

export interface InputDateProps {
    /** Format de l'affichage de la date dans le calendrier. */
    calendarFormat?: string;
    /** Désactive l'input. */
    disabled?: boolean;
    /** Message d'erreur. */
    error?: string | null;
    /** Format de la date dans l'input. */
    inputFormat?: string | string[];
    /** Nom de l'input. */
    name?: string;
    /** Est appelé au clic sur le calendrier ou au blur (n'est pas synchronisé avec le texte). */
    onChange: (date: string) => void;
    /** Placeholder. */
    placeholder?: string;
    /** CSS. */
    theme?: DatePickerTheme;
    /** Valeur. */
    value?: string;
}

/** Composant d'input avec un calendrier. Diffère du DatePicker car il n'est pas affiché en plein écran et autorise la saisie manuelle. */
@autobind
@observer
export class InputDate extends React.Component<InputDateProps, void> {

    /** Id unique de l'input date, pour gérer la fermeture en cliquant à l'extérieur. */
    private _inputDateId = uniqueId("input-date-");

    /** Date actuelle. */
    @observable private date = toMoment(this.props.value);

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
        this.date = toMoment(value),
        this.dateText = this.formatDate(value);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.onDocumentClick);
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

    /** Formatte la date (ISO String) selon le format demandé. */
    formatDate(isoDate?: string) {
        const {inputFormat = "MM/DD/YYYY"} = this.props;
        if (isISOString(isoDate)) {
            return moment.utc(isoDate, moment.ISO_8601).format(isArray(inputFormat) ? inputFormat[0] : inputFormat);
        } else {
            return isoDate;
        }
    }

    /** Appelé lorsqu'on quitte le champ texte. */
    @action
    onInputBlur() {
        const {inputFormat = "MM/DD/YYYY", onChange} = this.props;
        const text = (this.dateText || "").trim();

        const date = moment.utc(text, inputFormat, true);

        if (date.isValid()) {
            this.date = date;
            onChange(date.toISOString());
        } else {
            onChange(text);
        }

    }

    /** Au clic sur le calendrier. */
    @action
    onCalendarChange(date: Date, dayClick: boolean) {
        const correctedDate = moment.utc(date).minute(0).second(0).hour(0).utcOffset(0).toISOString(); // Add UTC offset to get right ISO string
        this.props.onChange(correctedDate);
        if (!dayClick) {
            this.calendarDisplay = "months";
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

    render() {
        const {error, name, placeholder, disabled, theme, calendarFormat = "ddd, MMM D"} = this.props;
        return (
            <div data-id={this._inputDateId} className={input}>
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
                    <div className={calendar}>
                        <header className={`${theme!.header} ${(theme as any)[`${this.calendarDisplay}Display`]}`}>
                            <span id="years" className={theme!.year} onClick={() => this.calendarDisplay = "years"}>
                                {this.date.year()}
                            </span>
                            <h3 id="months" className={theme!.date} onClick={() => this.calendarDisplay = "months"}>
                                {this.date.format(calendarFormat)}
                            </h3>
                            <IconButton icon="clear" theme={{toggle}} onClick={() => this.showCalendar = false} />
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

export default themr("RTDialog", theme)(InputDate);

/** Détermine si une valeur est un ISO String. */
function isISOString(value?: string) {
    return moment.utc(value, moment.ISO_8601, true).isValid();
}

/** Convertit le texte en objet MomentJS. */
function toMoment(value?: string) {
    return isISOString(value) ? moment.utc(value, moment.ISO_8601) : moment.utc();
}
