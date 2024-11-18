import classNames from "classnames";
import i18next from "i18next";
import {useObserver} from "mobx-react";
import {Ref, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState} from "react";

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
    onChange?: (value: FieldEntryType<F> | undefined) => void;
    /** CSS. */
    theme?: CSSProp<FieldCss>;
    /** Surcharge la valeur de la variable CSS `--field-value-width` pour ce champ. */
    valueWidth?: string;
}

/* Garde en mémoire tous les champs affichés avec le nom du field associé. */
let nameMap: [string, string][] = [];

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
export function Field<F extends FieldEntry>(
    props: FieldOptions<F> & Omit<FieldComponents<F["domain"]["type"]>, "fieldProps"> & {field: EntityField<F>}
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
                isRequired,
                domain: {
                    AutocompleteComponent,
                    autocompleteProps: domainACP = {},
                    className = "",
                    DisplayComponent,
                    displayFormatter = defaultFormatter,
                    displayProps: domainDCP = {},
                    LabelComponent,
                    labelProps: domainLCP = {},
                    InputComponent,
                    inputProps: domainICP = {},
                    SelectComponent,
                    selectProps: domainSCP = {},
                    type
                }
            }
        } = field as FormEntityField<F>;

        useEffect(() => {
            setHasHadFocus(false);
        }, [isEdit]);

        const iProps: BaseInputProps<F["domain"]["type"]> & {ref?: Ref<any>} = {
            value,
            error: showError ? error : undefined,
            name,
            id,
            type,
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

        return (
            <div
                className={classNames(
                    theme.field({
                        edit: isEdit,
                        error: !!(isEdit && error && showError),
                        required: isRequired
                    }),
                    className
                )}
                style={style}
            >
                {hasLabel ? (
                    <LabelComponent
                        {...domainLCP}
                        {...labelProps}
                        comment={comment}
                        id={id}
                        label={label}
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
                            formatter={displayFormatter}
                            keyResolver={autocompleteProps.keyResolver}
                            name={name}
                            theme={themeable(domainDCP.theme ?? {}, displayProps.theme ?? {})}
                            type={type}
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
