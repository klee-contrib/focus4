import {IObservableArray} from "mobx";
import {Entity} from "./entity";

/** Objet ajouté sur un FormNode. */
export interface FormData {
    /** Précise si le formulaire associé est en édition ou non. */
    isEdit: boolean;
    /** Précise si le noeud est valide (FormNode uniquement). */
    readonly isValid: boolean;
}

/**
 * Noeud de store simple, identifié par la présence des méthodes `set` et `clear`.
 *
 * En pratique, tous les autres éléments d'un `StoreNode` doivent être des `EntityValue`.
 */
export interface StoreNode<T = {}> {
    /** Vide l'objet (récursivement). */
    clear(): void;
    /** Données liée à un FormNode. */
    readonly form?: FormData;
    /** Renseigne les valeurs du noeud à partir des champs fournis. */
    set(config: Partial<T>): void;
}

/**
 * Noeud de store de liste. C'est un array avec les métadonnées de l'entité du noeud.
 *
 * `T` doit être un `StoreNode` et `StoreListNode` est également considéré comme un `StoreNode`.
 */
export interface StoreListNode<T extends StoreNode = StoreNode> extends IObservableArray<T> {
    /** Métadonnées. */
    readonly $entity: Entity;
    /** @internal */
    /** Précise si le StoreListNode est un FormNode. */
    $isFormNode?: boolean;
    /** Fonction de transformation du noeud de la liste. */
    $transform?: (source: T) => {} | void;
    /** Données liée à un FormNode. */
    readonly form?: FormData;
    /** Ajoute un élément à la liste. */
    pushNode(item: {}): void;
    /** Reconstruit la liste à partir des données fournies. */
    set(array: {}[]): void;
}

export interface FormNode<T = StoreNode> {
    /** Données liée à un FormNode. */
    readonly form: FormNode;

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
