import {find, result} from "lodash";
import * as React from "react";

import * as defaults from "../defaults";
import {EntityField} from "../entity";
import {CommonListProps, ListForProps, ListSelection, ListSelectionProps, ListTable, ListTableProps, MemoryList, LineProps, LineSelectionProps} from "../list";

import {Field, FieldProps} from "./field";

/** Item attendu dans recherche d'autocomplétion. */
export interface AutoCompleteItem {
    key: string;
    label: string;
}

/** Résultat attendu d'une recherche d'autocomplétion. */
export interface AutoCompleteResult {
    data: AutoCompleteItem[];
    totalCount: number;
}

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
    DisplayComponent?: defaults.ReactComponent<DisplayProps>;
    FieldComponent?: defaults.ReactComponent<FieldProps>;
    InputComponent?: defaults.ReactComponent<InputProps>;
    LabelComponent?: defaults.ReactComponent<{domain: string, name: string, text: string}>;
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
    const {AutocompleteSelect} = defaults;
    if (!AutocompleteSelect) {
        throw new Error("AutocompleteSelect manque. Utilisez autofocus/defaults pour le fournir.");
    }
    (options as FieldProps).InputComponent = AutocompleteSelect;
    return fieldForWith(field, options);
}

/**
 * Crée un champ de type AutocompleteText.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function autocompleteTextFor<T>(field: EntityField<T>, options: AutocompleteTextOptions) {
    const {AutocompleteText} = defaults;
    if (!AutocompleteText) {
        throw new Error("AutocompleteText manque. Utilisez autofocus/defaults pour le fournir.");
    }
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
export function listFor<T, P extends LineSelectionProps<T>>(data: T[], options: ListForProps & {perPage?: number} & ListSelectionProps<T, P>) {
    return listForWith(ListSelection, data, options);
}

/**
 * Crée un composant de liste personnalisé à partir de la liste fournie.
 * @param ListComponent Le component de liste.
 * @param data La liste.
 * @param options Les options.
 */
export function listForWith<T, P extends CommonListProps<T>>(ListComponent: defaults.ReactComponent<P>, data: T[], options: ListForProps & {perPage?: number} & P) {
    return MemoryList.create({
        data,
        ListComponent,
        perPage: options.perPage,
        listProps: options
    });
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param listName Le nom de la liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T>(field: EntityField<T>, values: {code?: T, id?: T}[], options: SelectOptions<T> = {}) {
    const {Select} = defaults;
    if (!Select) {
        throw new Error("Select manque. Utilisez autofocus/defaults pour le fournir.");
    }
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
export function tableFor<T, P extends LineProps<T>>(data: T[], options: CommonListProps<T> & {perPage?: number} & ListTableProps<T, P>) {
    return listForWith(ListTable, data, options);
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
