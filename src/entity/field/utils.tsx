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
    InputComponents,
    SelectComponents
} from "../types";
import {Field, FieldOptions} from "./field";

function getOnChange<T extends FieldEntry>(field: EntityField<T>) {
    return action(`on${upperFirst(field.$field.name)}Change`, value => (field.value = value));
}

/**
 * Crée un champ avec saisie en autocomplete
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function autocompleteFor<T extends FieldEntry>(
    field: EntityField<T>,
    options: Partial<FieldOptions<T>> &
        AutocompleteComponents<
            NonNullable<T["domain"]["autocompleteProps"]>,
            NonNullable<T["domain"]["displayProps"]>,
            NonNullable<T["domain"]["labelProps"]>
        > & {
            /** Service de résolution de code. */
            keyResolver?: (key: number | string) => Promise<string | undefined>;
            /** Service de recherche. */
            querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
        }
) {
    const {keyResolver, querySearcher, ...otherOptions} = options;
    otherOptions.autocompleteProps = {...((options.autocompleteProps as {}) || {}), keyResolver, querySearcher} as {};
    return <Field field={field} onChange={getOnChange(field)} {...otherOptions} inputType="autocomplete" />;
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T extends FieldEntry>(
    field: EntityField<T>,
    options: Partial<FieldOptions<T>> &
        InputComponents<
            NonNullable<T["domain"]["inputProps"]>,
            NonNullable<T["domain"]["displayProps"]>,
            NonNullable<T["domain"]["labelProps"]>
        > = {}
) {
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
    options: Partial<FieldOptions<T>> &
        SelectComponents<
            NonNullable<T["domain"]["selectProps"]> & BaseSelectProps,
            NonNullable<T["domain"]["displayProps"]>,
            NonNullable<T["domain"]["labelProps"]>
        > = {}
) {
    options.selectProps = {
        ...((options.selectProps as {}) || {}),
        values: values.slice(),
        labelKey: (values && values.$labelKey) || "code",
        valueKey: (values && values.$valueKey) || "label"
    } as {};
    return <Field field={field} onChange={getOnChange(field)} {...options} inputType="select" />;
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
    const {$valueKey = "code", $labelKey = "label"} = values;
    const found = values.find(val => (val as any)[$valueKey] === value);
    const processedValue = (found && (found as any)[$labelKey]) || value;
    return displayFormatter(processedValue);
}
