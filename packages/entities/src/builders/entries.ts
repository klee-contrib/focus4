import {output} from "zod";

import {Entity, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "../types";

import {FieldEntryBuilder, ListEntryBuilder, ObjectEntryBuilder, RecursiveListEntryBuilder} from "./entry-builders";

/**
 * Crée un champ pour une entité.
 *
 * (Le champ sera obligatoire par défaut)
 * @param domain Le domaine du champ.
 */
export function field<D extends Domain>(domain: D): FieldEntry<D, output<D["schema"]>, true>;
/**
 * Crée un champ pour une entité.
 *
 * (Le champ sera obligatoire par défaut)
 * @param domain Le domaine du champ.
 * @param builder Le configurateur du champ.
 */
export function field<
    D extends Domain,
    T extends output<D["schema"]> = output<D["schema"]>,
    const R extends boolean = true
>(domain: D, builder: (f: FieldEntryBuilder<output<D["schema"]>>) => FieldEntryBuilder<T, R>): FieldEntry<D, T, R>;
export function field(domain: Domain, builder: (f: FieldEntryBuilder) => FieldEntryBuilder = f => f) {
    return builder(new FieldEntryBuilder(domain)).entry;
}
/**
 * Crée un composition simple pour une entité.
 * @param entity L'entité pour la composition.
 */
export function object<const E extends Entity>(entity: E): ObjectEntry<E, true>;
/**
 * Crée un composition simple pour une entité.
 * @param entity L'entité pour la composition.
 * @param builder Le configurateur.
 */
export function object<const E extends Entity, const R extends boolean = true>(
    entity: E,
    builder: (f: ObjectEntryBuilder) => ObjectEntryBuilder<R>
): ObjectEntry<E, R>;
export function object<const E extends Entity, const R extends boolean = true>(
    entity: E,
    builder: (f: ObjectEntryBuilder) => ObjectEntryBuilder<R> = f => f as ObjectEntryBuilder<R>
) {
    return builder(new ObjectEntryBuilder(entity)).entry as ObjectEntry<E, R>;
}

/**
 * Crée un composition liste pour une entité.
 * @param entity L'entité pour la composition.
 */
export function list<const E extends Entity>(entity: E): ListEntry<E, true>;
/**
 * Crée un composition liste pour une entité.
 * @param entity L'entité pour la composition.
 * @param builder Le configurateur.
 */
export function list<const E extends Entity, const R extends boolean = true>(
    entity: E,
    builder: (f: ListEntryBuilder) => ListEntryBuilder<R>
): ListEntry<E, R>;
export function list<const E extends Entity, const R extends boolean = true>(
    entity: E,
    builder: (f: ListEntryBuilder) => ListEntryBuilder<R> = f => f as ListEntryBuilder<R>
) {
    return builder(new ListEntryBuilder(entity)).entry as ListEntry<E, R>;
}

/**
 * Crée un composition de liste récursive (une liste de l'entité qui la contient).
 */
export function recursiveList(): RecursiveListEntry<true>;
/**
 * Crée un composition de liste récursive (une liste de l'entité qui la contient).
 * @param builder Le configurateur.
 */
export function recursiveList<const R extends boolean = true>(
    builder: (f: RecursiveListEntryBuilder) => RecursiveListEntryBuilder<R>
): RecursiveListEntry<R>;
export function recursiveList<const R extends boolean = true>(
    builder: (f: RecursiveListEntryBuilder) => RecursiveListEntryBuilder<R> = f => f as RecursiveListEntryBuilder<R>
) {
    return builder(new RecursiveListEntryBuilder()).entry;
}
