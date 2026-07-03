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
export interface FieldEntry<
    D extends Domain = any,
    T extends output<D["schema"]> = output<D["schema"]>,
    R extends boolean = boolean
> {
    readonly type: "field";

    /** Type du champ, s'il est plus précis que celui du domaine. */
    readonly fieldType?: T;

    /** Domaine du champ. */
    readonly domain: D;

    /** Champ obligatoire. */
    readonly isRequired: R;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: string;

    /** Valeur par défaut du champ dans un formulaire. */
    readonly defaultValue?: T;
}

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry<E extends Entity = any, R extends boolean = boolean> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: E;

    /** Objet obligatoire. */
    readonly isRequired: R;

    /** Libellé de l'entrée (non utilisé). */
    readonly label?: string;

    /** Commentaire de l'entrée (non utilisé). */
    readonly comment?: string;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<E extends Entity = any, R extends boolean = boolean> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: E;

    /** Liste obligatoire. */
    readonly isRequired: R;

    /** Libellé de l'entrée (non utilisé). */
    readonly label?: string;

    /** Commentaire de l'entrée (non utilisé). */
    readonly comment?: string;
}

/** Métadonnées d'une entrée de type "recursive-list" pour une entité. */
export interface RecursiveListEntry<R extends boolean = boolean> {
    readonly type: "recursive-list";

    /** Liste obligatoire. */
    readonly isRequired: R;

    /** Libellé de l'entrée (non utilisé). */
    readonly label?: string;

    /** Commentaire de l'entrée (non utilisé). */
    readonly comment?: string;
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToPartialType<E extends Entity> = {
    -readonly [P in keyof E]?: E[P] extends FieldEntry<infer _, infer T>
        ? T
        : E[P] extends ObjectEntry<infer OE>
          ? EntityToPartialType<OE>
          : E[P] extends ListEntry<infer LE>
            ? EntityToPartialType<LE>[]
            : E[P] extends RecursiveListEntry
              ? EntityToPartialType<E>[]
              : E[P] extends [Entity]
                ? EntityToPartialType<E[P][0]>[]
                : E[P] extends Entity
                  ? EntityToPartialType<E[P]>
                  : never;
};

/** Génère le type associé à une entité, avec les champs obligatoires non optionnels. */
export type EntityToType<E extends Entity> = {
    -readonly [P in keyof E as EntryToRequired<E[P]> extends true ? P : never]: EntityEntryToType<E, P>;
} & {
    -readonly [P in keyof E as EntryToRequired<E[P]> extends false ? P : never]?: EntityEntryToType<E, P>;
};

type EntityEntryToType<E extends Entity, P extends keyof E> =
    E[P] extends FieldEntry<infer _, infer T>
        ? T
        : E[P] extends ObjectEntry<infer OE>
          ? EntityToType<OE>
          : E[P] extends ListEntry<infer LE>
            ? EntityToType<LE>[]
            : E[P] extends RecursiveListEntry
              ? EntityToType<E>[]
              : E[P] extends [Entity]
                ? EntityToType<E[P][0]>[]
                : E[P] extends Entity
                  ? EntityToType<E[P]>
                  : never;

/** Définition d'une entité. */
// oxlint-disable-next-line no-empty-interface
export interface Entity extends Record<
    string,
    FieldEntry | ObjectEntry | ListEntry | RecursiveListEntry | Entity | [Entity]
> {}

/** Récupère le nom des propriétés d'une entité qui sont des champs. */
export type FieldsOf<E extends Entity> = {[P in keyof E]: E[P] extends FieldEntry ? P : never}[keyof E];

/** Récupère le nom des propriétés d'une entité qui sont des objets. */
export type ObjectsOf<E extends Entity> = {[P in keyof E]: E[P] extends ObjectEntry ? P : never}[keyof E];

/** Récupère le nom des propriétés d'une entité qui sont des listes. */
export type ListsOf<E extends Entity> = {
    [P in keyof E]: E[P] extends ListEntry | RecursiveListEntry ? P : never;
}[keyof E];

/** Récupère l'entité correspondant à une entrée d'entité. */
export type EntryToEntity<E> =
    E extends ObjectEntry<infer E1>
        ? E1
        : E extends ListEntry<infer E2>
          ? E2
          : E extends RecursiveListEntry
            ? E
            : never;

/** Récupère le caractère obligatoire d'une entrée d'entité. */
export type EntryToRequired<E> =
    E extends FieldEntry<infer _, infer __, infer R>
        ? R
        : E extends ObjectEntry<infer _, infer R>
          ? R
          : E extends ListEntry<infer _, infer R>
            ? R
            : E extends RecursiveListEntry<infer R>
              ? R
              : boolean;
