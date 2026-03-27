import {Entity, FieldEntry, ListEntry, ObjectEntry} from "@focus4/entities";

import {makeStoreNode} from "../../store";

import {EntityFieldBuilder} from "./entity-field";
import {FormListNodeBuilder} from "./form-list-node";
import {FormNodeBuilder} from "./form-node";

export class FormEntryBuilder {
    /** @internal */
    name: string;

    /** @internal */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Crée un champ avec le domaine demandé.
     * @param domain Le domaine.
     */
    domain<D extends Domain>(domain: D): EntityFieldBuilder<FieldEntry<D>> {
        return new EntityFieldBuilder<FieldEntry<D>>(this.name).domain(domain);
    }

    /**
     * Crée un champ à partir de la définition de champ donnée.
     * @param field La définition du champ.
     */
    field<F extends FieldEntry>({domain, name: _, ...metadata}: F) {
        return new EntityFieldBuilder<F>(this.name).domain(domain).metadata(metadata);
    }

    /**
     * Crée un sous-noeud de l'entité demandée.
     * @param entity La définition d'entité.
     */
    object<E extends Entity>(entity: E): FormNodeBuilder<E>;
    /**
     * Crée un sous-noeud de l'entité demandée.
     * @param entry La définition d'entrée objet.
     */
    object<E extends Entity>(entry: ObjectEntry<E>): FormNodeBuilder<E>;
    object<E extends Entity>(entity: E | ObjectEntry<E>) {
        const builder =
            "type" in entity && entity.type === "object"
                ? new FormNodeBuilder(makeStoreNode(entity.entity as E)).required(
                      (entity.isRequired as boolean) ?? true
                  )
                : new FormNodeBuilder(makeStoreNode(entity as E));
        builder.node.$added = true;
        return builder;
    }

    /**
     * Crée un sous-noeud liste de l'entité demandée.
     * @param entity La définition d'entitée.
     */
    list<E extends Entity>(entity: E): FormListNodeBuilder<E>;
    /**
     * Crée un sous-noeud liste de l'entité demandée.
     * @param entry La définition d'entrée liste.
     */
    list<E extends Entity>(entry: ListEntry<E>): FormListNodeBuilder<E>;
    list<E extends Entity>(entity: E | ListEntry<E>) {
        const builder =
            "type" in entity && entity.type === "list"
                ? new FormListNodeBuilder(makeStoreNode([entity.entity as E])).required(
                      (entity.isRequired as boolean) ?? true
                  )
                : new FormListNodeBuilder(makeStoreNode([entity as E]));
        builder.node.$added = true;
        return builder;
    }
}
