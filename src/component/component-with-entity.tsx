import {find, result} from "lodash";
import * as React from "react";

import * as defaults from "defaults";
import {Entity, EntityField, Domain} from "definition";

import {ComponentBase} from "./component-base";

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
export interface SelectOptions<Props> extends BaseOptions {
    SelectComponent?: React.ComponentClass<Props>;
    labelKey?: string;
    listName?: string;
    refContainer?: {[x: string]: {}[]};
    valueKey?: string;
    values?: {}[];
}

/** Options pour `stringFor` et `textFor`. */
export interface TextOptions {
    formatter?: (data: any) => string;
    labelKey?: string;
    listName?: string;
    refContainer?: {[x: string]: {}[]};
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

/** Classe de base pour des composants Focus avec une entité. */
export abstract class ComponentWithEntity<P, S, E> extends ComponentBase<P, S & CWEState<E>> {

    private entity: Entity<E>;

    /**
     * Crée une nouvelle instance de ComponentWithEntity.
     * @param props Les props du composant.
     * @param entity L'entité du composant.
     */
    constructor(props: P, entity: Entity<E>) {
        super(props);
        this.entity = entity;
        this.state.entity = {} as E;

        this.autocompleteTextFor = this.autocompleteTextFor.bind(this);
        this.autocompleteSelectFor = this.autocompleteSelectFor.bind(this);
        this.displayFor = this.displayFor.bind(this);
        this.fieldFor = this.fieldFor.bind(this);
        this.selectFor = this.selectFor.bind(this);
        this.textFor = this.textFor.bind(this);
        this.stringFor = this.stringFor.bind(this);
        this.buildFieldProps = this.buildFieldProps.bind(this);
    }
    /**
     * Crée un champ de type AutocompleteSelect.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteSelectFor<Props>(field: EntityField, options: AutocompleteSelectOptions<Props> & Props) {
        return this.fieldFor(field, options);
    }

    /**
     * Crée un champ de type AutocompleteText.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteTextFor<Props>(field: EntityField, options: AutocompleteTextOptions<Props> & Props) {
        return this.fieldFor(field, options);
    }

    /**
     * Crée un champ standard en lecture seule.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    displayFor<Props>(field: EntityField, options: DisplayOptions<Props> & Props = {} as any) {
        options.isEdit = false;
        return this.fieldFor(field, options);
    }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<DisplayProps, FieldProps, InputProps, InputLabelProps>(
        field: EntityField,
        options: FieldOptions<DisplayProps, FieldProps, InputProps, InputLabelProps> & DisplayProps & FieldProps & InputProps & InputLabelProps = {} as any
    ) {
        const {Field} = defaults;
        if (!Field) {
            throw new Error("Le composant Field n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }

        const props = this.buildFieldProps(field, options);
        return <Field {...props} />;
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<Props>(field: EntityField, listName: string,  options: SelectOptions<Props> & Props = {} as any) {
        options.listName = listName;
        return this.fieldFor(field, options);
    }

    /**
     * Récupère le texte correspondant à un champ.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    stringFor(field: EntityField, options: TextOptions = {}): string {
        const {formatter, valueKey, labelKey, values, value} = this.buildFieldProps(field, options);
        const processedValue = values ? result(find(values, {[valueKey || "code"]: value}), labelKey || "label") : value;
        return formatter(processedValue);
    }

    /**
     * Affiche un champ sous format texte.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    textFor(field: EntityField, options: TextOptions = {}) {
        return <div name={field.name} style={options.style}>{this.stringFor(field, options)}</div>;
    }

    private buildFieldProps(field: EntityField, options: BuildFieldProps = {}) {
        const isEdit: boolean = options.isEdit !== undefined ? options.isEdit : this.state.isEdit !== undefined ? this.state.isEdit : this.props["isEdit"];
        const value = options.value !== undefined ? options.value : (this.props["data"] || this.state.entity)[field.name];
        const hasLabel = options.hasLabel || true;
        const dom: Domain = field.domain || {type: undefined};
        const refContainer: {[key: string]: {}[]} | undefined = options.refContainer || this.props["reference"] || this.state["reference"];
        const listName = options.listName || dom.listName;

        const propsContainer = {
            name: field.name,
            label: `${this.entity.moduleName}.${this.entity.name}.${field.name}`,
            ref: field.name,
            value: value,
            domain: field.domain,
            error: this.state.error ? this.state.error[field.name] : undefined,
            locale: dom.locale,
            format: dom.format,
            isEdit: isEdit,
            hasLabel: hasLabel,
            isRequired: field.isRequired,
            type: dom.type,
            validator: dom.validator,
            formatter: dom.formatter || (x => x),
            unformatter: dom.unformatter || (x => x),
            FieldComponent: dom.FieldComponent,
            InputLabelComponent: dom.InputLabelComponent,
            InputComponent: dom.InputComponent,
            SelectComponent: dom.SelectComponent,
            TextComponent: dom.TextComponent,
            DisplayComponent: dom.DisplayComponent,
            values: refContainer && listName && refContainer[listName]
        };

        return Object.assign(propsContainer, dom.options, options);
    }
}

interface BuildFieldProps {
    [key: string]: any;
    hasLabel?: boolean;
    isEdit?: boolean;
    listName?: string;
    refContainer?: {[x: string]: {}[]};
    value?: any;
}
