import {find, result} from "lodash";
import * as React from "react";

import AutocompleteSelectField, {AutoCompleteResult} from "focus-components/autocomplete-select";
import AutocompleteTextField from "focus-components/autocomplete-text/field";
import Select from "focus-components/select";

import {EntityField} from "../entity";

import {Field, FieldProps} from "./field";

/** Options communes à tous les champs. */
export interface BaseOptions<T> {
    error?: string;
    isEdit?: boolean;
    labelKey?: string;
    name?: string;
    onChange?: (value: T) => void;
    value?: any;
    ref?: (field: Field) => void;
    contentCellPosition?: string;
    contentOffset?: number;
    contentSize?: number;
    forceErrorDisplay?: boolean;
    hasLabel?: boolean;
    isRequired?: boolean;
    label?: string;
    labelCellPosition?: string;
    labelOffset?: number;
    labelSize?: number;
}

/** Options pour `autocompleteSelectFor`. */
export interface AutocompleteSelectOptions extends AutocompleteTextOptions {

    /** Service de résolution d'une clé. Doit renvoyer le libellé. */
    keyResolver: (code: string | number) => Promise<string>;
}

/** Options pour `autocompleteTextFor`. */
export interface AutocompleteTextOptions extends BaseOptions<string> {

    /** Service de recherche textuelle. */
    querySearcher: (text: string) => Promise<AutoCompleteResult>;
}

/** Options pour `fieldForWith` */
export interface FieldOptions<T, DisplayProps, FieldProps, InputProps> extends BaseOptions<T> {
    DisplayComponent?: ReactComponent<DisplayProps>;
    FieldComponent?: ReactComponent<FieldProps>;
    InputComponent?: ReactComponent<InputProps>;
    LabelComponent?: ReactComponent<{domain: string, name: string, text: string}>;
}

/** Options pour `selectFor`. */
export interface SelectOptions<T> extends BaseOptions<T> {
    labelKey?: string;
    valueKey?: string;
    values?: {code?: T, id?: T}[];
}

/** Options pour `stringFor` et `textFor`. */
export interface TextOptions {
    formatter?: (data: any) => string;
    labelKey?: string;
    style?: React.CSSProperties;
    value?: any;
    valueKey?: string;
    values?: {}[];
}

/** $entity par défaut dans le cas où on n'a pas de métadonnées particulière pour afficher un champ. */
export const $entity = {
    domain: {},
    type: "field" as "field",
    isRequired: false,
    name: "",
    translationKey: ""
};

/**
 * Crée un champ de type AutocompleteSelect.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function autocompleteSelectFor<T>(field: EntityField<T>, options: AutocompleteSelectOptions) {
    (options as FieldProps).InputComponent = AutocompleteSelectField;
    return fieldForWith<T, any, any, any>(field, options);
}

/**
 * Crée un champ de type AutocompleteText.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function autocompleteTextFor<T>(field: EntityField<T>, options: AutocompleteTextOptions) {
    (options as FieldProps).InputComponent = AutocompleteTextField;
    return fieldForWith<T, any, any, any>(field, options);
}

/**
 * Crée un champ standard en lecture seule.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function displayFor<T>(field: EntityField<T>, options?: BaseOptions<T> & {[key: string]: any}): JSX.Element;
export function displayFor<T>(field: T, options?: BaseOptions<T> & {[key: string]: any}): JSX.Element;
export function displayFor<T>(field: EntityField<T> | T, options: BaseOptions<T> & {[key: string]: any} = {}) {
    options.isEdit = false;
    return fieldFor(field, options);
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T>(field: EntityField<T>, options?: BaseOptions<T> & {[key: string]: any}): JSX.Element;
export function fieldFor<T>(field: T, options?: BaseOptions<T> & {[key: string]: any}): JSX.Element;
export function fieldFor<T>(field: EntityField<T> | T, options: BaseOptions<T> & {[key: string]: any} = {}) {
    if (isField(field)) {
        return fieldForWith(field, options);
    } else {
        return fieldForWith({$entity, value: field}, options);
    }
}

/**
 * Crée un champ avec des composants personnalisés.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldForWith<T, DisplayProps, FieldProps, InputProps>(field: EntityField<T>, options: FieldOptions<T, DisplayProps, FieldProps, InputProps> & DisplayProps & FieldProps & InputProps) {

    // Si on ne pose pas de ref, on considère qu'on n'a pas de formulaire et donc qu'on attend un comportement par défaut un peu différent.
    if (!options.ref) {
        if (options.isEdit === undefined) {
            options.isEdit = true;
        }
        if (options.forceErrorDisplay === undefined) {
            options.forceErrorDisplay = true;
        }
    }

    const props = buildFieldProps(field, options);
    return <Field {...props as any} />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param values La liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T>(field: EntityField<T>, values: {code?: T, id?: T}[], options?: SelectOptions<T>): JSX.Element;
export function selectFor<T>(field: T, values: {code?: T, id?: T}[], options?: SelectOptions<T>): JSX.Element;
export function selectFor<T>(field: EntityField<T> | T, values: {code?: T, id?: T}[], options: SelectOptions<T> = {}) {
    (options as FieldProps).InputComponent = Select;
    (options as FieldProps).values = values.slice(); // On s'assure que la liste de référence passée au composant ne soit pas observable.
    if (isField(field)) {
        return fieldForWith(field, options);
    } else {
        return fieldForWith({$entity, value: field}, options);
    }
}

/**
 * Récupère le texte correspondant à un champ.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function stringFor<T>(field: EntityField<T>, options: TextOptions = {}): string {
    const {formatter, valueKey = "code", labelKey = "label", values, value} = buildFieldProps(field, options);
    const processedValue = values ? result(find(values, {[valueKey]: value}), labelKey) : value;
    return formatter!(processedValue);
}

/**
 * Affiche un champ sous format texte.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function textFor<T>(field: EntityField<T>, options: TextOptions = {}) {
    return <div name={field.$entity.translationKey} style={options.style}>{stringFor(field, options)}</div>;
}

/**
 * Construit les props à passer au composant Field.
 *
 * Les props seront récupérées depuis, dans l'ordre, (1) le domaine, (2) l'entité, et (3) les options.
 * @param field La définition du champ.
 * @param options Les options du champ.
 */
export function buildFieldProps<T>(field: EntityField<T>, options: BaseOptions<T> = {}): FieldProps {
    const {value, $entity: {domain, translationKey, isRequired}} = field;
    const {hasLabel = true, ref, ...otherOptions} = options;
    const dom = domain || {};

    const props: FieldProps = {
        domain,
        formatter: dom.formatter || (x => x),
        hasLabel,
        isRequired,
        label: translationKey,
        name,
        innerRef: i => ref && ref(i),
        value,
        unformatter: dom.unformatter || (x => x)
    };

    return {...(domain || {}), ...props, ...otherOptions};
}

/**
 * Vérifie que l'entrée est un champ.
 * @param field Le champ ou la valeur.
 */
export function isField<T>(field: EntityField<T> | T): field is EntityField<T> {
    return !!(field && (field as EntityField<T>).$entity);
}
