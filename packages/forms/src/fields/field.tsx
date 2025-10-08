import classNames from "classnames";
import {useObserver} from "mobx-react";
import {Ref, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";

import {
    BaseInputProps,
    EntityField,
    FieldComponents,
    FieldEntry,
    FormEntityField,
    UndefinedComponent
} from "@focus4/stores";
import {CSSProp, themeable, useTheme} from "@focus4/styling";

import {FormContext} from "./form";

import fieldCss, {FieldCss} from "./__style__/field.css";

export {fieldCss};
export type {FieldCss};

/** Options pour un champ défini à partir de `fieldFor` et consorts. */
export interface FieldOptions<F extends FieldEntry> {
    /**
     * Contrôle l'affichage de l'erreur dans le champ :
     *
     * - `"never"` : L'erreur n'est jamais affichée.
     * - `"after-focus"` : L'erreur est affichée après avoir focus le champ au moins une fois.
     * - `"always"` : L'erreur est toujours affichée.
     *
     * Dans tous les cas, l'erreur n'est pas affichée si le champ à le focus.
     *
     * @default "after-focus"
     */
    errorDisplay?: "after-focus" | "always" | "never";
    /** Affiche le label. */
    hasLabel?: boolean;
    /** Ref à poser sur le component de saisie (Autocomplete, Input, Select). */
    inputRef?: Ref<any>;
    /** @internal */
    /** L'input à utiliser. */
    inputType?: "autocomplete" | "input" | "select";
    /** Surcharge la valeur de la variable CSS `--field-label-width` pour ce champ. */
    labelWidth?: string;
    /** Handler de modification de la valeur. */
    onChange?: (value: F["fieldType"]) => void;
    /** CSS. */
    theme?: CSSProp<FieldCss>;
    /** Surcharge la valeur de la variable CSS `--field-value-width` pour ce champ. */
    valueWidth?: string;
}

/* Garde en mémoire tous les champs affichés avec le nom du field associé. */
let nameMap: [string, string][] = [];

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
export function Field<F extends FieldEntry>(
    props: FieldOptions<F> & Omit<FieldComponents<F["domain"]["schema"]>, "fieldProps"> & {field: EntityField<F>}
) {
    return useObserver(() => {
        const fieldProps = props.field.$field.domain.fieldProps as FieldOptions<F> | undefined;
        const context = useContext(FormContext);
        const theme = useTheme("field", fieldCss, fieldProps?.theme, props.theme);

        const {
            autocompleteProps = {},
            displayProps = {},
            errorDisplay = fieldProps?.errorDisplay ?? context.errorDisplay ?? "after-focus",
            field,
            inputRef,
            hasLabel = fieldProps?.hasLabel ?? !!field.$field.label,
            labelProps = {},
            labelWidth = fieldProps?.labelWidth,
            inputProps = {},
            inputType = "input",
            onChange,
            selectProps = {},
            valueWidth = fieldProps?.valueWidth
        } = props;

        const {t} = useTranslation();

        /** Formatter par défaut en consulation. */
        const defaultFormatter = useCallback(
            function defaultFormatter(input: any) {
                if (typeof input === "string") {
                    return t(input);
                } else {
                    return input;
                }
            },
            [t]
        );

        const fieldId = useId();

        /**
         * Au premier rendu, on détermine l'id que l'on va mettre sur le label et l'input.
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

        // Détermine si le champ a (eu) le focus ou non.
        const valueRef = useRef<HTMLDivElement>(null);
        const [hasFocus, setHasFocus] = useState(false);
        const [hasHadFocus, setHasHadFocus] = useState(false);
        useEffect(() => setHasHadFocus(false), [errorDisplay]);
        useLayoutEffect(() => {
            function focusin() {
                setHasFocus(true);
                setHasHadFocus(true);
            }

            function focusout() {
                setHasFocus(false);
            }

            valueRef.current?.addEventListener("focusin", focusin);
            valueRef.current?.addEventListener("focusout", focusout);
            return () => {
                valueRef.current?.removeEventListener("focusin", focusin);
                valueRef.current?.removeEventListener("focusout", focusout);
            };
        }, []);

        // Détermine si on affiche l'erreur du champ ou non.
        const showError = useMemo(
            () =>
                !hasFocus &&
                errorDisplay !== "never" &&
                (errorDisplay === "always" || (errorDisplay === "after-focus" && hasHadFocus)),
            [errorDisplay, hasFocus, hasHadFocus]
        );

        const {
            error,
            isEdit,
            value,
            $field: {
                comment,
                label,
                name,
                isRequired: required,
                domain: {
                    AutocompleteComponent = UndefinedComponent,
                    autocompleteProps: domainACP = {},
                    className = "",
                    DisplayComponent = UndefinedComponent,
                    displayFormatter = defaultFormatter,
                    displayProps: domainDCP = {},
                    LabelComponent = UndefinedComponent,
                    labelProps: domainLCP = {},
                    InputComponent = UndefinedComponent,
                    inputProps: domainICP = {},
                    SelectComponent = UndefinedComponent,
                    selectProps: domainSCP = {},
                    schema
                }
            }
        } = field as FormEntityField<F>;

        useEffect(() => {
            setHasHadFocus(false);
        }, [isEdit]);

        const baseProps = {
            comment,
            error: showError ? error : undefined,
            label,
            name,
            id,
            required
        };

        const iProps: BaseInputProps<F["domain"]["schema"]> & {ref?: Ref<any>} = {
            ...baseProps,
            schema,
            value,
            onChange:
                onChange ??
                (() => {
                    /** */
                }),
            ref: inputRef
        };

        const style: Record<string, string> = {};
        if (labelWidth) {
            style["--field-label-width"] = labelWidth;
        }
        if (valueWidth) {
            style["--field-value-width"] = valueWidth;
        }

        useEffect(() => {
            if (hasLabel && LabelComponent === UndefinedComponent) {
                console.warn(`Le champ '${name}' essaie d'afficher un 'LabelComponent' qui n'a pas été défini.`);
            }
        }, [hasLabel, LabelComponent, name]);

        useEffect(() => {
            if (isEdit && inputType === "select" && SelectComponent === UndefinedComponent) {
                console.warn(`Le champ '${name}' essaie d'afficher un 'SelectComponent' qui n'a pas été défini.`);
            }
        }, [inputType, isEdit, SelectComponent, name]);

        useEffect(() => {
            if (isEdit && inputType === "input" && InputComponent === UndefinedComponent) {
                console.warn(`Le champ '${name}' essaie d'afficher un 'InputComponent' qui n'a pas été défini.`);
            }
        }, [inputType, isEdit, InputComponent, name]);

        useEffect(() => {
            if (isEdit && inputType === "autocomplete" && AutocompleteComponent === UndefinedComponent) {
                console.warn(`Le champ '${name}' essaie d'afficher un 'AutocompleteComponent' qui n'a pas été défini.`);
            }
        }, [inputType, isEdit, AutocompleteComponent, name]);

        useEffect(() => {
            if (!isEdit && DisplayComponent === UndefinedComponent) {
                console.warn(`Le champ '${name}' essaie d'afficher un 'DisplayComponent' qui n'a pas été défini.`);
            }
        }, [isEdit, DisplayComponent, name]);

        return (
            <div className={classNames(theme.field(), className)} style={style}>
                {hasLabel ? (
                    <LabelComponent
                        {...domainLCP}
                        {...labelProps}
                        {...baseProps}
                        edit={isEdit}
                        theme={themeable({label: theme.label()}, domainLCP.theme ?? {}, labelProps.theme ?? {})}
                    />
                ) : null}
                <div ref={valueRef} className={classNames(theme.value(), className)}>
                    {isEdit ? (
                        inputType === "select" ? (
                            <SelectComponent
                                {...domainSCP}
                                {...selectProps}
                                {...iProps}
                                theme={themeable(domainSCP.theme ?? {}, selectProps.theme ?? {})}
                            />
                        ) : inputType === "autocomplete" ? (
                            <AutocompleteComponent
                                {...domainACP}
                                {...autocompleteProps}
                                {...iProps}
                                theme={themeable(domainACP.theme ?? {}, autocompleteProps.theme ?? {})}
                            />
                        ) : (
                            <InputComponent
                                {...domainICP}
                                {...inputProps}
                                {...iProps}
                                theme={themeable(domainICP.theme ?? {}, inputProps.theme ?? {})}
                            />
                        )
                    ) : (
                        <DisplayComponent
                            {...domainDCP}
                            {...displayProps}
                            {...baseProps}
                            formatter={displayFormatter}
                            keyResolver={autocompleteProps.keyResolver}
                            schema={schema}
                            theme={themeable(domainDCP.theme ?? {}, displayProps.theme ?? {})}
                            value={value}
                            values={selectProps.values}
                        />
                    )}
                </div>
            </div>
        );
    });
}
