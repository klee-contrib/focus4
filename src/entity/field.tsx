import {autobind} from "core-decorators";
import i18n from "i18next";
import {result} from "lodash";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import InputText from "focus-components/input-text";
import Label, {LabelProps} from "focus-components/label";

import {BaseDisplayProps, BaseInputProps, Domain} from "./types";
import {validate} from "./validation";

import * as styles from "./__style__/field.css";
export type FieldStyle = Partial<typeof styles>;

export type RefValues<T, VK extends string, LK extends string> = {[P in VK]: T} & {[P in LK]: string};

/** Props pour le Field, se base sur le contenu d'un domaine. */
export interface FieldProps<
    T,                                   // Type de la valeur.
    ICProps extends BaseInputProps,      // Props du composant d'input.
    DCProps extends BaseDisplayProps,    // Props du component d'affichage.
    LCProps extends Partial<LabelProps>, // Props du component de libellé.
    R extends RefValues<T, VK, LK>,      // Type de la liste de référence associée.
    VK extends string,                   // Nom de la propriété de valeur (liste de référence).
    LK extends string                    // Nom de la propriété de libellé (liste de référence).
> extends Domain<ICProps, DCProps, LCProps> {
    /** Par défaut: "top". */
    contentCellPosition?: string;
    /** Par défaut : 0. */
    contentOffset?: number;
    /** Par défaut : 12. */
    contentSize?: number;
    /** Surcharge l'erreur du field. */
    error?: string | null;
    /** Force l'affichage de l'erreur, même si le champ n'a pas encore été modifié. */
    forceErrorDisplay?: boolean;
    /** Affiche le label. */
    hasLabel?: boolean;
    /** A utiliser à la place de `ref`. */
    innerRef?: (i: Field<T, ICProps, DCProps, LCProps, R, VK, LK>) => void;
    /** Champ en édition. */
    isEdit?: boolean;
    /** Champ requis. */
    isRequired?: boolean;
    /** Libellé du champ. */
    label?: string;
    /** Par défaut : "top". */
    labelCellPosition?: string;
    /** Nom de la propriété de libellé. Doit être casté en lui-même (ex: `{labelKey: "label" as "label"}`). Par défaut: "label". */
    labelKey?: LK;
    /** Par défaut : 0. */
    labelOffset?: number;
    /** Par défaut : 4. */
    labelSize?: number;
    /** Nom du champ. */
    name: string;
    /** Handler de modification de la valeur. */
    onChange?: ICProps["onChange"];
    /** CSS. */
    theme?: FieldStyle;
    /** Valeur. */
    value: any;
    /** Nom de la propriété de valeur. Doit être casté en lui-même (ex: `{valueKey: "code" as "code"}`). Par défaut: "code". */
    valueKey?: VK;
    /** Liste des valeurs de la liste de référence. Doit contenir les propriétés `valueKey` et `labelKey`. */
    values?: R[];
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
@themr("field", styles)
@autobind
@observer
export class Field<
    T,
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends Partial<LabelProps>,
    R extends RefValues<T, VK, LK> ,
    VK extends string,
    LK extends string
> extends React.Component<FieldProps<T, ICProps, DCProps, LCProps, R, VK, LK>, void> {

    /** Affiche l'erreur du champ. Initialisé à `false` pour ne pas afficher l'erreur dès l'initilisation du champ avant la moindre saisie utilisateur. */
    @observable showError = this.props.forceErrorDisplay || false;

    componentWillUpdate({value}: FieldProps<T, ICProps, DCProps, LCProps, R, VK, LK>) {
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
        if (isRequired && (value === undefined || value === null || value === "")) {
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
        const {valueKey = "code", labelKey = "label", values, value: rawValue, formatter, DisplayComponent, displayProps = {}, isEdit = false} = this.props;
        const value = values ? result(values.find(v => v[valueKey as keyof R] === rawValue), labelKey) : rawValue; // Résout la valeur dans le cas d'une liste de référence.
        const FinalDisplay: React.ComponentClass<BaseDisplayProps> | React.SFC<BaseDisplayProps> = DisplayComponent || (() => <div>{formatter && formatter(value, {isEdit}) || value}</div>);
        return (
            <FinalDisplay
                {...displayProps as {}}
                formattedInputValue={formatter && formatter(value, {isEdit}) || value}
                rawInputValue={value}
                value={value}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input() {
        const {InputComponent, formatter, value, isEdit = false, valueKey = "code", labelKey = "label", values, inputProps, name, onChange} = this.props;
        const FinalInput: React.ComponentClass<BaseInputProps> | React.SFC<BaseInputProps> = InputComponent || InputText;
        const valid = !(this.showError && this.error);

        // On renseigne `formattedInputValue`, `value` et `rawInputValue` pour être sûr de prendre en compte tous les types de composants.
        return (
            <FinalInput
                {...inputProps as {}}
                error={valid ? null : this.error}
                formattedInputValue={formatter && formatter(value, {isEdit}) || value}
                labelKey={labelKey}
                name={name}
                onChange={onChange}
                rawInputValue={value}
                valid={valid}
                valueKey={valueKey}
                values={values}
            />
        );
    }

    /** Affiche le composant de libellé (`LabelComponent`). */
    label() {
        const {name, label, LabelComponent} = this.props;
        const FinalLabel = LabelComponent || Label;
        return <FinalLabel name={name} text={label} />;
    }

    render() {
        const {contentCellPosition = "top", contentSize = 12, labelSize = 4, labelCellPosition = "top", contentOffset = 0, labelOffset = 0, isRequired, hasLabel, isEdit, theme, className = ""} = this.props;
        return (
            <div className={`mdl-grid ${theme!.field!} ${isEdit ? theme!.edit! : ""} ${this.error && this.showError ? theme!.invalid! : ""} ${isRequired ? theme!.required! : ""} ${className}`}>
                {hasLabel ?
                    <div className ={`${getCellGridClassName(labelCellPosition, labelSize, labelOffset)} ${theme!.label!}`}>
                        {this.label()}
                    </div>
                : null}
                <div className ={`${getCellGridClassName(contentCellPosition, contentSize - labelSize, contentOffset)} ${theme!.value!} ${className}`}>
                    {isEdit ? this.input() : this.display()}
                </div>
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
