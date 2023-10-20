import {ComponentType, ReactNode} from "react";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldComponents,
    WithThemeProps
} from "./components";
import {Validator} from "./validation";

/** Type possible pour un champ de domaine.  */
export type DomainFieldType =
    | "boolean-array"
    | "boolean"
    | "number-array"
    | "number"
    | "object"
    | "string-array"
    | "string";

/** Récupère le type de domaine simple d'un type de domaine multiple. */
export type SimpleDomainFieldType<DT> = DT extends "boolean-array" | "boolean"
    ? "boolean"
    : DT extends "number-array" | "number"
    ? "number"
    : DT extends "object" | "string-array" | "string"
    ? "string"
    : never;

/** Définition d'un domaine. */
export interface Domain<
    DT extends DomainFieldType = any,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any,
    FProps extends WithThemeProps = any
> extends FieldComponents<ICProps, SCProps, ACProps, DCProps, LCProps, FProps> {
    /** Classe CSS pour le champ. */
    className?: string;
    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: DomainType<DT> | undefined) => string;
    /** Type d'un champ du domaine. */
    type: DT;
    /** Liste des validateurs. */
    validator?: Validator<DomainType<DT>> | Validator<DomainType<DT>>[];

    /** Composant personnalisé pour l'autocomplete. */
    AutocompleteComponent?: ComponentType<ACProps>;
    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: ComponentType<DCProps>;
    /** Composant personnalisé pour le libellé. */
    LabelComponent?: ComponentType<LCProps>;
    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: ComponentType<ICProps>;
    /** Composant personnalisé pour le select. */
    SelectComponent?: ComponentType<SCProps>;
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<
    DT extends DomainFieldType = any,
    T extends DomainType<DT> = DomainType<DT>,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any,
    FProps extends WithThemeProps = any
> {
    readonly type: "field";

    /** Type du champ, s'il est plus précis que celui du domaine. */
    readonly fieldType?: T;

    /** Domaine du champ. */
    readonly domain: Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps, FProps>;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: ReactNode;

    /** Valeur par défaut du champ dans un formulaire. */
    readonly defaultValue?: T;
}

export type FieldEntry2<D extends Domain, T extends DomainType<D["type"]> = DomainType<D["type"]>> = D extends Domain<
    infer DT,
    infer ICProps,
    infer SCProps,
    infer ACProps,
    infer DCProps,
    infer LCProps,
    infer FProps
>
    ? FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps, FProps>
    : never;

/** Récupère le type primitif d'un champ associé à un type défini dans un domaine. */
export type DomainType<DT> = DT extends "string"
    ? string
    : DT extends "number"
    ? number
    : DT extends "boolean"
    ? boolean
    : DT extends "string-array"
    ? string[]
    : DT extends "number-array"
    ? number[]
    : DT extends "boolean-array"
    ? boolean[]
    : any;

/** Récupère le type de champ simple associé à un domaine, ou never. */
export type DomainTypeSingle<DT> = DT extends "boolean" | "number" | "string" ? DomainType<DT> : never;

/** Récupère le type de champ multiple associé à un domaine, ou never. */
export type DomainTypeMultiple<DT> = DT extends "boolean-array" | "number-array" | "string-array"
    ? DomainType<DT>
    : never;

/** Type effectif d'un champ. */
export type FieldEntryType<F extends FieldEntry> = F extends FieldEntry<infer _, infer T> ? T : never;

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<E = any> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: E;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<E = any> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: E;
}

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface RecursiveListEntry {
    readonly type: "recursive-list";
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<E> = {
    -readonly [P in keyof E]?: E[P] extends FieldEntry
        ? FieldEntryType<E[P]>
        : E[P] extends ObjectEntry<infer OE>
        ? EntityToType<OE>
        : E[P] extends ListEntry<infer LE>
        ? EntityToType<LE>[]
        : E[P] extends RecursiveListEntry
        ? EntityToType<E>[]
        : never;
};

/** Définition de champ dans un store. */
export interface EntityField<F extends FieldEntry = FieldEntry> {
    /** Métadonnées. */
    readonly $field: F;

    /** Valeur. */
    value: FieldEntryType<F> | undefined;
}
