import {find, result, omit} from "lodash";
import * as React from "react";

import AutocompleteSelect, {AutoCompleteResult} from "focus-components/autocomplete-select";
import AutocompleteText from "focus-components/autocomplete-text/field";
import Select from "focus-components/select";

import {EntityField} from "../entity";
import {CommonListProps, ListSelection, ListSelectionProps, ListTable, ListTableProps, MemoryList, LineProps, LineSelectionProps} from "../list";

import {Field, FieldProps} from "./field";

/** Options communes à tous les champs. */
export interface BaseOptions {
    error?: string;
    isEdit?: boolean;
    labelKey?: string;
    name?: string;
    value?: any;
    contentCellPosition?: string;
    contentOffset?: number;
    contentSize?: number;
    hasLabel?: boolean;
    isRequired?: boolean;
    label?: string;
    labelCellPosition?: string;
    labelOffset?: number;
    labelSize?: number;
}

/** Options pour `autocompleteSelectFor`. */
export interface AutocompleteSelectOptions extends AutocompleteTextOptions {
    keyResolver: (code: string | number) => Promise<string>;
}

/** Options pour `autocompleteTextFor`. */
export interface AutocompleteTextOptions extends BaseOptions {
    onChange?: (code: string) => void;
    querySearcher: (text: string) => Promise<AutoCompleteResult>;
}

/** Options pour `fieldForWith` */
export interface FieldOptions<DisplayProps, FieldProps, InputProps> extends BaseOptions {
    DisplayComponent?: ReactComponent<DisplayProps>;
    FieldComponent?: ReactComponent<FieldProps>;
    InputComponent?: ReactComponent<InputProps>;
    LabelComponent?: ReactComponent<{domain: string, name: string, text: string}>;
}

/** Options pour `selectFor`. */
export interface SelectOptions<T> extends BaseOptions {
    onChange?: (code: T) => void;
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

/** State propre à ComponentWithEntity. */
export interface CWEState<E> {
    isEdit?: boolean;
    error?: {[x: string]: string};
    entity?: E;
}

/**
 * Crée un champ de type AutocompleteSelect.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function autocompleteSelectFor<T>(field: EntityField<T>, options: AutocompleteSelectOptions) {
    (options as FieldProps).InputComponent = AutocompleteSelect;
    return fieldForWith(field, options);
}

/**
 * Crée un champ de type AutocompleteText.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function autocompleteTextFor<T>(field: EntityField<T>, options: AutocompleteTextOptions) {
    (options as FieldProps).InputComponent = AutocompleteText;
    return fieldForWith(field, options);
}

/**
 * Crée un champ standard en lecture seule.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function displayFor<T>(field: EntityField<T>, options: BaseOptions & {[key: string]: any} = {}) {
    options.isEdit = false;
    return fieldForWith(field, options);
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T>(field: EntityField<T>, options: BaseOptions & {[key: string]: any} = {}) {
    return fieldForWith(field, options);
}

/**
 * Crée un champ avec des composants personnalisés.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldForWith<T, DisplayProps, FieldProps, InputProps>(field: EntityField<T>, options: FieldOptions<DisplayProps, FieldProps, InputProps> & DisplayProps & FieldProps & InputProps) {
    const props = buildFieldProps(field, options);
    return <Field {...props} />;
}

/**
 * Crée un composant de liste (par défaut) à partir de la liste fournie.
 * @param data La liste.
 * @param options Les options.
 */
export function listFor<T, P extends LineSelectionProps<T>>(data: T[], options: ListSelectionProps<T, P> & {perPage?: number}) {
    return listForWith(ListSelection, Object.assign({}, options, {data}));
}

/**
 * Crée un composant de liste personnalisé à partir de la liste fournie.
 * @param ListComponent Le component de liste.
 * @param options Les options (dont les données de la liste).
 */
export function listForWith<T, P extends CommonListProps & {data: T[]}>(ListComponent: ReactComponent<P>, options: P & {perPage?: number}) {
    return MemoryList.create({
        data: options.data,
        ListComponent,
        perPage: options.perPage,
        listProps: omit(options, "data", "perPage")
    });
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param listName Le nom de la liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T>(field: EntityField<T>, values: {code?: T, id?: T}[], options: SelectOptions<T> = {}) {
    (options as FieldProps).InputComponent = Select;
    (options as FieldProps).values = values;
    return fieldForWith(field, options);
}

/**
 * Récupère le texte correspondant à un champ.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function stringFor<T>(field: EntityField<T>, options: TextOptions = {}): string {
    const {formatter, valueKey, labelKey, values, value} = buildFieldProps(field, options);
    const processedValue = values ? result(find(values, {[valueKey || "code"]: value}), labelKey || "label") : value;
    return formatter!(processedValue);
}

/**
 * Crée un composant de tableau à partir de la liste fournie.
 * @param data La liste.
 * @param options Les options.
 */
export function tableFor<T, P extends LineProps<T>>(data: T[], options: ListTableProps<T, P> & {perPage?: number}) {
    return listForWith(ListTable, Object.assign({}, options, {data}));
}

/**
 * Affiche un champ sous format texte.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function textFor<T>(field: EntityField<T>, options: TextOptions = {}) {
    return <div name={field.$entity.translationKey} style={options.style}>{stringFor(field, options)}</div>;
}

function buildFieldProps<T>(field: EntityField<T>, options: FieldProps = {}): FieldProps {
    const {value, $entity: {domain, translationKey, isRequired}} = field;
    const hasLabel = options.hasLabel || true;
    const dom = domain || {};

    const props = {
        ref: translationKey,
        domain,
        hasLabel,
        label: translationKey,
        isRequired,
        name,
        value,
        formatter: dom.formatter || (x => x),
        unformatter: dom.unformatter || (x => x)
    };

    return Object.assign({}, domain, props, options);
}
