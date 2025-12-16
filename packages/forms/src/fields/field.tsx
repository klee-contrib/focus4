import {upperFirst} from "es-toolkit";
import {action} from "mobx";
import {Ref, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";

import {FieldEntry} from "@focus4/entities";
import {
    BaseInputProps,
    EntityField,
    FieldComponents,
    FormEntityField,
    themeable,
    UndefinedComponent
} from "@focus4/stores";

import {FormContext} from "./form";

declare global {
    /** Options pour un champ défini à partir de `fieldFor` et consorts. */
    interface FieldOptions<F extends FieldEntry> {
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
        /** Handler de modification de la valeur. */
        onChange?: (value: F["fieldType"]) => void;
        /** Ne masque pas l'erreur du champ quand il a le focus. */
        showErrorWhenFocused?: boolean;
    }
}

/** Options pour `useField`. */
export interface UseFieldProps<F extends FieldEntry>
    extends FieldOptions<F>, Omit<FieldComponents<F["domain"]["schema"]>, "fieldProps"> {
    /** Le champ. */
    field: EntityField<F>;
    /** L'input à utiliser. */
    inputType?: "autocomplete" | "input" | "select";
    /** Classe CSS à ajouter au label. */
    labelClassName?: string;
}

/* Garde en mémoire tous les champs affichés avec le nom du field associé. */
let nameMap: [string, string][] = [];

/** Initialise les composants de libellé et d'affichage/saisie pour un champ. */
export function useField<F extends FieldEntry>(props: UseFieldProps<F>) {
    const fieldProps = props.field.$field.domain.fieldProps as FieldOptions<F> | undefined;
    const context = useContext(FormContext);

    const {
        autocompleteProps = {},
        displayProps = {},
        errorDisplay = fieldProps?.errorDisplay ?? context.errorDisplay ?? "after-focus",
        field,
        inputRef,
        hasLabel = fieldProps?.hasLabel ?? !!field.$field.label,
        labelProps = {},
        labelClassName,
        inputProps = {},
        inputType = "input",
        selectProps = {},
        showErrorWhenFocused = false
    } = props;

    const onChange = useCallback(
        props.onChange ??
            action(`on${upperFirst(field.$field.name)}Change`, (value: F["fieldType"]) => (field.value = value)),
        [field, props.onChange]
    );

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
            (!hasFocus || showErrorWhenFocused) &&
            errorDisplay !== "never" &&
            (errorDisplay === "always" || (errorDisplay === "after-focus" && hasHadFocus)),
        [errorDisplay, hasFocus, hasHadFocus, showErrorWhenFocused]
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

    return {
        className,
        label: hasLabel ? (
            <LabelComponent
                {...domainLCP}
                {...labelProps}
                {...baseProps}
                edit={isEdit}
                theme={themeable({label: labelClassName}, domainLCP.theme ?? {}, labelProps.theme ?? {})}
            />
        ) : null,
        value: isEdit ? (
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
        ),
        valueRef
    };
}
