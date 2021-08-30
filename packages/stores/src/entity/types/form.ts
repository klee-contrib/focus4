import {IObservableArray, Lambda} from "mobx";

import {EntityField, EntityToType, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "./entity";
import {StoreListNode, StoreNode} from "./store";

/** Génère les entrées de noeud de formulaire équivalent à une entité. */
export type EntityToForm<E> = {
    readonly [P in keyof E]: E[P] extends FieldEntry
        ? FormEntityField<E[P]>
        : E[P] extends ObjectEntry<infer OE>
        ? FormNode<OE>
        : E[P] extends ListEntry<infer LE>
        ? FormListNode<LE>
        : E[P] extends RecursiveListEntry
        ? FormListNode<E>
        : never;
};

/** Champs additionnels pour un noeud de formulaire. */
export type FormNode<E = any, E0 = E> = EntityToForm<E> & {
    /** Données liée à un FormNode. */
    readonly form: {
        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est valide (FormNode uniquement). */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: {};
    };

    /** Vide l'objet (récursivement). */
    clear(): FormNode<E, E0>;

    /** Désactive la synchronisation entre ce FormNode et son noeud source. */
    dispose(): void;

    /** Appelle le service de chargement enregistré du noeud source. */
    load(): Promise<void>;

    /** Remplace le contenu du noeud par le contenu donné. */
    replace(data: EntityToType<E>): FormNode<E, E0>;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): FormNode<E, E0>;

    /** Met à jour les champs donnés dans le noeud. */
    set(data: EntityToType<E>): FormNode<E, E0>;

    /** StoreNode original. */
    readonly sourceNode: StoreNode<E0>;
};

export interface FormListNode<E = any, E0 = E> extends IObservableArray<FormNode<E, E0>> {
    /** Métadonnées. */
    readonly $entity: E;

    /** Données liée à un FormNode. */
    readonly form: {
        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est valide (FormNode uniquement). */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: {}[];
    };

    /** Fonction de modification d'un objet, appelé à la création. */
    /** @internal */
    $nodeBuilder?: <NE>(source: StoreNode<E>) => StoreNode<NE>;

    /** @internal */
    /** Dispose l'observer qui suit l'ajout et la suppression d'élement dans la liste source. */
    _dispose: Lambda;

    /** Désactive la synchronisation entre ce FormNode et son noeud source. */
    dispose(): void;

    /** Appelle le service de chargement enregistré du noeud source. */
    load(): Promise<void>;

    /** Ajoute un élément à la liste. */
    pushNode(...items: EntityToType<E>[]): number;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    replaceNodes(data: EntityToType<E>[]): FormListNode<E, E0>;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): FormListNode<E, E0>;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    setNodes(data: EntityToType<E>[]): FormListNode<E, E0>;

    /** StoreNode original. */
    readonly sourceNode: StoreListNode<E0>;
}

/** Définition de champ dans un FormNode. */
export interface FormEntityField<F extends FieldEntry = FieldEntry> extends EntityField<F> {
    /** @internal */
    /** Dispose l'interceptor qui met à jour le champ de formulaire si le champ source est modifié. */
    _dispose?: Lambda;

    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error: string | undefined;

    /** Précise si le champ associé est en édition ou non. */
    isEdit: boolean;

    /** Précise si le champ associé est valide (pas d'erreur ou pas en édition). */
    readonly isValid: boolean;
}
