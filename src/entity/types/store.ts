import {IObservableArray} from "mobx";
import {Entity, EntityField, StoreType} from "./entity";

/** Objet ajouté sur un FormNode. */
export interface FormData {
    /** Précise si le formulaire associé est en édition ou non. */
    isEdit: boolean;
    /** Précise si le noeud est valide (FormNode uniquement). */
    readonly isValid: boolean;
}

/** Transforme les propriétés d'un objet JS en leur équivalent dans un StoreNode. */
export type ToNode<T> = {
    readonly [P in keyof T]-?:
        T[P] extends StoreType ? EntityField<T[P]>
        : T[P] extends (infer Q)[] ? StoreListNode<Q>
        : T[P] extends Function ? T[P]
        : StoreNode<T[P]>
};

/** Transforme les propriétés d'un StoreNode en leur équivalent JS. */
export type FromNode<T> =
    T extends StoreListNode<infer Q> ? Q[]
    : T extends StoreNode<infer QQ> ? QQ
    : {
        [P in keyof T]?:
            T[P] extends EntityField<infer R> ? R
            : T[P] extends StoreNode<infer S> ? S
            : T[P] extends StoreListNode<infer U> ? U
            : T[P]
    };

/**
 * Noeud de store simple.
 */
export type StoreNode<T = {}> = ToNode<T> & {
    /** @internal */
    /** isEdit temporaire, traité par `addFormProperties`. */
    $tempEdit?: boolean | (() => boolean);
    /** Vide l'objet (récursivement). */
    clear(): void;
    /** Données liée à un FormNode. */
    readonly form?: FormData;
    /** Renseigne les valeurs du noeud à partir des champs fournis. */
    set(config: Partial<T>): void;
};

/**
 * Noeud de store de liste. C'est un array avec les métadonnées de l'entité du noeud.
 *
 * `StoreListNode` est également considéré comme un `StoreNode`.
 */
export interface StoreListNode<T = {}> extends IObservableArray<StoreNode<T>> {
    /** Métadonnées. */
    readonly $entity: Entity;
    /** @internal */
    /** Précise si le StoreListNode est un FormNode. */
    $isFormNode?: boolean;
    /** @internal */
    /** isEdit temporaire, traité par `addFormProperties`. */
    $tempEdit?: boolean | (() => boolean);
    /** Fonction de transformation du noeud de la liste. */
    $transform?: (source: StoreNode<T>) => {} | void;
    /** Données liée à un FormNode. */
    readonly form?: FormData;
    /** Ajoute un élément à la liste. */
    pushNode(item: T): void;
    /** Reconstruit la liste à partir des données fournies. */
    set(array: T[]): void;
}

export type FormNode<T> = StoreNode<T> & {
    /** Données liée à un FormNode. */
    readonly form: FormData;

    /** @internal */
    /** Précise l'état de la synchronisation entre le StoreNode et le FormNode. */
    isSubscribed: boolean;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    sourceNode: StoreNode<T>;

    /** Active la synchronisation StoreNode -> FormNode. La fonction est appelée à la création. */
    subscribe(): void;

    /** Désactive la synchronisation StoreNode -> FormNode. */
    unsubscribe(): void;
};
