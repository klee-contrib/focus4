import {IObservableArray} from "mobx";

import {EntityToType, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "@focus4/entities";

/** Génère les entrées de noeud de store équivalent à une entité. */
export type EntityToNode<E> = {
    readonly [P in keyof E]: E[P] extends FieldEntry
        ? EntityField<E[P]>
        : E[P] extends ObjectEntry<infer OE>
          ? StoreNode<OE>
          : E[P] extends ListEntry<infer LE>
            ? StoreListNode<LE>
            : E[P] extends RecursiveListEntry
              ? StoreListNode<E>
              : never;
};

/** Noeud de store simple. */
export type StoreNode<E = any> = EntityToNode<E> & {
    /** @internal */
    /** IsEdit temporaire, traité par `nodeToFormNode`. */
    $edit?: boolean | (() => boolean);

    /** @internal */
    /** Permet d'indiquer temporairement qu'il s'agit d'un FormNode en création, traité par `nodeToFormNode`. */
    $form?: true;

    /** @internal */
    /** IsRequired temporaire, traité par `nodeToFormNode`. */
    $required?: boolean | (() => boolean);

    /** Vide l'objet (récursivement). */
    clear(): StoreNode<E>;

    /** Appelle le service de chargement enregistré. */
    load(): Promise<void>;

    /** Remplace le contenu du noeud par le contenu donné. */
    replace(data: EntityToType<E>): StoreNode<E>;

    /** Met à jour les champs donnés dans le noeud. */
    set(data: EntityToType<E>): StoreNode<E>;
};

/** Noeud de store liste. C'est une liste de noeud de store simple. */
export interface StoreListNode<E = any> extends IObservableArray<StoreNode<E>> {
    /** @internal */
    /** IsEdit temporaire, traité par `nodeToFormNode`. */
    $edit?: boolean | (() => boolean);

    /** @internal */
    /** Permet d'indiquer temporairement qu'il s'agit d'un FormNode en création, traité par `nodeToFormNode`. */
    $form?: true;

    /** @internal */
    /** IsRequired temporaire, traité par `nodeToFormNode`. */
    $required?: boolean | (() => boolean);

    /** Métadonnées. */
    readonly $entity: E;

    /** Fonction de modification d'un objet, appelé à la création. */
    /** @internal */
    $nodeBuilder?: <NE>(source: StoreNode<E>) => StoreNode<NE>;

    /** Appelle le service de chargement enregistré. */
    load(): Promise<void>;

    /** Ajoute un élément à la liste. */
    pushNode(...items: EntityToType<E>[]): number;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    replaceNodes(data: EntityToType<E>[]): StoreListNode<E>;

    /** Met à jour le noeud de liste à partir de la liste fournie. */
    setNodes(data: EntityToType<E>[]): StoreListNode<E>;
}

/** Définition de champ dans un store. */
export interface EntityField<F extends FieldEntry = FieldEntry> {
    /** Métadonnées. */
    readonly $field: F;

    /** Valeur. */
    value: F["fieldType"];
}
