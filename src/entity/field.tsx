import {autobind} from "core-decorators";
import i18n from "i18next";
import {result} from "lodash";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Input} from "react-toolbox/lib/input";

import {BaseDisplayProps, BaseInputProps, BaseLabelProps, Domain} from "./types";
import {validate} from "./validation";

import * as styles from "./__style__/field.css";
export type FieldStyle = Partial<typeof styles>;

export type RefValues<T, VK extends string, LK extends string> = {[P in VK]: T} & {[P in LK]: string};

/** Props pour le Field, se base sur le contenu d'un domaine. */
export interface FieldProps<
    T,                                  // Type de la valeur.
    ICProps extends BaseInputProps,     // Props du composant d'input.
    DCProps extends BaseDisplayProps,   // Props du component d'affichage.
    LCProps extends BaseLabelProps,     // Props du component de libellé.
    R extends RefValues<T, VK, LK>,     // Type de la liste de référence associée.
    VK extends string,                  // Nom de la propriété de valeur (liste de référence).
    LK extends string                   // Nom de la propriété de libellé (liste de référence).
> extends Domain<ICProps, DCProps, LCProps> {
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
@autobind
@observer
export class Field<
    T,
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps,
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

    /** Appelé lors d'un changement sur l'input. */
    onChange(value: any) {
        const {onChange, unformatter} = this.props;
        if (onChange) {
            (onChange as any)(unformatter && unformatter(value) || value);
        }
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {valueKey = "code", labelKey = "label", values, value: rawValue, displayFormatter, DisplayComponent, displayProps = {}, theme} = this.props;
        const value = values ? result(values.find(v => v[valueKey as keyof R] === rawValue), labelKey) : rawValue; // Résout la valeur dans le cas d'une liste de référence.
        const FinalDisplay: React.ComponentClass<BaseDisplayProps> | React.SFC<BaseDisplayProps> = DisplayComponent || (({text}) => <div className={theme!.display}>{text}</div>);
        return (
            <FinalDisplay
                {...displayProps as {}}
                text={displayFormatter && displayFormatter(value) || value}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input() {
        const {InputComponent, inputFormatter, value, valueKey = "code", labelKey = "label", values, inputProps, name} = this.props;
        const FinalInput: React.ComponentClass<any> | React.SFC<any> = InputComponent || Input;

        let props: any = {
            ...inputProps as {},
            value: inputFormatter && inputFormatter(value) || value,
            error: this.showError && this.error || undefined,
            name,
            onChange: this.onChange
        };

        if (values) {
            props = {...props, values, labelKey, valueKey};
        }

        return <FinalInput {...props} />;
    }

    /** Affiche le composant de libellé (`LabelComponent`). */
    label() {
        const {name, label, LabelComponent} = this.props;
        const FinalLabel = LabelComponent || (() => <label htmlFor={name}>{label && i18n.t(label) || ""}</label>);
        return <FinalLabel name={name} text={label} />;
    }

    render() {
        const {contentSize = 12, labelSize = 4, isRequired, hasLabel = true, isEdit, theme, className = ""} = this.props;
        return (
            <div className={`${theme!.field!} ${isEdit ? theme!.edit! : ""} ${this.error && this.showError ? theme!.invalid! : ""} ${isRequired ? theme!.required! : ""} ${className}`}>
                {hasLabel ?
                    <div style={{width: `${labelSize * 100 / contentSize}%`}} className={theme!.label!}>
                        {this.label()}
                    </div>
                : null}
                <div style={{width: `${(contentSize - (hasLabel ? labelSize : 0)) * 100 / contentSize}%`}} className ={`${theme!.value!} ${className}`}>
                    {isEdit ? this.input() : this.display()}
                </div>
            </div>
        );
    }
}

export default themr("field", styles)(Field);
