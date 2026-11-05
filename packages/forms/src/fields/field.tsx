import {upperFirst} from "es-toolkit";
import {action} from "mobx";
import {FocusEvent, Ref, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useState} from "react";
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
         * Dans tous les cas, l'erreur n'est pas affichée si le champ a le focus.
         *
         * @default "after-focus"
         */
        errorDisplay?: "after-focus" | "always" | "never";
        /** Affiche le label. */
        hasLabel?: boolean;
        /** Ref à poser sur le component de saisie (Autocomplete, Input, Select). */
        inputRef?: Ref<any>;
        /** Surcharge du libellé du champ (il devrait a priori déjà être défini dans l'entité). */
        label?: string;
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
    /** Classe CSS à ajouter à la valeur. */
    valueClassName?: string;
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
        label = props.field.$field.label,
        hasLabel = fieldProps?.hasLabel ?? !!label,
        labelProps = {},
        labelClassName,
        inputProps = {},
        inputType = "input",
        selectProps = {},
        showErrorWhenFocused = false,
        valueClassName
    } = props;

    const onChange = useCallback(
        props.onChange ??
            action(`on${upperFirst(field.$field.name)}Change`, (value: F["fieldType"]) => (field.value = value)),
        [field, props.onChange]
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

    // Pour gérer le fait que la valeur du champ a (déjà eu) le focus, utilisé pour savoir si on affiche l'erreur ou non.
    const [hasFocus, setHasFocus] = useState(false);
    const [hasHadFocus, setHasHadFocus] = useState(false);
    useEffect(() => setHasHadFocus(false), [errorDisplay]);

    const onFocus = useCallback(() => {
        setHasFocus(true);
        setHasHadFocus(true);
    }, []);

    const onBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
        const nextTarget = event.relatedTarget;
        // On ne dit que la valeur n'a plus le focus que si le blur à est lancé par un élément externe.
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setHasFocus(false);
        }
    }, []);

    /*
      On doit poser un MutationObserver sur la valeur pour détecter aussi une perte de focus si le focus était sur un
      élément contenu dans la valeur qui se fait retirer du DOM (par exemple, un clic sur le calendrier de l'InputDate).
     */
    const valueRef = useCallback((element: HTMLDivElement) => {
        if (!element) {
            return;
        }
        const observer = new MutationObserver(() => {
            if (!element.contains(element.ownerDocument.activeElement)) {
                setHasFocus(false);
            }
        });
        observer.observe(element, {childList: true, subtree: true});
        return () => observer.disconnect();
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
        errors = [],
        isEdit,
        value,
        $field: {
            comment,
            name,
            isRequired: required,
            domain: {
                AutocompleteComponent = UndefinedComponent,
                autocompleteProps: domainACP = {},
                className = "",
                DisplayComponent = UndefinedComponent,
                displayFormatter,
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

    const {t} = useTranslation();

    const baseProps = {
        comment,
        error: showError
            ? errors.map(e => t(e, {comment, label, name, interpolation: {skipOnVariables: false}})).join(", ")
            : undefined,
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
        value: (
            <div ref={valueRef} className={valueClassName} onBlur={onBlur} onFocus={onFocus}>
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
        )
    };
}
