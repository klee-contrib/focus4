import i18next from "i18next";
import {action} from "mobx";
import * as React from "react";

import {LabelProps} from "@focus4/forms";
import {EntityField, FieldEntry, FieldEntryType, ReferenceList} from "@focus4/stores";

import {DisplayProps, InputProps, Select, SelectProps} from "../components";

import {Domain} from "./domain";
import {Field, FieldProps} from "./field";

/** $field par défaut dans le cas où on n'a pas de métadonnées particulière pour afficher un champ. */
export const $field: FieldEntry = {
    domain: {},
    type: "field" as "field",
    isRequired: false,
    name: "",
    label: "",
    fieldType: {}
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
export function displayFor<
    T,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, any, any, any, DCDomainProps, LCDomainProps>>,
    options?: Partial<FieldProps<T, any, DCProps, LCProps>>
): JSX.Element;
export function displayFor<
    T,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, any, any, any, DCDomainProps, LCDomainProps>> | T,
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
export function fieldFor<
    T extends string | number | boolean,
    ICProps = InputProps,
    DCProps = DisplayProps,
    LCProps = LabelProps
>(field: T, options?: Partial<FieldProps<T, ICProps, DCProps, LCProps>>): JSX.Element;
export function fieldFor<
    T,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, ICDomainProps, any, any, DCDomainProps, LCDomainProps>>,
    options?: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
): JSX.Element;
export function fieldFor<
    T,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, ICDomainProps, any, any, DCDomainProps, LCDomainProps>> | T,
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps>> = {}
) {
    let trueField: EntityField<FieldEntry<T, FieldEntryType<T>, ICDomainProps, any, any, DCDomainProps, LCDomainProps>>;
    if (isField(field)) {
        trueField = field;
        // On renseigne `onChange` si on est dans un field avec le comportement attendu la plupart du temps.
        options.onChange = options.onChange || action((value: T) => (field.value = value as any));
    } else {
        trueField = {$field, value: field as any};
    }

    // Si on ne pose pas de ref, on considère qu'on n'a pas de formulaire et donc qu'on attend un comportement par défaut un peu différent.
    if (!options.ref) {
        if (options.isEdit === undefined) {
            options.isEdit = true;
        }
        if (options.forceErrorDisplay === undefined) {
            options.forceErrorDisplay = true;
        }
    }

    const props = buildFieldProps<T, ICDomainProps, DCDomainProps, LCDomainProps, ICProps, DCProps, LCProps>(
        trueField,
        options
    );
    return <Field {...props} />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<
    T,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = Partial<SelectProps>,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps,
    R = any,
    ValueKey extends string = "code",
    LabelKey extends string = "label"
>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, any, any, any, DCDomainProps, LCDomainProps>>,
    values: R[],
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>> = {}
) {
    options.InputComponent = (options.InputComponent as any) || Select;

    // On s'assure que la liste de référence passée au composant ne soit pas observable.
    options.values = values.slice();

    // On récupère les infos de la ReferenceList si jamais on en a passé une et qu'on a rien surchargé.
    if (!options.labelKey) {
        options.labelKey = (values as ReferenceList).$labelKey;
    }
    if (!options.valueKey) {
        options.valueKey = (values as ReferenceList).$valueKey;
    }

    return fieldFor(field, options);
}

/**
 * Construit les props à passer au composant Field.
 *
 * Les props seront récupérées depuis, dans l'ordre, (1) le domaine, (2) l'entité, et (3) les options.
 * @param field La définition du champ.
 * @param options Les options du champ.
 */
export function buildFieldProps<
    T,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, ICDomainProps, any, any, DCDomainProps, LCDomainProps>>,
    options: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
) {
    const {
        value,
        $field: {domain = {}, label, isRequired, name, comment}
    } = field;
    const {hasLabel = true, ref, inputProps = {}, displayProps = {}, labelProps = {}, ...otherOptions} = options;
    const {
        inputProps: inputPropsD = {},
        displayProps: displayPropsD = {},
        labelProps: labelPropsD = {},
        displayFormatter = (t: string) => i18next.t(t),
        inputFormatter = (x: any) => x,
        unformatter = (x: any) => x,
        ...otherDomain
    } = domain as Domain<T, ICProps, DCProps, LCProps>;

    return {
        ...otherDomain,
        displayFormatter,
        inputFormatter,
        hasLabel,
        ref,
        isRequired,
        label,
        name,
        comment,
        value,
        unformatter,
        inputProps: {...(inputPropsD as {}), ...(inputProps as {})},
        displayProps: {...(displayPropsD as {}), ...(displayProps as {})},
        labelProps: {...(labelPropsD as {}), ...(labelPropsD as {})},
        ...otherOptions
    } as FieldProps<T, ICProps, DCProps, LCProps>;
}

/**
 * Vérifie que l'entrée est un champ.
 * @param field Le champ ou la valeur.
 */
export function isField<T, IC, DC, LC>(
    field: EntityField<FieldEntry<T, FieldEntryType<T>, IC, any, any, DC, LC>> | T
): field is EntityField<FieldEntry<T, FieldEntryType<T>, IC, any, any, DC, LC>> {
    return !!(field && (field as EntityField<FieldEntry<T>>).$field);
}
