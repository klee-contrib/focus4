import i18next from "i18next";
import {find, result} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {DisplayProps, InputProps, LabelProps, Select, SelectProps} from "../components";
import {EntityField} from "../entity";

import Field, {FieldProps} from "./field";
import {Domain} from "./types";

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
export function displayFor<T extends string | number | boolean, DCProps = DisplayProps, LCProps = LabelProps>(
    field: T,
    options?: Partial<FieldProps<T, any, DCProps, LCProps>>
): JSX.Element;
export function displayFor<T, DCDomainProps = DisplayProps, LCDomainProps = LabelProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<any, DCDomainProps, LCDomainProps>>,
    options?: Partial<FieldProps<T, any, DCProps, LCProps>>
): JSX.Element;
export function displayFor<T, DCDomainProps = DisplayProps, LCDomainProps = LabelProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<any, DCDomainProps, LCDomainProps>> | T,
    options: Partial<FieldProps<T, any, DCProps, LCProps>> = {}
) {
    options.isEdit = false;
    return fieldFor(field as any, options);
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T extends string | number | boolean, ICProps = InputProps, DCProps = DisplayProps, LCProps = LabelProps>(
    field: T,
    options?: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
): JSX.Element;
export function fieldFor<T, ICDomainProps = InputProps, DCDomainProps = DisplayProps, LCDomainProps = LabelProps, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    options?: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
): JSX.Element;
export function fieldFor<T, ICDomainProps = InputProps, DCDomainProps = DisplayProps, LCDomainProps = LabelProps, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>> | T,
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps>> = {}
) {
    let trueField: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>;
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

    const props = buildFieldProps<T, ICDomainProps, DCDomainProps, LCDomainProps, ICProps, DCProps, LCProps>(trueField, options);
    return <Field {...props} />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T, DCDomainProps = DisplayProps, LCDomainProps = LabelProps, ICProps = Partial<SelectProps>, DCProps = DCDomainProps, LCProps = LCDomainProps, R = any, ValueKey extends string = "code", LabelKey extends string = "label">(
    field: EntityField<T, Domain<any, DCDomainProps, LCDomainProps>>,
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
export function stringFor<T, R, ValueKey extends string = "code", LabelKey extends string = "label">(
    field: EntityField<T>,
    options: Partial<FieldProps<T, {}, {}, {}, R, ValueKey, LabelKey>> = {}
) {
    const {displayFormatter, valueKey = "code", labelKey = "label", values, value} = buildFieldProps(field, options);
    const processedValue = values ? result(find(values, {[valueKey]: value}), labelKey) : value;
    return displayFormatter!(processedValue);
}

/**
 * Construit les props à passer au composant Field.
 *
 * Les props seront récupérées depuis, dans l'ordre, (1) le domaine, (2) l'entité, et (3) les options.
 * @param field La définition du champ.
 * @param options Les options du champ.
 */
export function buildFieldProps<T, ICDomainProps = InputProps, DCDomainProps = DisplayProps, LCDomainProps = LabelProps, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
) {
    const {value, $entity: {domain = {}, translationKey, isRequired, name, comment}} = field;
    const {hasLabel = true, innerRef, inputProps = {}, displayProps = {}, labelProps = {},  ...otherOptions} = options;
    const {
        inputProps: inputPropsD = {},
        displayProps: displayPropsD = {},
        labelProps: labelPropsD = {},
        displayFormatter = (t: string) => i18next.t(t),
        inputFormatter = ((x: any) => x),
        unformatter = ((x: any) => x),
        ...otherDomain
    } = domain;

    return {
        ...otherDomain,
        displayFormatter,
        inputFormatter,
        hasLabel,
        innerRef,
        isRequired,
        label: translationKey,
        name,
        comment,
        value,
        unformatter,
        inputProps: {...inputPropsD as {}, ...inputProps as {}},
        displayProps: {...displayPropsD as {}, ...displayProps as {}},
        labelProps: {...labelPropsD as {}, ...labelPropsD as {}},
        ...otherOptions
    } as FieldProps<T, ICProps, DCProps, LCProps>;
}

/**
 * Vérifie que l'entrée est un champ.
 * @param field Le champ ou la valeur.
 */
export function isField<T, IC, DC, LC>(field: EntityField<T, Domain<IC, DC, LC>> | T): field is EntityField<T, Domain<IC, DC, LC>> {
    return !!(field && (field as EntityField<T>).$entity);
}
