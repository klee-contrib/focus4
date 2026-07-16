import {Entity, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "../types";

import {entity} from "./entity";

type PartialNonReadonly<T> = {-readonly [P in keyof T]?: T[P]};

class EntryBuilder<R extends boolean = true> {
    /** @internal */
    entry: PartialNonReadonly<
        ObjectEntry<any, R> | FieldEntry<any, any, R> | ListEntry<any, R> | RecursiveListEntry<R>
    >;

    constructor(type: "field" | "object" | "list" | "recursive-list") {
        this.entry = {type, label: "", isRequired: true as any};
    }

    /** Rend l'entrée d'entité non-obligatoire. */
    optional(): EntryBuilder<false> {
        // @ts-expect-error - Justement, on change le type de R.
        this.entry.isRequired = false;
        // @ts-expect-error - Justement, on change le type de R.
        return this;
    }

    /**
     * Renseigne le libellé de l'entrée d'entité
     * @param label Le libellé.
     */
    label(label: string) {
        this.entry.label = label;
        return this;
    }
    /**
     * Renseigne le commentaire de l'entrée d'entité
     * @param comment Le commentaire.
     */
    comment(comment: string) {
        this.entry.comment = comment;
        return this;
    }
}

export class FieldEntryBuilder<T = any, R extends boolean = true> extends EntryBuilder<R> {
    /** @internal */
    declare entry: PartialNonReadonly<FieldEntry<any, any, R>>;

    constructor(domain: Domain) {
        super("field");
        this.entry.name = "";
        this.entry.domain = domain;
    }

    declare optional: () => FieldEntryBuilder<T, false>;

    /**
     * Renseigne la valeur par défaut du champ.
     * @param defaultValue La valeur par défaut.
     */
    defaultValue(defaultValue: T) {
        this.entry.defaultValue = defaultValue;
        return this;
    }

    /**
     * Renseigne le nom du champ. Si non renseigné, il sera renseigné par la fonction `entity` avec le nom de la propriété dans l'objet.
     * @param name Le nom du champ.
     */
    name(name: string) {
        this.entry.name = name;
        return this;
    }

    /** Précise le type du champ, au delà du type déduit de son schéma. Le nouveau type doit y être assignable à l'ancien. */
    type<NT extends T>(): FieldEntryBuilder<NT, R> {
        return this;
    }
}

export class ObjectEntryBuilder<R extends boolean = true> extends EntryBuilder<R> {
    /** @internal */
    declare entry: PartialNonReadonly<ObjectEntry<any, R>>;
    constructor(e: Entity) {
        super("object");
        this.entry.entity = entity(e);
    }

    declare optional: () => ObjectEntryBuilder<false>;
}

export class ListEntryBuilder<R extends boolean = true> extends EntryBuilder<R> {
    /** @internal */
    declare entry: PartialNonReadonly<ListEntry<any, R>>;
    constructor(e: Entity) {
        super("list");
        this.entry.entity = entity(e);
    }

    declare optional: () => ListEntryBuilder<false>;
}

export class RecursiveListEntryBuilder<R extends boolean = true> extends EntryBuilder<R> {
    declare entry: RecursiveListEntry<R>;
    constructor() {
        super("recursive-list");
    }

    declare optional: () => RecursiveListEntryBuilder<false>;
}
