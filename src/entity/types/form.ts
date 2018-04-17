import {IObservableArray} from "mobx";

import {DisplayProps, InputProps, LabelProps} from "../../components";
import {Entity, EntityField, EntityToType, FieldEntry, StoreType} from "./entity";
import {BaseStoreNode, NodeToType, StoreListNode, StoreNode} from "./store";

/** Objet ajouté sur un FormNode. */
export interface FormData {

    /** Précise si le formulaire associé est en édition ou non. */
    isEdit: boolean;

    /** Précise si le noeud est valide (FormNode uniquement). */
    readonly isValid: boolean;
}

/** Transforme les nodes et fields d'un noeud en leur équivalent dans un formulaire. */
export type NodeToForm<T extends Entity, U = {}> = {
    [P in keyof (StoreNode<T> & U)]:
        (StoreNode<T> & U)[P] extends StoreNode<infer V> ? FormNode<V>
        : (StoreNode<T> & U)[P] extends StoreListNode<infer W, infer X> ? FormListNode<W, X>
        : (StoreNode<T> & U)[P] extends EntityField<infer F> ? FormEntityField<F>
        : (StoreNode<T> & U)[P]
};

/** Champs additionnels pour un noeud de formulaire. */
export type FormNode<T extends Entity = any, U = {}> = NodeToForm<T, U> & {

    /** Données liée à un FormNode. */
    readonly form: FormData;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    readonly sourceNode: StoreNode<T>;
};

export interface FormListNode<T extends Entity = any, U = {}> extends IObservableArray<FormNode<T, U>>, BaseStoreNode<(EntityToType<T> & NodeToType<U>)[]> {

    /** Métadonnées. */
    readonly $entity: T;

    /** Données liée à un FormNode. */
    readonly form: FormData;

    /** Fonction de transformation du noeud de la liste. */
    $transform?: (source: StoreNode<T>) => U | void;

    /** Ajoute un élément à la liste. */
    pushNode(item: EntityToType<T> & NodeToType<U>): void;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    readonly sourceNode: StoreListNode<T>;
}

/** Définition de champ dans un FormNode. */
export interface FormEntityField<F extends FieldEntry = FieldEntry<StoreType, InputProps, DisplayProps, LabelProps>> extends EntityField<F> {

    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error: string | undefined;

    /** Précise si le champ associé est en édition ou non. */
    isEdit: boolean;
}
