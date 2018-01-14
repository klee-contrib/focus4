import {IObservableArray} from "mobx";
import {Entity} from "./entity";

/** Fonction `set`. */
export interface Setter<T> {
    /** Renseigne les valeurs du noeud à partir des champs fournis. */
    set(config: Partial<T>): void;
}

/** Fonction `clear`. */
export interface Clearer {
    /** Vide l'objet (récursivement). */
    clear(): void;
}

/**
 * Noeud de store simple, identifié par la présence des méthodes `set` et `clear`.
 *
 * En pratique, tous les autres éléments d'un `StoreNode` doivent être des `EntityValue`.
 */
export interface StoreNode<T = {}> extends Setter<T>, Clearer {}

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
    /** Ajoute un élément à la liste. */
    pushNode(item: {}): void;
    /** Reconstruit la liste à partir des données fournies. */
    set(array: {}[]): void;
}
