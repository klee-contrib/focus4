import i18next from "i18next";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import PropTypes from "prop-types";
import * as React from "react";
import {themeable, themr} from "react-css-themr";
import {findDOMNode} from "react-dom";

import {Display, Input, Label} from "../../components";
import {ReactComponent} from "../../config";
import {ReferenceList} from "../../reference";

import {EntityField, FieldEntry, FormEntityField} from "../types";
import {documentHelper} from "./document-helper";

import * as styles from "./__style__/field.css";

export type FieldStyle = Partial<typeof styles>;

/** Options pour un champ défini à partir de `fieldFor` et consorts. */
export interface FieldOptions<T extends FieldEntry, SProps = {}> {
    /** Désactive le style inline qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
    /** Surcharge l'erreur du field. */
    error?: string | null;
    /** Service de résolution de code. */
    keyResolver?: (key: number | string) => Promise<string>;
    /** Affiche le label. */
    hasLabel?: boolean;
    /** Pour l'icône de la Tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** A utiliser à la place de `ref`. */
    innerRef?: (i: Field<T>) => void;
    /** Par défaut : "top". */
    labelCellPosition?: string;
    /** Largeur en % du label. Par défaut : 33. */
    labelRatio?: number;
    /** Handler de modification de la valeur. */
    onChange?: (value: T["fieldType"]) => void;
    /** @internal */
    /** Pour `selectFor`, composant de Select. */
    SelectComponent?: ReactComponent<SProps>;
    /** Affiche la tooltip de commentaire. */
    showTooltip?: boolean;
    /** CSS. */
    theme?: FieldStyle & {display?: NonNullable<T["domain"]["displayProps"]>["theme"], input?: NonNullable<T["domain"]["inputProps"]>["theme"]};
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
    /** @internal */
    /** Pour `selectFor`, valeurs de la liste de référence associée. */
    values?: ReferenceList;
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
@observer
export class Field<T extends FieldEntry, SProps = {}> extends React.Component<FieldOptions<T, SProps> & {field: EntityField<T>}> {

    // On récupère le forceErrorDisplay du form depuis le contexte.
    static contextTypes = {form: PropTypes.object};
    context!: {form?: {forceErrorDisplay: boolean}};

    /** <div /> contenant le composant de valeur (input ou display). */
    @observable
    private valueElement?: Element;
    /** Masque l'erreur à l'initilisation du Field si on est en mode edit et que le valeur est vide (= cas standard de création). */
    @observable
    private hideErrorOnInit = (this.props.field as FormEntityField<T>).isEdit && !this.props.field.value;

    /** Détermine si on affiche l'erreur ou pas. En plus des surcharges du form et du field lui-même, l'erreur est masquée si le champ est en cours de saisie. */
    @computed
    get showError() {
        return (!this.hideErrorOnInit || this.context.form && this.context.form.forceErrorDisplay || false)
            && !documentHelper.isElementActive(this.valueElement);
    }

    // On enregistre le <div> de la valeur et on enregistre un eventListener désactiver le `hideErrorOnInit` au premier clic sur
    componentDidMount() {
        // Poser une ref pose des problèmes de stack overflow (pas vraiment clair pourquoi), donc on fait un truc moisi pour récupérer le noeud qu'on veut.
        const children = findDOMNode(this).children;
        this.valueElement = children.item(children.length - 1);
        if (this.hideErrorOnInit) {
            this.valueElement.addEventListener("mousedown", this.disableHideError);
        }
    }

    /** Désactive le masquage de l'erreur si le champ était en création avant le premier clic. */
    @action.bound
    private disableHideError() {
        this.hideErrorOnInit = false;
        this.valueElement!.removeEventListener("mousedown", this.disableHideError);
    }

    /** Appelé lors d'un changement sur l'input. */
    @action.bound
    onChange(value: T["fieldType"]) {
        const {onChange, field: {$field: {domain}}} = this.props;
        if (onChange) {
            onChange(domain.unformatter && domain.unformatter(value) || value);
        }
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {values, field, keyResolver, theme} = this.props;
        const {value, $field: {domain: {displayFormatter = (t: string) => i18next.t(t), DisplayComponent = Display as any, displayProps = {}}}} = field;
        return (
            <DisplayComponent
                {...displayProps as {}}
                formatter={displayFormatter}
                keyResolver={keyResolver}
                labelKey={values && values.$labelKey || "code"}
                theme={themeable(displayProps.theme || {}, theme!.display || {})}
                value={value}
                valueKey={values && values.$valueKey || "label"}
                values={values}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input() {
        const {field, values, keyResolver, SelectComponent, theme} = this.props;
        const {value, error, $field: {name, domain: {InputComponent = Input, inputFormatter = ((x?: string) => x), inputProps = {}}}} = field as FormEntityField<T>;
        let props: any = {
            ...inputProps as {},
            value: inputFormatter(value),
            error: this.showError && error || undefined,
            name,
            id: name,
            onChange: this.onChange,
            theme: themeable(inputProps.theme || {}, theme!.input || {})
        };

        if (keyResolver) {
            props = {...props, keyResolver};
        }

        if (SelectComponent && values) {
            return (
                <SelectComponent
                    {...props}
                    values={values.slice()}
                    labelKey={values && values.$labelKey || "code"}
                    valueKey={values && values.$valueKey || "label"}
                />
            );
        } else {
            return <InputComponent {...props} />;
        }
    }

    render() {
        const {disableInlineSizing, hasLabel = true, labelRatio = 33, field, showTooltip, i18nPrefix = "focus", theme} = this.props;
        const {valueRatio = 100 - (hasLabel ? labelRatio : 0)} = this.props;
        const {error, isEdit, $field: {comment, label, isRequired, domain: {className = "", LabelComponent = Label}}} = field as FormEntityField<T>;
        return (
            <div className={`${theme!.field} ${isEdit ? theme!.edit : ""} ${isEdit && error && this.showError ? theme!.invalid : ""} ${isRequired ? theme!.required : ""} ${className}`}>
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
