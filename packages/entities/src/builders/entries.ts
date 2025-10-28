import {output} from "zod";

import {Entity, FieldEntry, ListEntry, ObjectEntry} from "../types";

import {FieldEntryBuilder, ListEntryBuilder, ObjectEntryBuilder, RecursiveListEntryBuilder} from "./entry-builders";

/**
 * Crée un champ pour une entité.
 *
 * (Le champ sera obligatoire par défaut)
 * @param domain Le domaine du champ.
 */
export function field<D extends Domain>(domain: D): FieldEntry<D>;
/**
 * Crée un champ pour une entité.
 *
 * (Le champ sera obligatoire par défaut)
 * @param domain Le domaine du champ.
 * @param builder Le configurateur du champ.
 */
export function field<D extends Domain, T extends output<D["schema"]> = output<D["schema"]>>(
    domain: D,
    builder: (f: FieldEntryBuilder<D["schema"]>) => FieldEntryBuilder<T>
): FieldEntry<D, T>;
export function field(domain: Domain, builder: (f: FieldEntryBuilder) => FieldEntryBuilder = f => f) {
    return builder(new FieldEntryBuilder(domain)).entry;
}
/**
 * Crée un composition simple pour une entité.
 * @param entity L'entité pour la composition.
 * @param builder Le configurateur.
 */
export function object<const E extends Entity>(
    entity: E,
    builder: (f: ObjectEntryBuilder) => ObjectEntryBuilder = f => f
) {
    return builder(new ObjectEntryBuilder(entity)).entry as ObjectEntry<E>;
}

/**
 * Crée un composition liste pour une entité.
 * @param entity L'entité pour la composition.
 * @param builder Le configurateur.
 */
export function list<const E extends Entity>(entity: E, builder: (f: ListEntryBuilder) => ListEntryBuilder = f => f) {
    return builder(new ListEntryBuilder(entity)).entry as ListEntry<E>;
}

/**
 * Crée un composition de liste récursive (une liste de l'entité qui la contient).
 * @param builder Le configurateur.
 */
export function recursiveList(builder: (f: RecursiveListEntryBuilder) => RecursiveListEntryBuilder = f => f) {
    return builder(new RecursiveListEntryBuilder()).entry;
}
