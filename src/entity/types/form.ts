import {DisplayProps, InputProps, LabelProps} from "../../components";

import {EntityField, FieldEntry, StoreType} from "./entity";
import {BaseStoreNode} from "./store";

/** Objet ajouté sur un FormNode. */
export interface FormData {
    /** Précise si le formulaire associé est en édition ou non. */
    isEdit: boolean;
    /** Précise si le noeud est valide (FormNode uniquement). */
    readonly isValid: boolean;
}

/** Transforme les nodes et fields d'un noeud en leur équivalent dans un formulaire. */
export type NodeToForm<T extends BaseStoreNode | EntityField> = {
    [P in keyof T]:
        T[P] extends BaseStoreNode ? FormNode<T[P]>
        : T[P] extends EntityField<infer F> ? FormEntityField<F>
        : T[P]
};

/** Champs additionnels pour un noeud de formulaire. */
export type FormNode<T extends BaseStoreNode = any> = NodeToForm<T> & {
    /** Données liée à un FormNode. */
    readonly form: FormData;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    sourceNode: T;

    /** Désactive la synchronisation StoreNode -> FormNode. */
    stopSync(): void;
};

/** Définition de champ dans un FormNode. */
export interface FormEntityField<F extends FieldEntry = FieldEntry<StoreType, InputProps, DisplayProps, LabelProps>> extends EntityField<F> {

    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error: string | undefined;

    /** Précise si le champ associé est en édition ou non. */
    isEdit: boolean;
}
