import i18next from "i18next";
import {uniqueId} from "lodash";
import {useLocalStore, useObserver} from "mobx-react-lite";
import * as React from "react";

import {themeable} from "@focus4/core";
import {BaseInputProps, EntityField, FieldComponents, FieldEntry, FieldType, FormEntityField} from "@focus4/stores";
import {CSSToStrings, useTheme} from "@focus4/styling";

import {Autocomplete, Display, Input, Label, Select} from "../components";
import {documentHelper} from "./document-helper";
import {FormContext} from "./form";

import fieldStyles, {FieldCss} from "./__style__/field.css";
export {fieldStyles};
export type FieldStyle = CSSToStrings<FieldCss>;

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

/* Garde en mémoire tous les champs affichés avec le nom du field associé. */
let nameMap: [string, string][] = [];

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
export function Field<F extends FieldEntry>(props: {field: EntityField<F>} & FieldOptions<F> & FieldComponents) {
    const context = React.useContext(FormContext);
    const theme = useTheme("field", fieldStyles, props.theme);

    const {
        autocompleteProps = {},
        disableInlineSizing,
        displayProps = {},
        hasLabel = true,
        field,
        labelRatio = context.labelRatio ?? 33,
        labelProps = {},
        i18nPrefix = "focus",
        inputProps = {},
        inputType = "input",
        onChange,
        selectProps = {},
        valueRatio = context.valueRatio ?? 100 - (hasLabel ? labelRatio : 0)
    } = props;

    /** On récupère le <div> de valeur pour y mettre un listener pour vérifier si on a le focus dessus ou pas, pour masque le message d'erreur. */
    const valueElement = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (store.hideErrorOnInit) {
            valueElement.current!.addEventListener("mousedown", store.disableHideError);
        }
    }, []);

    /** On définit au premier rendu un identifiant unique pour le field. */
    const fieldId = React.useMemo(() => uniqueId("field_"), []);

    /**
     * Toujours au premier rendu, on détermine l'id que l'on va mettre sur le label et l'input.
     * On se base sur le `name` du champ, et on va regarder si on a pas déjà posé un champ avec le même `name`.
     * Si oui, on suffixera le `name` par un numéro pour garder un id unique.
     */
    const id = React.useMemo(() => {
        const {name} = field.$field;
        const count = nameMap.filter(([_, n]) => n === name).length;
        nameMap.push([fieldId, name]); // On s'ajoute dans la map ici.
        if (count > 0) {
            return `${name}_${count + 1}`;
        }

        return name;
    }, []);

    /* On enlève le field de la map des fields de la page quand on le démonte. */
    React.useLayoutEffect(
        () => () => {
            nameMap = nameMap.filter(([fid]) => fieldId !== fid);
        },
        []
    );

    const store = useLocalStore(() => ({
        /** Masque l'erreur à l'initilisation du Field si on est en mode edit et que le valeur est vide (= cas standard de création). */
        hideErrorOnInit: (props.field as FormEntityField<F>).isEdit && !props.field.value,

        /** Détermine si on affiche l'erreur ou pas. En plus des surcharges du form et du field lui-même, l'erreur est masquée si le champ est en cours de saisie. */
        get showError() {
            return (
                !props.noError &&
                !documentHelper.isElementActive(valueElement.current) &&
                (!this.hideErrorOnInit || context.forceErrorDisplay)
            );
        },

        /** Désactive le masquage de l'erreur si le champ était en création avant le premier clic. */
        disableHideError() {
            this.hideErrorOnInit = false;
            valueElement.current!.removeEventListener("mousedown", this.disableHideError);
        }
    }));

    return useObserver(() => {
        const {
            error,
            isEdit,
            value,
            $field: {
                comment,
                fieldType,
                label,
                name,
                isRequired,
                domain: {
                    AutocompleteComponent = Autocomplete,
                    autocompleteProps: domainACP = {},
                    className = "",
                    DisplayComponent = Display,
                    displayFormatter = defaultFormatter,
                    displayProps: domainDCP = {},
                    LabelComponent = Label,
                    labelProps: domainLCP = {},
                    InputComponent = Input,
                    inputProps: domainICP = {},
                    SelectComponent = Select,
                    selectProps: domainSCP = {}
                }
            }
        } = field as FormEntityField<F>;

        const iProps: BaseInputProps = {
            value,
            error: (store.showError && error) || undefined,
            name,
            id,
            type: fieldType === "number" ? "number" : "string",
            onChange
        };

        return (
            <div
                className={`${theme.field} ${isEdit ? theme.edit : ""} ${
                    isEdit && error && store.showError ? theme.invalid : ""
                } ${isRequired ? theme.required : ""} ${className}`}
            >
                {hasLabel ? (
                    <LabelComponent
                        {...domainLCP}
                        {...labelProps}
                        comment={comment}
                        i18nPrefix={i18nPrefix}
                        label={label}
                        id={id}
                        style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}}
                        theme={themeable({label: theme.label}, domainLCP.theme || {}, labelProps.theme || {})}
                    />
                ) : null}
                <div
                    style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}}
                    className={`${theme.value} ${className}`}
                    ref={valueElement}
                >
                    {isEdit ? (
                        inputType === "select" ? (
                            <SelectComponent
                                {...domainSCP}
                                {...selectProps}
                                {...iProps}
                                theme={themeable({error: theme.error}, domainSCP.theme || {}, selectProps.theme || {})}
                            />
                        ) : inputType === "autocomplete" ? (
                            <AutocompleteComponent
                                {...domainACP}
                                {...autocompleteProps}
                                {...iProps}
                                theme={themeable(
                                    {error: theme.error},
                                    domainACP.theme || {},
                                    autocompleteProps.theme || {}
                                )}
                            />
                        ) : (
                            <InputComponent
                                {...domainICP}
                                {...inputProps}
                                {...iProps}
                                theme={themeable({error: theme.error}, domainICP.theme || {}, inputProps.theme || {})}
                            />
                        )
                    ) : (
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
                    )}
                </div>
            </div>
        );
    });
}

/** Formatter par défaut en consulation. */
function defaultFormatter(input: any) {
    if (typeof input === "string") {
        return i18next.t(input);
    } else {
        return input;
    }
}
