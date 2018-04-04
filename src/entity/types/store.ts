import {IObservableArray} from "mobx";
import {Entity, EntityField, EntityToType, FieldEntry, ListEntry, ObjectEntry} from "./entity";

/** Interface commune aux noeuds de store. */
export interface BaseStoreNode<T = any> {
    /** @internal */
    /** isEdit temporaire, traité par `addFormProperties`. */
    $tempEdit?: boolean | (() => boolean);
    /** Données liée à un FormNode. */
    readonly form?: FormData;
    /** Renseigne les valeurs du noeud à partir des champs fournis. */
    set(config: T): void;
}

/** Génère les entrées de noeud de store équivalent à une entité. */
export type EntityToNode<T extends Entity> = {
    [P in keyof T["fields"]]:
        T["fields"][P] extends FieldEntry ? EntityField<T["fields"][P]>
        : T["fields"][P] extends ObjectEntry<infer U> ? StoreNode<U>
        : T["fields"][P] extends ListEntry<infer U> ? StoreListNode<U>
        : never
};

/** Génère l'objet JS "normal" équivalent à un noeud de store. */
export type NodeToType<T> =
    T extends StoreListNode<infer U> ? EntityToType<U>[]
    : T extends StoreNode<infer U> ? EntityToType<U>
    : {
        [P in keyof T]?:
            T[P] extends EntityField<infer V> ? V["fieldType"]
            : T[P] extends StoreNode<infer V> ? EntityToType<V>
            : T[P] extends StoreListNode<infer V> ? EntityToType<V>[]
            : T[P]
    };

/** Noeud de store simple. */
export type StoreNode<T extends Entity = any> = EntityToNode<T> & BaseStoreNode<EntityToType<T>> & {
    /** Vide l'objet (récursivement). */
    clear(): void;
};

/** Noeud de store liste. C'est une liste de noeud de store simple. */
export interface StoreListNode<T extends Entity = any, U = {}> extends IObservableArray<StoreNode<T> & U>, BaseStoreNode<(EntityToType<T> & NodeToType<U>)[]> {
    /** Métadonnées. */
    readonly $entity: T;
    /** @internal */
    /** Précise si le StoreListNode est un FormNode. */
    $isFormNode?: boolean;
    /** @internal */
    /** Fonction de transformation du noeud de la liste. */
    $transform?: (source: StoreNode<T>) => {} | void;
    /** Ajoute un élément à la liste. */
    pushNode(item: EntityToType<T> & NodeToType<U>): void;
}

/** Objet ajouté sur un FormNode. */
export interface FormData {
    /** Précise si le formulaire associé est en édition ou non. */
    isEdit: boolean;
    /** Précise si le noeud est valide (FormNode uniquement). */
    readonly isValid: boolean;
}

/** Champs additionnels pour un noeud de formulaire. */
export interface FormNode<T extends BaseStoreNode = any> {
    /** Données liée à un FormNode. */
    readonly form: FormData;

    /** @internal */
    /** Précise l'état de la synchronisation entre le StoreNode et le FormNode. */
    isSubscribed: boolean;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    sourceNode: T;

    /** Active la synchronisation StoreNode -> FormNode. La fonction est appelée à la création. */
    subscribe(): void;

    /** Désactive la synchronisation StoreNode -> FormNode. */
    unsubscribe(): void;
}
