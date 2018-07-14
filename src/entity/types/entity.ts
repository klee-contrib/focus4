import {Autocomplete, Display, Input, Label, Select} from "../../components";

import {Validator} from "./validation";

export type Props<T> = T extends any
    ? any
    : T extends React.Component<infer P1> ? P1 : T extends (props: infer P2) => any ? P2 : never;

export interface BaseAutocompleteProps {
    keyResolver?: (key: number | string) => Promise<string | undefined>;
}

export interface BaseSelectProps {
    labelKey: string;
    valueKey: string;
    values: {}[];
}

export interface BaseComponents<DCProps = any, LCProps = any> {
    /** Props pour le composant d'affichage */
    displayProps?: Partial<DCProps>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<LCProps>;
}

export interface InputComponents<ICProps = any, DCProps = any, LCProps = any> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'entrée utilisateur. */
    inputProps?: Partial<ICProps>;
}

export interface SelectComponents<SCProps extends BaseSelectProps = any, DCProps = any, LCProps = any>
    extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'autocomplete. */
    selectProps?: Partial<SCProps>;
}

export interface AutocompleteComponents<ACProps extends BaseAutocompleteProps = any, DCProps = any, LCProps = any>
    extends BaseComponents<DCProps, LCProps> {
    /** Props supplémentaires pour le composant autocomplete. */
    autocompleteProps?: Partial<ACProps>;
}

export interface FieldComponents<
    ICProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps = any,
    LCProps = any
>
    extends InputComponents<ICProps, DCProps, LCProps>,
        SelectComponents<SCProps, DCProps, LCProps>,
        AutocompleteComponents<ACProps, DCProps, LCProps> {}

/** Définition d'un domaine. */
export interface Domain<
    IComp = typeof Input,
    SComp extends React.ComponentType<BaseSelectProps> = typeof Select,
    AComp extends React.ComponentType<BaseAutocompleteProps> = typeof Autocomplete,
    DComp = typeof Display,
    LComp = typeof Label
> extends FieldComponents<IComp, Props<SComp>, Props<AComp>, DComp, LComp> {
    /** Classe CSS pour le champ. */
    className?: string;
    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: any) => string;
    /** Formatteur pour l'affichage du champ en édition. */
    inputFormatter?: (value: any) => string;
    /** Formatteur inverse pour convertir l'affichage du champ en la valeur (édition uniquement) */
    unformatter?: (text: string) => any;
    /** Liste des validateurs. */
    validator?: Validator | Validator[];

    /** Composant personnalisé pour l'autocomplete. */
    AutocompleteComponent?: AComp;
    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: DComp;
    /** Composant personnalisé pour le libellé. */
    LabelComponent?: LComp;
    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: IComp;
    /** Composant personnalisé pour le select. */
    SelectComponent?: SComp;
}

/** Définition générale d'une entité. */
export interface Entity {
    /** Nom de l'entité. */
    readonly name: string;

    /** Liste des champs de l'entité. */
    readonly fields: {[key: string]: FieldEntry | ObjectEntry | ListEntry};
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<
    T = any,
    IComp = any,
    SComp extends React.ComponentType<BaseSelectProps> = any,
    AComp extends React.ComponentType<BaseAutocompleteProps> = any,
    DComp = any,
    LComp = any
> {
    readonly type: "field";

    /** Type du champ. */
    readonly fieldType: T;

    /** Domaine du champ. */
    readonly domain: Domain<IComp, SComp, AComp, DComp, LComp>;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: React.ReactNode;
}

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<T extends Entity = any> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: T;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<T extends Entity = any> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: T;
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<T extends Entity> = {
    [P in keyof T["fields"]]?: T["fields"][P] extends FieldEntry
        ? T["fields"][P]["fieldType"]
        : T["fields"][P] extends ObjectEntry<infer U>
            ? EntityToType<U>
            : T["fields"][P] extends ListEntry<infer V> ? EntityToType<V>[] : never
};

/** Définition de champ dans un store. */
export interface EntityField<
    F extends FieldEntry = FieldEntry<
        any,
        typeof Input,
        typeof Select,
        typeof Autocomplete,
        typeof Display,
        typeof Label
    >
> {
    /** Métadonnées. */
    readonly $field: F;

    /** Valeur. */
    value: F["fieldType"] | undefined;
}
