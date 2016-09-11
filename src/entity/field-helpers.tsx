import {find, result} from "lodash";
import * as React from "react";

import * as defaults from "../defaults";
import {EntityField} from "../entity";
import {BaseListProps, ListSelection, ListSelectionProps, ListTable, ListTableProps, MemoryList, LineProps, LineSelectionProps} from "../list";

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
    hasLabel?: boolean;
    isEdit?: boolean;
    isRequired?: boolean;
    label?: string;
    labelSize?: number;
    onChange?: (...args: any[]) => void;
    style?: React.CSSProperties;
    value?: any;
}

/** Options pour `autocompleteSelectFor`. */
export interface AutocompleteSelectOptions<Props> extends BaseOptions {
    AutocompleteSelectComponent?: React.ComponentClass<Props>;
    keyResolver: (code: string | number) => Promise<string>;
    querySearcher: (text: string) => Promise<AutoCompleteResult>;
}

/** Options pour `autocompleteTextFor`. */
export interface AutocompleteTextOptions<Props> extends BaseOptions {
    AutocompleteTextComponent?: React.ComponentClass<Props>;
    querySearcher: (text: string) => Promise<AutoCompleteResult>;
}

/** Options pour `displayFor`. */
export interface DisplayOptions<Props> extends BaseOptions {
    DisplayComponent?: React.ComponentClass<Props> | ((props: Props) => JSX.Element);
    LabelComponent?: React.ComponentClass<{domain: string, name: string, text: string}>;
}

/** Options pour `fieldFor` */
export interface FieldOptions<DisplayProps, FieldProps, InputProps, InputLabelProps> extends DisplayOptions<DisplayProps> {
    FieldComponent?: React.ComponentClass<FieldProps> | ((props: FieldProps) => JSX.Element);
    InputComponent?: React.ComponentClass<InputProps> | ((props: InputProps) => JSX.Element);
    InputLabelComponent?: React.ComponentClass<InputLabelProps> | ((props: InputLabelProps) => JSX.Element);
}

/** Options pour `selectFor`. */
export interface SelectOptions<T, Props> extends BaseOptions {
    SelectComponent?: React.ComponentClass<Props>;
    labelKey?: string;
    valueKey?: string;
    values?: T[];
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
export function autocompleteSelectFor<T, Props>(field: EntityField<T>, options: AutocompleteSelectOptions<Props> & Props) {
    return fieldFor(field, options);
}

/**
 * Crée un champ de type AutocompleteText.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function autocompleteTextFor<T, Props>(field: EntityField<T>, options: AutocompleteTextOptions<Props> & Props) {
    return fieldFor(field, options);
}

/**
 * Crée un champ standard en lecture seule.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function displayFor<T, Props>(field: EntityField<T>, options: DisplayOptions<Props> & Props = {} as any) {
    options.isEdit = false;
    return fieldFor(field, options);
}

/**
 * Crée un champ standard.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function fieldFor<T, DisplayProps, FieldProps, InputProps, InputLabelProps>(
    field: EntityField<T>,
    options: FieldOptions<DisplayProps, FieldProps, InputProps, InputLabelProps> & DisplayProps & FieldProps & InputProps & InputLabelProps = {} as any
) {
    const {Field} = defaults;
    if (!Field) {
        throw new Error("Le composant Field n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
    }

    const props = buildFieldProps(field, options);
    return <Field {...props} />;
}

/**
 * Crée un composant de liste (par défaut) à partir de la liste fournie.
 * @param data La liste.
 * @param options Les options.
 */
export function listFor<P extends LineSelectionProps<{}>>(data: {}[], options: BaseListProps & {perPage?: number} & ListSelectionProps<P>) {
    return listForWith(ListSelection, data, options);
}

/**
 * Crée un composant de liste personnalisé à partir de la liste fournie.
 * @param ListComponent Le component de liste.
 * @param data La liste.
 * @param options Les options.
 */
export function listForWith<ListProps extends BaseListProps>(ListComponent: defaults.ReactComponent<ListProps>, data: {}[], options: BaseListProps & {perPage?: number} & ListProps) {
    const defaultProps = {
        values: data || [],
        ListComponent,
        isEdit: false
    };

    const finalProps = Object.assign(defaultProps, options);
    return <MemoryList ref="list" {...finalProps} />;
}

/**
 * Crée un champ avec résolution de référence.
 * @param field La définition de champ.
 * @param listName Le nom de la liste de référence.
 * @param options Les options du champ.
 */
export function selectFor<T, Props>(field: EntityField<T>, values: T[], options: SelectOptions<T, Props> & Props = {} as any) {
    options.values = values;
    return fieldFor(field, options);
}

/**
 * Récupère le texte correspondant à un champ.
 * @param field La définition de champ.
 * @param options Les options du champ.
 */
export function stringFor<T>(field: EntityField<T>, options: TextOptions = {}): string {
    const {formatter, valueKey, labelKey, values, value} = buildFieldProps(field, options);
    const processedValue = values ? result(find(values, {[valueKey || "code"]: value}), labelKey || "label") : value;
    return formatter(processedValue);
}

/**
 * Crée un composant de tableau à partir de la liste fournie.
 * @param data La liste.
 * @param options Les options.
 */
export function tableFor<P extends LineProps<{}>>(data: {}[], options: BaseListProps & {perPage?: number} & ListTableProps<P>) {
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

function buildFieldProps<T>(field: EntityField<T>, options: {hasLabel?: boolean} = {}) {
    const {value, $entity: {domain, translationKey, isRequired}} = field;
    const hasLabel = options.hasLabel || true;
    const dom = domain || {type: undefined};

    const propsContainer = {
        domain,
        hasLabel,
        label: translationKey,
        isRequired,
        name,
        value,
        format: dom.format,
        locale: dom.locale,
        type: dom.type,
        validator: dom.validator,
        formatter: dom.formatter || (x => x),
        unformatter: dom.unformatter || (x => x),
        FieldComponent: dom.FieldComponent,
        InputLabelComponent: dom.InputLabelComponent,
        InputComponent: dom.InputComponent,
        SelectComponent: dom.SelectComponent,
        TextComponent: dom.TextComponent,
        DisplayComponent: dom.DisplayComponent
    };

    return Object.assign(propsContainer, dom.options as {[key: string]: any}, options);
}
