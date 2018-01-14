import {autobind} from "core-decorators";
import i18next from "i18next";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themeable, themr} from "react-css-themr";

import {Display, DisplayProps, Input, InputProps, Label, LabelProps} from "../components";

import {Domain, EntityField} from "./types";

import * as styles from "./__style__/field.css";

export type FieldStyle = Partial<typeof styles>;

export type RefValues<T, ValueKey extends string, LabelKey extends string> = {[P in ValueKey]: T} & {[P in LabelKey]: string};

/** Options pour gérer une liste de référence. */
export interface ReferenceOptions<
    T,
    R extends RefValues<T, ValueKey, LabelKey>,
    ValueKey extends string,
    LabelKey extends string
> {
    /** Nom de la propriété de libellé. Doit être casté en lui-même (ex: `{labelKey: "label" as "label"}`). Par défaut: "label". */
    labelKey?: LabelKey;
    /** Nom de la propriété de valeur. Doit être casté en lui-même (ex: `{valueKey: "code" as "code"}`). Par défaut: "code". */
    valueKey?: ValueKey;
    /** Liste des valeurs de la liste de référence. Doit contenir les propriétés `valueKey` et `labelKey`. */
    values?: R[];
}

/** Options pour un champ défini à partir de `fieldFor` et consorts. */
export interface FieldOptions<
    T,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps,
    R extends RefValues<T, ValueKey, LabelKey> = any,
    ValueKey extends string = "code",
    LabelKey extends string = "label"
> extends ReferenceOptions<T, R, ValueKey, LabelKey> {
    /** Désactive le style inline qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
    /** Surcharge l'erreur du field. */
    error?: string | null;
    /** Force l'affichage de l'erreur, même si le champ n'a pas encore été modifié. */
    forceErrorDisplay?: boolean;
    /** Service de résolution de code. */
    keyResolver?: (key: number | string) => Promise<string>;
    /** Affiche le label. */
    hasLabel?: boolean;
    /** Pour l'icône de la Tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** A utiliser à la place de `ref`. */
    innerRef?: (i: Field<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>) => void;
    /** Champ en édition. */
    isEdit?: boolean;
    /** Par défaut : "top". */
    labelCellPosition?: string;
    /** Largeur en % du label. Par défaut : 33. */
    labelRatio?: number;
    /** Handler de modification de la valeur. */
    onChange?: (value: T) => void;
    /** Affiche la tooltip. */
    showTooltip?: boolean;
    /** CSS. */
    theme?: FieldStyle & {display?: DCProps["theme"], input?: ICProps["theme"]};
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
@autobind
@observer
export class Field<
    T,
    ICProps extends {theme?: {}} = InputProps,
    DCProps extends {theme?: {}} = DisplayProps,
    LCProps = LabelProps,
    R extends RefValues<T, ValueKey, LabelKey> = any,
    ValueKey extends string = "code",
    LabelKey extends string = "label"
> extends React.Component<FieldOptions<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey> & {field: EntityField<T, Domain<ICProps, DCProps, LCProps>>}, void> {

    /** Affiche l'erreur du champ. Initialisé à `false` pour ne pas afficher l'erreur dès l'initilisation du champ avant la moindre saisie utilisateur. */
    @observable showError = this.props.forceErrorDisplay || false;

    componentWillUpdate({field}: {field: EntityField<T, Domain<ICProps, DCProps, LCProps>>}) {
        // On affiche l'erreur dès que et à chaque fois que l'utilisateur modifie la valeur (et à priori pas avant).
        if (field.value) {
            this.showError = true;
        }
    }

    @computed
    get error() {
        return this.props.field.error;
    }

    /** Appelé lors d'un changement sur l'input. */
    onChange(value: any) {
        const {onChange, field: {$field: {domain}}} = this.props;
        if (onChange) {
            (onChange as any)(domain.unformatter && domain.unformatter(value) || value);
        }
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {valueKey = "code", labelKey = "label", values, field, keyResolver, theme} = this.props;
        const {value, $field: {domain: {displayFormatter = (t: any) => i18next.t(t), DisplayComponent = Display as any, displayProps = {}}}} = field;
        return (
            <DisplayComponent
                {...displayProps as {}}
                formatter={displayFormatter}
                keyResolver={keyResolver}
                labelKey={labelKey}
                theme={themeable(displayProps.theme || {} as any, theme!.display as any)}
                value={value as any}
                valueKey={valueKey}
                values={values}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input() {
        const {field, valueKey = "code", labelKey = "label", values, keyResolver, theme} = this.props;
        const {value, error, $field: {name, domain: {InputComponent = Input, inputFormatter = ((x: string) => x), inputProps = {}}}} = field;
        let props: any = {
            ...inputProps as {},
            value: inputFormatter(value as any),
            error: this.showError && error || undefined,
            name,
            id: name,
            onChange: this.onChange,
            theme: themeable(inputProps.theme || {} as any, theme!.input as any)
        };

        if (values) {
            props = {...props, values, labelKey, valueKey};
        }

        if (keyResolver) {
            props = {...props, keyResolver};
        }

        return <InputComponent {...props} />;
    }

    render() {
        const {disableInlineSizing, hasLabel = true, labelRatio = 33, field, isEdit, showTooltip, i18nPrefix = "focus", theme} = this.props;
        const {valueRatio = 100 - (hasLabel ? labelRatio : 0)} = this.props;
        const {error, $field: {comment, label, isRequired, domain: {className = "", LabelComponent = Label}}} = field;
        return (
            <div className={`${theme!.field} ${isEdit ? theme!.edit : ""} ${error && this.showError ? theme!.invalid : ""} ${isRequired ? theme!.required : ""} ${className}`}>
                {hasLabel ?
                    <LabelComponent
                        comment={comment}
                        i18nPrefix={i18nPrefix}
                        label={label}
                        name={name}
                        showTooltip={showTooltip}
                        style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}}
                        theme={{label: theme!.label}}
                    />
                : null}
                <div style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}} className ={`${theme!.value} ${className}`}>
                    {isEdit ? this.input() : this.display()}
                </div>
            </div>
        );
    }
}

export default themr("field", styles)(Field);
