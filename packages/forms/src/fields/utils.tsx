import {upperFirst} from "es-toolkit";
import {action} from "mobx";
import {output} from "zod";

import {
    AutocompleteComponents,
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseSelectProps,
    EntityField,
    FieldEntry,
    FieldEntryType,
    InputComponents,
    ReferenceList,
    SelectComponents,
    SingleZodType
} from "@focus4/stores";

import {Field, FieldOptions} from "./field";

function getOnChange<F extends FieldEntry>(field: EntityField<F>) {
    return action(
        `on${upperFirst(field.$field.name)}Change`,
        (value: FieldEntryType<F> | undefined) => (field.value = value)
    );
}

/** Options pour `autocompleteFor` */
export type AutocompleteForOptions<F extends FieldEntry> = AutocompleteComponents<
    F["domain"]["schema"],
    BaseAutocompleteProps<F["domain"]["schema"]> & NonNullable<F["domain"]["autocompleteProps"]>,
    BaseDisplayProps<F["domain"]["schema"]> & NonNullable<F["domain"]["displayProps"]>,
    NonNullable<F["domain"]["labelProps"]>
> &
    Partial<FieldOptions<F>> & {
        /** Service de résolution de code. */
        keyResolver?: (key: output<SingleZodType<F["domain"]["schema"]>>) => Promise<string | undefined>;
        /** Service de recherche. */
        querySearcher?: (text: string, options?: RequestInit) => Promise<{key: string; label: string}[]>;
    };

/** Options pour `fieldFor` */
export type FieldForOptions<F extends FieldEntry> = InputComponents<
    F["domain"]["schema"],
    BaseInputProps<F["domain"]["schema"]> & NonNullable<F["domain"]["inputProps"]>,
    BaseDisplayProps<F["domain"]["schema"]> & NonNullable<F["domain"]["displayProps"]>,
    NonNullable<F["domain"]["labelProps"]>
> &
    Partial<FieldOptions<F>>;

/** Options pour `selectFor`. */
export type SelectForOptions<F extends FieldEntry> = Partial<FieldOptions<F>> &
    SelectComponents<
        F["domain"]["schema"],
        BaseSelectProps<F["domain"]["schema"]> & NonNullable<F["domain"]["selectProps"]>,
        BaseDisplayProps<F["domain"]["schema"]> & NonNullable<F["domain"]["displayProps"]>,
        NonNullable<F["domain"]["labelProps"]>
    >;

/**
 * Crée un champ avec résolution de la valeur avec un service d'autocomplétion, en utilisant l'`AutocompleteComponent` du domaine pour la saisie.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function autocompleteFor<F extends FieldEntry>(field: EntityField<F>, options: AutocompleteForOptions<F>) {
    const {keyResolver, querySearcher, ...otherOptions} = options;
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...otherOptions}
            autocompleteProps={{...options.autocompleteProps, keyResolver, querySearcher}}
            inputType="autocomplete"
        />
    );
}

/**
 * Crée un champ de base, en utilisant l'`InputComponent` du domaine pour la saisie.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<F extends FieldEntry>(field: EntityField<F>, options: FieldForOptions<F> = {}) {
    return <Field field={field} onChange={getOnChange(field)} {...options} inputType="input" />;
}

/**
 * Crée un champ avec résolution de la valeur avec une liste de référence, en utilisant le `SelectComponent` du domaine pour la saisie.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<F extends FieldEntry>(
    field: EntityField<F>,
    values: ReferenceList,
    options: SelectForOptions<F> = {}
) {
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...options}
            inputType="select"
            selectProps={{
                ...(options.selectProps as {}),
                values
            }}
        />
    );
}
