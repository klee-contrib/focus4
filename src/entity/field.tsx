import {autobind} from "core-decorators";
import i18n from "i18next";
import {find, omit, result} from "lodash";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import InputText from "focus-components/input-text";
import Label from "focus-components/label";

import {Domain} from "./types";
import {validate} from "./validation";

import * as styles from "./__style__/field.css";
export type FieldStyle = Partial<typeof styles>;

/** Props pour le Field, se base sur le contenu d'un domaine. */
export interface FieldProps extends Domain {

    // Props passées aux composants Display/Field/Input.
    error?: string | null;
    isEdit?: boolean;
    labelKey?: string;
    name?: string;
    value?: any;
    valueKey?: string;
    values?: any[];

    // Props propres au Field.
    contentCellPosition?: string;
    contentOffset?: number;
    contentSize?: number;
    forceErrorDisplay?: boolean;
    hasLabel?: boolean;
    innerRef?: (i: Field) => void;
    isRequired?: boolean;
    label?: string;
    labelCellPosition?: string;
    labelOffset?: number;
    labelSize?: number;
    theme?: FieldStyle;
}

/** Liste de toutes les props qu'on ne passera pas aux composants d'input ou display. */
const omittedProps = [
    "className",
    "contentCellPosition",
    "contentOffset",
    "contentSize",
    "forceErrorDisplay",
    "hasLabel",
    "isRequired",
    "label",
    "labelCellPosition",
    "labelOffset",
    "labelSize",
    "theme",
    "validator",
    "DisplayComponent",
    "FieldComponent",
    "InputComponent",
    "LabelComponent"
];

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
@themr("field", styles)
@autobind
@observer
export class Field extends React.Component<FieldProps, void> {

    /** Affiche l'erreur du champ. Initialisé à `false` pour ne pas afficher l'erreur dès l'initilisation du champ avant la moindre saisie utilisateur. */
    @observable showError = this.props.forceErrorDisplay || false;

    componentWillUpdate({value}: FieldProps) {
        // On affiche l'erreur dès que et à chaque fois que l'utilisateur modifie la valeur (et à priori pas avant).
        if (value) {
            this.showError = true;
        }
    }

    /** Récupère l'erreur associée au champ. Si la valeur vaut `undefined`, alors il n'y en a pas. */
    @computed
    get error(): string | undefined {
        const {error, value} = this.props;

        // On priorise l'éventuelle erreur passée en props.
        if (error !== undefined) {
            return error || undefined;
        }

        // On vérifie que le champ n'est pas vide et obligatoire.
        const {isRequired, validator, label = ""} = this.props;
        if (isRequired && (undefined === value || null === value || "" === value)) {
            return i18n.t("focus.validation.required");
        }

        // On applique le validateur du domaine.
        if (validator && value !== undefined && value !== null) {
            const validStat = validate({value, name: i18n.t(label)}, validator);
            if (validStat.errors.length) {
                return i18n.t(validStat.errors.join(", "));
            }
        }

        // Pas d'erreur.
        return undefined;
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {valueKey, labelKey, values, value: rawValue, formatter, DisplayComponent, isEdit = false} = this.props;
        const value = values ? result(find(values, {[valueKey || "code"]: rawValue}), labelKey || "label") : rawValue; // Résout la valeur dans le cas d'une liste de référence.
        const props = omit(this.props, omittedProps);
        const FinalDisplay = DisplayComponent || (() => <div>{formatter && formatter(value, {isEdit}) || value}</div>);
        return <FinalDisplay {...props} formattedInputValue={formatter && formatter(value, {isEdit}) || value} rawInputValue={value} />;
    }

    /** Affiche un composant de champ entièrement personnalisé (`FieldComponent`). */
    field() {
        const {FieldComponent} = this.props;
        const valid = !(this.showError && this.error);
        if (FieldComponent) {
            const props = omit(this.props, omittedProps);
            return <FieldComponent {...props} valid={valid} error={valid ? null : this.error} />;
        } else {
            return null;
        }
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input() {
        const {InputComponent, formatter, value, isEdit = false} = this.props;
        const props = omit(this.props, omittedProps);
        const FinalInput = InputComponent || InputText;
        const valid = !(this.showError && this.error);

        // On renseigne `formattedInputValue`, `value` et `rawInputValue` pour être sûr de prendre en compte tous les types de composants.
        return <FinalInput {...props} formattedInputValue={formatter && formatter(value, {isEdit}) || value} rawInputValue={value} valid={valid} error={valid ? null : this.error} />;
    }

    /** Affiche le composant de libellé (`LabelComponent`). */
    label() {
        const {name, label, LabelComponent, labelCellPosition = "top", labelSize = 4, labelOffset = 0, theme} = this.props;
        const FinalLabel = LabelComponent || Label;
        return (
            <div className ={`${getCellGridClassName(labelCellPosition, labelSize, labelOffset)} ${theme!.label!}`}>
                <FinalLabel name={name} text={label} />
            </div>
        );
    }

    render() {
        const {FieldComponent, contentCellPosition = "top", contentSize = 12, labelSize = 4, contentOffset = 0, isRequired, hasLabel, isEdit, theme, className = ""} = this.props;
        return (
            <div className={`mdl-grid ${theme!.field!} ${isEdit ? theme!.edit! : ""} ${this.error && this.showError ? theme!.invalid! : ""} ${isRequired ? theme!.required! : ""} ${className}`}>
                {FieldComponent ? this.field() : null}
                {!FieldComponent && hasLabel ? this.label() : null}
                {!FieldComponent ?
                    <div className ={`${getCellGridClassName(contentCellPosition, contentSize - labelSize, contentOffset)} ${theme!.value!} ${className}`}>
                        {isEdit ? this.input() : this.display()}
                    </div>
                : null}
            </div>
        );
    }
}

function buildGridClassName(prop: string | number, suffix?: string) {
    return `mdl-cell--${prop}${suffix ? suffix : ""}`;
}

function getCellGridClassName(position: string, size: number, offset: number) {
    const cellPosition = buildGridClassName(position);
    const cellSize = buildGridClassName(size, "-col");
    const cellOffset = buildGridClassName(offset, "-offset");
    return `mdl-cell ${cellPosition} ${cellSize} ${cellOffset}`;
}
