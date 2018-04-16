import {IObservableArray} from "mobx";
import {Entity, EntityField, EntityToType, FieldEntry, ListEntry, ObjectEntry} from "./entity";

/** Interface commune aux noeuds de store. */
export interface BaseStoreNode<T = any> {
    /** @internal */
    /** isEdit temporaire, traité par `addFormProperties`. */
    $tempEdit?: boolean | (() => boolean);
    /** Renseigne les valeurs du noeud à partir des champs fournis. */
    set(config: T): void;
}

/** Génère les entrées de noeud de store équivalent à une entité. */
export type EntityToNode<T extends Entity> = {
    [P in keyof T["fields"]]:
        T["fields"][P] extends FieldEntry ? EntityField<T["fields"][P]>
        : T["fields"][P] extends ObjectEntry<infer U> ? StoreNode<U>
        : T["fields"][P] extends ListEntry<infer V> ? StoreListNode<V>
        : never
};

/** Génère l'objet JS "normal" équivalent à un noeud de store. */
export type NodeToType<T> =
    T extends StoreListNode<infer U> ? EntityToType<U>[]
    : T extends StoreNode<infer V> ? EntityToType<V>
    : {
        [P in keyof T]?:
            T[P] extends EntityField<infer W> ? W["fieldType"]
            : T[P] extends StoreNode<infer X> ? EntityToType<X>
            : T[P] extends StoreListNode<infer Y> ? EntityToType<Y>[]
            : T[P]
    };

/** Noeud de store simple. */
export type StoreNode<T extends Entity = any> = EntityToNode<T> & BaseStoreNode<EntityToType<T>> & {
    /** Vide l'objet (récursivement). */
    clear(): void;
};

/** Noeud de store liste. C'est une liste de noeud de store simple. */
export interface StoreListNode<T extends Entity = any, U = any> extends IObservableArray<StoreNode<T> & U>, BaseStoreNode<(EntityToType<T> & NodeToType<U>)[]> {
    /** Métadonnées. */
    readonly $entity: T;
    /** @internal */
    /** Précise si le StoreListNode est un FormNode. */
    $isFormNode?: boolean;
    /** Fonction de transformation du noeud de la liste. */
    $transform?: (source: StoreNode<T>) => U | void;
    /** Ajoute un élément à la liste. */
    pushNode(item: EntityToType<T> & NodeToType<U>): void;
}
