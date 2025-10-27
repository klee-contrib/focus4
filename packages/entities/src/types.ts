import {ReactNode} from "react";
import {output, ZodArray, ZodType} from "zod";

/** Correspond à un type de schéma pour un type primitif. */
export type ZodTypeSingle = ZodType<boolean> | ZodType<number> | ZodType<string>;

/** Correspond à un type de schéma pour un type d'array de primitives. */
export type ZodTypeMultiple = ZodArray<ZodType<boolean>> | ZodArray<ZodType<number>> | ZodArray<ZodType<string>>;

/** Récupère le type de domaine simple d'un type de domaine multiple. */
export type SingleZodType<S> = S extends ZodArray<infer ES> ? ES : S;

/** Définition d'un domaine. */
declare global {
    interface Domain<S extends ZodType = any> {
        /** Schéma Zod d'un champ du domaine. */
        schema: S;
    }
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
