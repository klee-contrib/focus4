import {output, ZodType} from "zod";

import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    Entity,
    FieldEntry,
    ListEntry,
    ObjectEntry
} from "../types";

import {FieldEntryBuilder, ListEntryBuilder, ObjectEntryBuilder, RecursiveListEntryBuilder} from "./entry-builders";

/**
 * Crée un champ pour une entité.
 *
 * (Le champ sera obligatoire par défaut)
 * @param domain Le domaine du champ.
 */
export function field<
    S extends ZodType,
    ICProps extends BaseInputProps<S> = BaseInputProps<S>,
    SCProps extends BaseSelectProps<S> = BaseSelectProps<S>,
    ACProps extends BaseAutocompleteProps<S> = BaseAutocompleteProps<S>,
    DCProps extends BaseDisplayProps<S> = BaseDisplayProps<S>,
    LCProps extends BaseLabelProps = BaseLabelProps,
    FProps extends {theme?: object} = {theme?: object}
>(
    domain: Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FProps>
): FieldEntry<S, output<S>, ICProps, SCProps, ACProps, DCProps, LCProps, FProps>;
/**
 * Crée un champ pour une entité.
 *
 * (Le champ sera obligatoire par défaut)
 * @param domain Le domaine du champ.
 * @param builder Le configurateur du champ.
 */
export function field<
    S extends ZodType,
    T extends output<S> = output<S>,
    ICProps extends BaseInputProps<S> = BaseInputProps<S>,
    SCProps extends BaseSelectProps<S> = BaseSelectProps<S>,
    ACProps extends BaseAutocompleteProps<S> = BaseAutocompleteProps<S>,
    DCProps extends BaseDisplayProps<S> = BaseDisplayProps<S>,
    LCProps extends BaseLabelProps = BaseLabelProps,
    FProps extends {theme?: object} = {theme?: object}
>(
    domain: Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FProps>,
    builder: (f: FieldEntryBuilder<output<S>>) => FieldEntryBuilder<T>
): FieldEntry<S, T, ICProps, SCProps, ACProps, DCProps, LCProps, FProps>;
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
