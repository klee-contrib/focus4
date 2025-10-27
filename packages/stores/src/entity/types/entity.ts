import {ComponentType, ReactNode} from "react";
import {output, ZodArray, ZodType} from "zod";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    FieldComponents
} from "./components";
import {Validator} from "./validation";

export type ZodTypeSingle = ZodType<boolean> | ZodType<number> | ZodType<string>;

export type ZodTypeMultiple = ZodArray<ZodType<boolean>> | ZodArray<ZodType<number>> | ZodArray<ZodType<string>>;

/** Récupère le type de domaine simple d'un type de domaine multiple. */
export type SingleZodType<S> = S extends ZodArray<infer ES> ? ES : S;

/** Définition d'un domaine. */
export interface Domain<
    S extends ZodType = any,
    ICProps extends BaseInputProps<S> = any,
    SCProps extends BaseSelectProps<S> = any,
    ACProps extends BaseAutocompleteProps<S> = any,
    DCProps extends BaseDisplayProps<S> = any,
    LCProps extends BaseLabelProps = any,
    FProps extends {theme?: object} = any
> extends FieldComponents<S, ICProps, SCProps, ACProps, DCProps, LCProps, FProps> {
    /** Classe CSS pour le champ. */
    className?: string;
    /**
     * Formatteur pour l'affichage du champ en consulation.
     *
     * Peut être une fonction de la valeur, ou une clé i18n qui sera appelée avec la variable `value`.
     */
    displayFormatter?: ((value: output<S> | undefined) => string) | string;
    /** Schéma Zod d'un champ du domaine. */
    schema: S;
    /**
     * Liste des validateurs.
     *
     * @deprecated Vous n'avez plus besoin de validateurs dédiés, ils peuvent être intégrés au schéma.
     */
    validator?: Validator<output<S>> | Validator<output<S>>[];

    /** Composant personnalisé pour l'autocomplete. */
    AutocompleteComponent: ComponentType<ACProps>;
    /** Composant personnalisé pour l'affichage. */
    DisplayComponent: ComponentType<DCProps>;
    /** Composant personnalisé pour le libellé. */
    LabelComponent: ComponentType<LCProps>;
    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent: ComponentType<ICProps>;
    /** Composant personnalisé pour le select. */
    SelectComponent: ComponentType<SCProps>;
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<D extends Domain = any, T extends output<D["schema"]> = output<D["schema"]>> {
    readonly type: "field";

    /** Type du champ, s'il est plus précis que celui du domaine. */
    readonly fieldType?: T;

    /** Domaine du champ. */
    readonly domain: D;

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

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<E = any> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: E;

    /** Objet obligatoire. Sera `true` si non renseigné. */
    readonly isRequired?: boolean;

    /** Libellé de l'entrée (non utilisé). */
    readonly label?: string;

    /** Commentaire de l'entrée (non utilisé). */
    readonly comment?: ReactNode;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<E = any> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: E;

    /** Liste obligatoire. Sera `true` si non renseigné. */
    readonly isRequired?: boolean;

    /** Libellé de l'entrée (non utilisé). */
    readonly label?: string;

    /** Commentaire de l'entrée (non utilisé). */
    readonly comment?: ReactNode;
}

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface RecursiveListEntry {
    readonly type: "recursive-list";

    /** Liste obligatoire. Sera `true` si non renseigné. */
    readonly isRequired?: boolean;

    /** Libellé de l'entrée (non utilisé). */
    readonly label?: string;

    /** Commentaire de l'entrée (non utilisé). */
    readonly comment?: ReactNode;
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<E> = {
    -readonly [P in keyof E]?: E[P] extends FieldEntry
        ? E[P]["fieldType"]
        : E[P] extends ObjectEntry<infer OE>
          ? EntityToType<OE>
          : E[P] extends ListEntry<infer LE>
            ? EntityToType<LE>[]
            : E[P] extends RecursiveListEntry
              ? EntityToType<E>[]
              : never;
};

/** Définition d'une entité. */
export type Entity = Record<string, FieldEntry | ObjectEntry | ListEntry | RecursiveListEntry>;
