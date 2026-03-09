import {IObservableArray, Lambda} from "mobx";

import {Entity, EntityToType, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "@focus4/entities";

import {EntityField, StoreListNode, StoreNode} from "./store";

type SourceNode<P, T, E0> = P extends keyof E0
    ? E0[P] extends ObjectEntry<infer OE0>
        ? OE0
        : E0[P] extends Entity
          ? E0[P]
          : T
    : T;

type SourceListNode<P, T, E0> = P extends keyof E0
    ? E0[P] extends ListEntry<infer OE0>
        ? OE0
        : E0[P] extends [Entity]
          ? E0[P][0]
          : T
    : T;

/** Génère les entrées de noeud de formulaire équivalent à une entité. */
export type EntityToForm<E extends Entity, E0 extends Entity = E> = {
    readonly [P in keyof E]: E[P] extends FieldEntry
        ? FormEntityField<E[P]>
        : E[P] extends ObjectEntry<infer OE>
          ? FormNode<OE, SourceNode<P, OE, E0>>
          : E[P] extends ListEntry<infer LE>
            ? FormListNode<LE, SourceListNode<P, LE, E0>>
            : E[P] extends RecursiveListEntry
              ? FormListNode<E, E0>
              : E[P] extends [Entity]
                ? FormListNode<E[P][0], SourceListNode<P, E[P][0], E0>>
                : E[P] extends Entity
                  ? FormNode<E[P], SourceNode<P, E[P], E0>>
                  : never;
};

/** Champs additionnels pour un noeud de formulaire. */
export type FormNode<E extends Entity = any, E0 extends Entity = E> = EntityToForm<E, E0> & {
    /** Données liée à un FormNode. */
    readonly form: {
        /** @internal */
        /** Détermine si le noeud a été ajouté dans le formulaire. */
        readonly _added?: boolean;

        /** @internal */
        /** Détermine si le noeud a été ajouté dans un noeud de formulaire liste. */
        readonly _addedListItem?: boolean;

        /** @internal */
        /** Données initiales du formulaire. */
        _initialData?: EntityToType<E>;

        /** Précise si le noeud a fait l'objet d'une modification par rapport au noeud source. */
        readonly hasChanged: boolean;

        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est vide. */
        readonly isEmpty: boolean;

        /** Précise si le noeud est obligatoire. */
        readonly isRequired: boolean;

        /** Précise si le noeud est valide. */
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

export interface FormListNode<E extends Entity = any, E0 extends Entity = E> extends IObservableArray<FormNode<E, E0>> {
    /** Métadonnées. */
    readonly $entity: E;

    /** Données liée à un FormNode. */
    readonly form: {
        /** @internal */
        /** Détermine si le noeud a été ajouté dans le formulaire. */
        _added?: boolean;

        /** @internal */
        /** Détermine si le noeud a été ajouté dans un noeud de formulaire liste. */
        readonly _addedListItem?: boolean;

        /** @internal */
        /** Données initiales du formulaire. */
        _initialData?: EntityToType<E>[];

        /** Précise si le noeud a fait l'objet d'une modification par rapport au noeud source. */
        readonly hasChanged: boolean;

        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est vide. */
        readonly isEmpty: boolean;

        /** Précise si le noeud est obligatoire. */
        readonly isRequired: boolean;

        /** Précise si le noeud est valide. */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: {}[];
    };

    /** Fonction de modification d'un objet, appelé à la création. */
    /** @internal */
    $nodeBuilder?: <NE extends Entity>(source: StoreNode<E>) => StoreNode<NE>;

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

    /** @internal */
    /** Détermine si le champ a été ajouté dans le formulaire. */
    _added?: boolean;

    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error: string | undefined;

    /** Précise si le chhamp a fait l'objet d'une modification par rapport au noeud source. */
    readonly hasChanged: boolean;

    /** Précise si le champ associé est en édition ou non. */
    isEdit: boolean;

    /** Précise si le champ associé est valide (pas d'erreur ou pas en édition). */
    readonly isValid: boolean;
}
