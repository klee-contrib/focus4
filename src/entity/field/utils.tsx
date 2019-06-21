import i18next from "i18next";
import {upperFirst} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {AutocompleteResult} from "../../components";
import {ReferenceList} from "../../reference";

import {
    AutocompleteComponents,
    BaseSelectProps,
    EntityField,
    FieldEntry,
    FieldEntryType,
    InputComponents,
    SelectComponents
} from "../types";
import {Field, FieldOptions} from "./field";

function getOnChange<F extends FieldEntry>(field: EntityField<F>) {
    return action(
        `on${upperFirst(field.$field.name)}Change`,
        (value: FieldEntryType<F> | undefined) => (field.value = value)
    );
}

/** Options pour `autocompleteFor` */
export type AutocompleteForOptions<T extends FieldEntry> = Partial<FieldOptions<T>> &
    AutocompleteComponents<
        NonNullable<T["domain"]["autocompleteProps"]>,
        NonNullable<T["domain"]["displayProps"]>,
        NonNullable<T["domain"]["labelProps"]>
    > & {
        /** Service de résolution de code. */
        keyResolver?: (key: number | string) => Promise<string | undefined>;
        /** Service de recherche. */
        querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
    };

/** Options pour `fieldFor` */
export type FieldForOptions<T extends FieldEntry> = Partial<FieldOptions<T>> &
    InputComponents<
        NonNullable<T["domain"]["inputProps"]>,
        NonNullable<T["domain"]["displayProps"]>,
        NonNullable<T["domain"]["labelProps"]>
    >;

/** Options pour `selectFor`. */
export type SelectForOptions<T extends FieldEntry> = Partial<FieldOptions<T>> &
    SelectComponents<
        NonNullable<T["domain"]["selectProps"]> & BaseSelectProps,
        NonNullable<T["domain"]["displayProps"]>,
        NonNullable<T["domain"]["labelProps"]>
    >;

/**
 * Crée un champ avec saisie en autocomplete
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function autocompleteFor<T extends FieldEntry>(field: EntityField<T>, options: AutocompleteForOptions<T>) {
    const {keyResolver, querySearcher, ...otherOptions} = options;
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...otherOptions}
            autocompleteProps={{...((options.autocompleteProps as {}) || {}), keyResolver, querySearcher}}
            inputType="autocomplete"
        />
    );
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T extends FieldEntry>(field: EntityField<T>, options: FieldForOptions<T> = {}) {
    return <Field field={field} onChange={getOnChange(field)} {...options} inputType="input" />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T extends FieldEntry>(
    field: EntityField<T>,
    values: ReferenceList,
    options: SelectForOptions<T> = {}
) {
    return (
        <Field
            field={field}
            onChange={getOnChange(field)}
            {...options}
            selectProps={{
                values: values.slice(),
                labelKey: values.$labelKey,
                valueKey: values.$valueKey,
                ...((options.selectProps as {}) || {})
            }}
            inputType="select"
        />
    );
}

/**
 * Récupère le texte correspondant à un champ.
 * @param field La définition de champ.
 * @param values L'éventulle liste de référence associée.
 */
export function stringFor<T extends FieldEntry>(field: EntityField<T>, values: ReferenceList = [] as any) {
    const {
        value,
        $field: {
            domain: {displayFormatter = (t: string) => i18next.t(t)}
        }
    } = field;
    const found = values.find(val => (val as any)[values.$valueKey] === value);
    const processedValue = (found && (found as any)[values.$labelKey]) || value;
    return displayFormatter(processedValue);
}
