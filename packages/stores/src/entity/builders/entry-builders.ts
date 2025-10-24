import {Domain, Entity, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "../types";

import {entity} from "./entity";

type PartialNonReadonly<T> = {-readonly [P in keyof T]?: T[P]};

class EntryBuilder {
    /** @internal */
    entry: PartialNonReadonly<ObjectEntry | FieldEntry | ListEntry | RecursiveListEntry>;

    constructor(type: "field" | "object" | "list" | "recursive-list") {
        this.entry = {type, isRequired: true};
    }

    /** Rend l'entrée d'entité non-obligatoire. */
    optional() {
        this.entry.isRequired = false;
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

export class FieldEntryBuilder<T = any> extends EntryBuilder {
    /** @internal */
    declare entry: PartialNonReadonly<FieldEntry>;

    constructor(domain: Domain) {
        super("field");
        this.entry.name = "";
        this.entry.domain = domain;
    }
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
    type<NT extends T>(): FieldEntryBuilder<NT> {
        return this;
    }
}

export class ObjectEntryBuilder extends EntryBuilder {
    /** @internal */
    declare entry: PartialNonReadonly<ObjectEntry>;
    constructor(e: Entity) {
        super("object");
        this.entry.entity = entity(e);
    }
}

export class ListEntryBuilder extends EntryBuilder {
    /** @internal */
    declare entry: PartialNonReadonly<ListEntry>;
    constructor(e: Entity) {
        super("list");
        this.entry.entity = entity(e);
    }
}

export class RecursiveListEntryBuilder extends EntryBuilder {
    declare entry: RecursiveListEntry;
    constructor() {
        super("recursive-list");
    }
}
