import i18next from "i18next";
import {action, computed, observable} from "mobx";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {themeable} from "@focus4/core";
import {BaseInputProps, EntityField, FieldComponents, FieldEntry, FieldType, FormEntityField} from "@focus4/stores";
import {themr} from "@focus4/styling";

import {Autocomplete, Display, Input, Label, Select} from "../components";
import {documentHelper} from "./document-helper";
import {FormContext} from "./form";

import fieldStyles from "./__style__/field.css";
export {fieldStyles};
export type FieldStyle = Partial<typeof fieldStyles>;
const Theme = themr("field", fieldStyles);

/** Options pour un champ défini à partir de `fieldFor` et consorts. */
export interface FieldOptions<F extends FieldEntry> {
    /** Désactive le style inline qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
    /** Affiche le label. */
    hasLabel?: boolean;
    /** Pour l'icône de la Tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** @internal */
    /** L'input à utiliser. */
    inputType?: "input" | "select" | "autocomplete";
    /** Par défaut : "top". */
    labelCellPosition?: string;
    /** Largeur en % du label. Par défaut : 33. */
    labelRatio?: number;
    /** N'affiche jamais le champ en erreur. */
    noError?: boolean;
    /** Handler de modification de la valeur. */
    onChange?: (value: FieldType<F["fieldType"]> | undefined) => void;
    /** CSS. */
    theme?: FieldStyle;
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
export class Field<F extends FieldEntry> extends React.Component<
    {field: EntityField<F>} & FieldOptions<F> & FieldComponents
> {
    // On récupère le forceErrorDisplay du form depuis le contexte.
    static contextType = FormContext;
    context!: React.ContextType<typeof FormContext>;

    /** <div /> contenant le composant de valeur (input ou display). */
    @observable private valueElement?: Element | null;
    /** Masque l'erreur à l'initilisation du Field si on est en mode edit et que le valeur est vide (= cas standard de création). */
    @observable private hideErrorOnInit = (this.props.field as FormEntityField<F>).isEdit && !this.props.field.value;

    /** Détermine si on affiche l'erreur ou pas. En plus des surcharges du form et du field lui-même, l'erreur est masquée si le champ est en cours de saisie. */
    @computed
    get showError() {
        return (
            !this.props.noError &&
            !documentHelper.isElementActive(this.valueElement) &&
            (!this.hideErrorOnInit || this.context.forceErrorDisplay)
        );
    }

    // On enregistre le <div> de la valeur et on enregistre un eventListener désactiver le `hideErrorOnInit` au premier clic sur
    componentDidMount() {
        // Poser une ref pose des problèmes de stack overflow (pas vraiment clair pourquoi), donc on fait un truc moisi pour récupérer le noeud qu'on veut.
        const children = (findDOMNode(this) as Element).children;
        this.valueElement = children.item(children.length - 1);
        if (this.hideErrorOnInit) {
            this.valueElement!.addEventListener("mousedown", this.disableHideError);
        }
    }

    /** Désactive le masquage de l'erreur si le champ était en création avant le premier clic. */
    @action.bound
    private disableHideError() {
        this.hideErrorOnInit = false;
        this.valueElement!.removeEventListener("mousedown", this.disableHideError);
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {field, autocompleteProps = {}, displayProps = {}, selectProps = {}} = this.props;
        const {
            value,
            $field: {
                domain: {displayFormatter = defaultFormatter, DisplayComponent = Display, displayProps: domainDCP = {}}
            }
        } = field;
        return (
            <DisplayComponent
                {...domainDCP}
                {...displayProps}
                formatter={displayFormatter}
                keyResolver={autocompleteProps.keyResolver}
                labelKey={selectProps.labelKey}
                value={value}
                valueKey={selectProps.valueKey}
                values={selectProps.values}
                theme={themeable(domainDCP.theme || {}, displayProps.theme || {})}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input(theme: FieldStyle) {
        const {
            field,
            inputType = "input",
            onChange,
            autocompleteProps = {},
            inputProps = {},
            selectProps = {}
        } = this.props;
        const {
            value,
            error,
            $field: {
                fieldType,
                name,
                domain: {
                    autocompleteProps: domainACP = {},
                    AutocompleteComponent = Autocomplete,
                    inputProps: domainICP = {},
                    InputComponent = Input,
                    selectProps: domainSCP = {},
                    SelectComponent = Select
                }
            }
        } = field as FormEntityField<F>;
        const props: BaseInputProps = {
            value,
            error: (this.showError && error) || undefined,
            name,
            id: name,
            type: fieldType === "number" ? "number" : "string",
            onChange
        };

        if (inputType === "select") {
            return (
                <SelectComponent
                    {...domainSCP}
                    {...selectProps}
                    {...props}
                    theme={themeable({error: theme.error!}, domainSCP.theme || {}, selectProps.theme || {})}
                />
            );
        } else if (inputType === "autocomplete") {
            return (
                <AutocompleteComponent
                    {...domainACP}
                    {...autocompleteProps}
                    {...props}
                    theme={themeable({error: theme.error!}, domainACP.theme || {}, autocompleteProps.theme || {})}
                />
            );
        } else {
            return (
                <InputComponent
                    {...domainICP}
                    {...inputProps}
                    {...props}
                    theme={themeable({error: theme.error!}, domainICP.theme || {}, inputProps.theme || {})}
                />
            );
        }
    }

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme => {
                    const {
                        disableInlineSizing,
                        hasLabel = true,
                        labelRatio = 33,
                        labelProps = {},
                        field,
                        i18nPrefix = "focus"
                    } = this.props;
                    const {valueRatio = 100 - (hasLabel ? labelRatio : 0)} = this.props;
                    const {
                        error,
                        isEdit,
                        $field: {
                            comment,
                            label,
                            name,
                            isRequired,
                            domain: {className = "", LabelComponent = Label, labelProps: domainLCP = {}}
                        }
                    } = field as FormEntityField<F>;

                    return (
                        <div
                            className={`${theme.field} ${isEdit ? theme.edit : ""} ${
                                isEdit && error && this.showError ? theme.invalid : ""
                            } ${isRequired ? theme.required : ""} ${className}`}
                        >
                            {hasLabel ? (
                                <LabelComponent
                                    {...domainLCP}
                                    {...labelProps}
                                    comment={comment}
                                    i18nPrefix={i18nPrefix}
                                    label={label}
                                    name={name}
                                    style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}}
                                    theme={themeable(
                                        {label: theme.label},
                                        domainLCP.theme || {},
                                        labelProps.theme || {}
                                    )}
                                />
                            ) : null}
                            <div
                                style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}}
                                className={`${theme.value} ${className}`}
                            >
                                {isEdit ? this.input(theme) : this.display()}
                            </div>
                        </div>
                    );
                }}
            </Theme>
        );
    }
}

/** Formatter par défaut en consulation. */
function defaultFormatter(input: any) {
    if (typeof input === "string") {
        return i18next.t(input);
    } else {
        return input;
    }
}
