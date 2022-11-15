import classNames from "classnames";
import i18next from "i18next";
import {uniqueId} from "lodash";
import {useLocalObservable, useObserver} from "mobx-react";
import {useContext, useLayoutEffect, useMemo} from "react";

import {themeable} from "@focus4/core";
import {
    BaseInputProps,
    EntityField,
    FieldComponents,
    FieldEntry,
    FieldEntryType,
    FormEntityField
} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {Autocomplete, Display, Input, Label, Select} from "../components";

import {documentHelper} from "./document-helper";
import {FormContext} from "./form";

import fieldCss, {FieldCss} from "./__style__/field.css";
export {fieldCss, FieldCss};

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
    inputType?: "autocomplete" | "input" | "select";
    /** Largeur en % du label. Par défaut : 33. */
    labelRatio?: number;
    /** N'affiche jamais le champ en erreur. */
    noError?: boolean;
    /** Handler de modification de la valeur. */
    onChange?: (value: FieldEntryType<F> | undefined) => void;
    /** CSS. */
    theme?: CSSProp<FieldCss>;
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
}

/* Garde en mémoire tous les champs affichés avec le nom du field associé. */
let nameMap: [string, string][] = [];

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
export function Field<F extends FieldEntry>(props: FieldComponents & FieldOptions<F> & {field: EntityField<F>}) {
    const fieldProps = props.field.$field.domain.fieldProps as FieldOptions<F> | undefined;

    const context = useContext(FormContext);
    const theme = useTheme("field", fieldCss, fieldProps?.theme, props.theme);

    const {
        autocompleteProps = {},
        disableInlineSizing = fieldProps?.disableInlineSizing,
        displayProps = {},
        hasLabel = fieldProps?.hasLabel ?? true,
        field,
        labelRatio = fieldProps?.labelRatio ?? context.labelRatio ?? 33,
        labelProps = {},
        i18nPrefix = fieldProps?.i18nPrefix ?? "focus",
        inputProps = {},
        inputType = "input",
        onChange,
        selectProps = {},
        valueRatio = fieldProps?.valueRatio ?? context.valueRatio ?? 100 - (hasLabel ? labelRatio : 0)
    } = props;

    /** On définit au premier rendu un identifiant unique pour le field. */
    const fieldId = useMemo(() => uniqueId("field_"), []);

    /**
     * Toujours au premier rendu, on détermine l'id que l'on va mettre sur le label et l'input.
     * On se base sur le `name` du champ, et on va regarder si on a pas déjà posé un champ avec le même `name`.
     * Si oui, on suffixera le `name` par un numéro pour garder un id unique.
     */
    const id = useMemo(() => {
        const {name} = field.$field;
        const count = nameMap.filter(([_, n]) => n === name).length;
        nameMap.push([fieldId, name]); // On s'ajoute dans la map ici.
        if (count > 0) {
            return `${name}_${count + 1}`;
        }

        return name;
    }, []);

    /* On enlève le field de la map des fields de la page quand on le démonte. */
    useLayoutEffect(
        () => () => {
            nameMap = nameMap.filter(([fid]) => fieldId !== fid);
        },
        []
    );

    const store = useLocalObservable(() => ({
        /** Masque l'erreur à l'initilisation du Field si on est en mode edit et que le valeur est vide (= cas standard de création). */
        hideErrorOnInit: (props.field as FormEntityField<F>).isEdit && !props.field.value,

        /** On récupère le <div> de valeur pour y mettre un listener pour vérifier si on a le focus dessus ou pas, pour masque le message d'erreur. */
        valueElement: null as HTMLDivElement | null,

        /** Détermine si on affiche l'erreur ou pas. En plus des surcharges du form et du field lui-même, l'erreur est masquée si le champ est en cours de saisie. */
        get showError() {
            const fp = props.field.$field.domain.fieldProps as FieldOptions<F> | undefined;
            return (
                !(props.noError ?? fp?.noError) &&
                !documentHelper.isElementActive(this.valueElement) &&
                (!this.hideErrorOnInit || context.forceErrorDisplay)
            );
        },

        /** Enregistre la ref vers le noeud de la valeur. */
        setValueElement(valueElement: HTMLDivElement | null) {
            if (valueElement) {
                this.valueElement = valueElement;
                if (this.hideErrorOnInit) {
                    valueElement.addEventListener("mousedown", this.disableHideError);
                }
            }
        },

        /** Désactive le masquage de l'erreur si le champ était en création avant le premier clic. */
        disableHideError() {
            this.hideErrorOnInit = false;
            if (this.valueElement) {
                this.valueElement.removeEventListener("mousedown", this.disableHideError);
            }
        }
    }));

    return useObserver(() => {
        const {
            error,
            isEdit,
            value,
            $field: {
                comment,
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
                    selectProps: domainSCP = {},
                    type
                }
            }
        } = field as FormEntityField<F>;

        const iProps: BaseInputProps = {
            value,
            error: (store.showError && error) || undefined,
            name,
            id,
            type: type === "number" ? "number" : "string",
            onChange
        };

        return (
            <div
                className={classNames(
                    theme.field({
                        edit: isEdit,
                        error: !!(isEdit && error && store.showError),
                        required: isRequired
                    }),
                    className
                )}
            >
                {hasLabel ? (
                    <LabelComponent
                        {...domainLCP}
                        {...labelProps}
                        comment={comment}
                        i18nPrefix={i18nPrefix}
                        id={id}
                        label={label}
                        style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}}
                        theme={themeable({label: theme.label()}, domainLCP.theme || {}, labelProps.theme || {})}
                    />
                ) : null}
                <div
                    ref={store.setValueElement}
                    className={classNames(theme.value(), className)}
                    style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}}
                >
                    {isEdit ? (
                        inputType === "select" ? (
                            <SelectComponent
                                {...domainSCP}
                                {...selectProps}
                                {...iProps}
                                theme={themeable(
                                    {error: theme.error()},
                                    domainSCP.theme || {},
                                    selectProps.theme || {}
                                )}
                            />
                        ) : inputType === "autocomplete" ? (
                            <AutocompleteComponent
                                {...domainACP}
                                {...autocompleteProps}
                                {...iProps}
                                theme={themeable(
                                    {error: theme.error()},
                                    domainACP.theme || {},
                                    autocompleteProps.theme || {}
                                )}
                            />
                        ) : (
                            <InputComponent
                                {...domainICP}
                                {...inputProps}
                                {...iProps}
                                theme={themeable({error: theme.error()}, domainICP.theme || {}, inputProps.theme || {})}
                            />
                        )
                    ) : (
                        <DisplayComponent
                            {...domainDCP}
                            {...displayProps}
                            formatter={displayFormatter}
                            keyResolver={autocompleteProps.keyResolver}
                            theme={themeable(domainDCP.theme || {}, displayProps.theme || {})}
                            value={value}
                            values={selectProps.values}
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
