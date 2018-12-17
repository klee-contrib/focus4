import i18next from "i18next";
import {action, computed, observable} from "mobx";
import * as React from "react";
import {themeable} from "react-css-themr";
import {findDOMNode} from "react-dom";

import {Autocomplete, Display, Input, Label, Select} from "../../components";
import {themr} from "../../theme";

import {FormContext} from "../form";
import {BaseInputProps, BaseSelectProps, EntityField, FieldComponents, FieldEntry, FormEntityField} from "../types";
import {documentHelper} from "./document-helper";

import * as styles from "./__style__/field.css";
export type FieldStyle = Partial<typeof styles>;
const Theme = themr("field", styles);

/** Options pour un champ défini à partir de `fieldFor` et consorts. */
export interface FieldOptions<T extends FieldEntry> {
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
    onChange?: (value: T["fieldType"]) => void;
    /** CSS. */
    theme?: FieldStyle;
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
export class Field<T extends FieldEntry> extends React.Component<
    {field: EntityField<T>} & FieldOptions<T> & FieldComponents
> {
    // On récupère le forceErrorDisplay du form depuis le contexte.
    static contextType = FormContext;
    context!: React.ContextType<typeof FormContext>;

    /** <div /> contenant le composant de valeur (input ou display). */
    @observable private valueElement?: Element | null;
    /** Masque l'erreur à l'initilisation du Field si on est en mode edit et que le valeur est vide (= cas standard de création). */
    @observable private hideErrorOnInit = (this.props.field as FormEntityField<T>).isEdit && !this.props.field.value;

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

    /** Appelé lors d'un changement sur l'input. */
    @action.bound
    onChange(value: T["fieldType"]) {
        const {
            onChange,
            field: {
                $field: {domain}
            }
        } = this.props;
        if (onChange) {
            if (domain.unformatter) {
                onChange(domain.unformatter(value));
            } else {
                onChange(value);
            }
        }
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
    input() {
        const {field, inputType = "input", autocompleteProps = {}, inputProps = {}, selectProps = {}} = this.props;
        const {
            value,
            error,
            $field: {
                name,
                domain: {
                    autocompleteProps: domainACP = {},
                    AutocompleteComponent = Autocomplete,
                    inputProps: domainICP = {},
                    InputComponent = Input,
                    inputFormatter = (x?: string) => x,
                    selectProps: domainSCP = {},
                    SelectComponent = Select
                }
            }
        } = field as FormEntityField<T>;
        const props: BaseInputProps = {
            value: inputFormatter(value),
            error: (this.showError && error) || undefined,
            name,
            id: name,
            onChange: this.onChange
        };

        if (inputType === "select") {
            return (
                <SelectComponent
                    {...domainSCP}
                    {...selectProps as BaseSelectProps}
                    {...props}
                    theme={themeable(domainSCP.theme || {}, selectProps.theme || {})}
                />
            );
        } else if (inputType === "autocomplete") {
            return (
                <AutocompleteComponent
                    {...domainACP}
                    {...autocompleteProps}
                    {...props}
                    theme={themeable(domainACP.theme || {}, autocompleteProps.theme || {})}
                />
            );
        } else {
            return (
                <InputComponent
                    {...domainICP}
                    {...inputProps}
                    {...props}
                    theme={themeable(domainICP.theme || {}, inputProps.theme || {})}
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
                    } = field as FormEntityField<T>;

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
                                {isEdit ? this.input() : this.display()}
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
