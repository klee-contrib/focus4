import {ComponentType} from "react";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldComponents
} from "./components";
import {Validator} from "./validation";

/** Définition d'un domaine. */
export interface Domain<
    DT extends "string" | "number" | "boolean" | "object" = any,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> extends FieldComponents<ICProps, SCProps, ACProps, DCProps, LCProps> {
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
    DT extends "string" | "number" | "boolean" | "object" = any,
    T extends DomainType<DT> = DomainType<DT>,
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
> {
    readonly type: "field";

    /** Type du champ, s'il est plus précis que celui du domaine. */
    readonly fieldType?: T;

    /** Domaine du champ. */
    readonly domain: Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps>;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: React.ReactNode;
}

export type FieldEntry2<D extends Domain, T extends DomainType<D["type"]> = DomainType<D["type"]>> = D extends Domain<
    infer DT,
    infer ICProps,
    infer SCProps,
    infer ACProps,
    infer DCProps,
    infer LCProps
>
    ? FieldEntry<DT, T, ICProps, SCProps, ACProps, DCProps, LCProps>
    : never;

/** Récupère le type primitif d'un champ associé à un type défini dans un domaine. */
export type DomainType<DT> = DT extends "string"
    ? string
    : DT extends "number"
    ? number
    : DT extends "boolean"
    ? boolean
    : any;

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
