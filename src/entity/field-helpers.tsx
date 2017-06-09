import {find, result} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {DisplayTextProps} from "focus-components/input-display/text";
import {InputTextProps} from "focus-components/input-text";
import {LabelProps} from "focus-components/label";

import {Select, SelectProps} from "../components";
import {EntityField} from "../entity";

import Field, {FieldProps, RefValues} from "./field";
import {BaseDisplayProps, BaseInputProps, Domain} from "./types";

/** $entity par défaut dans le cas où on n'a pas de métadonnées particulière pour afficher un champ. */
export const $entity = {
    domain: {},
    type: "field" as "field",
    isRequired: false,
    name: "",
    translationKey: ""
};

/**
 * Crée un champ standard en lecture seule.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function displayFor<DCProps extends BaseDisplayProps = DisplayTextProps, LCProps = Partial<LabelProps>>(
    field: string | number,
    options?: Partial<FieldProps<string | number, {}, DCProps, LCProps, {}, string, string>>
): JSX.Element;
export function displayFor<T, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>>,
    options?: Partial<FieldProps<T, {}, DCProps, LCProps, {}, string, string>>
): JSX.Element;
export function displayFor<T, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>> | T,
    options: Partial<FieldProps<T, {}, DCProps, LCProps, {}, string, string>> = {}
) {
    options.isEdit = false;
    return fieldFor(field as any, options);
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<ICProps extends BaseInputProps = InputTextProps, DCProps extends BaseDisplayProps = DisplayTextProps, LCProps = Partial<LabelProps>>(
    field: string | number,
    options?: Partial<FieldProps<string | number, ICProps, DCProps, LCProps, {}, string, string>>
): JSX.Element;
export function fieldFor<T, ICDomainProps extends BaseInputProps = InputTextProps, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    options?: Partial<FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>>
): JSX.Element;
export function fieldFor<T, ICDomainProps extends BaseInputProps = InputTextProps, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>> | T,
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>> = {}
) {
    let trueField;
    if (isField(field)) {
        trueField = field;
        // On renseigne `onChange` si on est dans un field avec le comportement attendu la plupart du temps.
        options.onChange = options.onChange || action(((value: T) => field.value = value)) as any;
    } else {
        trueField = {$entity, value: field};
    }

    // Si on ne pose pas de ref, on considère qu'on n'a pas de formulaire et donc qu'on attend un comportement par défaut un peu différent.
    if (!options.innerRef) {
        if (options.isEdit === undefined) {
            options.isEdit = true;
        }
        if (options.forceErrorDisplay === undefined) {
            options.forceErrorDisplay = true;
        }
    }

    const props = buildFieldProps(trueField, options);
    return <Field {...props} />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps extends BaseInputProps = Partial<SelectProps>, DCProps = DCDomainProps, LCProps = LCDomainProps, R extends RefValues<T, ValueKey, LabelKey> = any, ValueKey extends string = "code", LabelKey extends string = "label">(
    field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>>,
    values: R[],
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>> = {}
) {
    options.InputComponent = options.InputComponent as any || Select;
    options.values = values.slice(); // On s'assure que la liste de référence passée au composant ne soit pas observable.
    return fieldFor(field, options);
}

/**
 * Récupère le texte correspondant à un champ.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function stringFor<T, R extends RefValues<T, ValueKey, LabelKey>, ValueKey extends string = "code", LabelKey extends string = "label">(
    field: EntityField<T>,
    options: Partial<FieldProps<T, {}, {}, {}, R, ValueKey, LabelKey>> = {}
) {
    const {formatter, valueKey = "code", labelKey = "label", values, value} = buildFieldProps(field, options);
    const processedValue = values ? result(find(values, {[valueKey]: value}), labelKey) : value;
    return formatter!(processedValue);
}

/**
 * Construit les props à passer au composant Field.
 *
 * Les props seront récupérées depuis, dans l'ordre, (1) le domaine, (2) l'entité, et (3) les options.
 * @param field La définition du champ.
 * @param options Les options du champ.
 */
export function buildFieldProps<T, ICDomainProps extends BaseInputProps = InputTextProps, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>>
) {
    const {value, $entity: {domain = {}, translationKey, isRequired}} = field;
    const {hasLabel = true, innerRef, inputProps = {}, displayProps = {}, labelProps = {},  ...otherOptions} = options;
    const {inputProps: inputPropsD = {}, displayProps: displayPropsD = {}, labelProps: labelPropsD = {}, formatter = ((x: any) => x), unformatter = ((x: any) => x), ...otherDomain} = domain;

    return {
        ...otherDomain,
        formatter,
        hasLabel,
        innerRef,
        isRequired,
        label: translationKey,
        name,
        value,
        unformatter,
        inputProps: {...inputPropsD as {}, ...inputProps as {}},
        displayProps: {...displayPropsD as {}, ...displayProps as {}},
        labelProps: {...labelPropsD as {}, ...labelPropsD as {}},
        ...otherOptions
    } as FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>;
}

/**
 * Vérifie que l'entrée est un champ.
 * @param field Le champ ou la valeur.
 */
export function isField<T>(field: EntityField<T> | T): field is EntityField<T> {
    return !!(field && (field as EntityField<T>).$entity);
}
