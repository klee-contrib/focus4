import {IObservableArray} from "mobx";

import {Entity, EntityField, EntityToType, FieldEntry} from "./entity";
import {NodeToType, StoreListNode, StoreNode} from "./store";

/** Transforme les nodes et fields d'un noeud en leur équivalent dans un formulaire. */
export type NodeToForm<T extends Entity, U = {}> = {
    readonly [P in keyof (StoreNode<T> & U)]: (StoreNode<T> & U)[P] extends StoreNode<infer V>
        ? FormNode<V>
        : (StoreNode<T> & U)[P] extends StoreListNode<infer W, infer X>
        ? FormListNode<W, X>
        : (StoreNode<T> & U)[P] extends EntityField<infer F>
        ? FormEntityField<F>
        : (StoreNode<T> & U)[P]
};

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/** Récupère le type décrivant les erreurs possible d'un noeud de formulaire quelconque. */
export type NodeToErrors<T extends Entity, U = {}> = Omit<
    {
        readonly [P in keyof (StoreNode<T> & U)]?: (StoreNode<T> & U)[P] extends StoreNode<infer V>
            ? NodeToErrors<V>
            : (StoreNode<T> & U)[P] extends StoreListNode<infer W, infer X>
            ? NodeToErrors<W, X>[]
            : (StoreNode<T> & U)[P] extends EntityField
            ? string
            : never
    },
    {
        [P in keyof (StoreNode<T> & U)]: (StoreNode<T> & U)[P] extends StoreNode | StoreListNode | EntityField
            ? never
            : P
    }[keyof (StoreNode<T> & U)]
>;

/** Champs additionnels pour un noeud de formulaire. */
export type FormNode<T extends Entity = any, U = {}> = NodeToForm<T, U> & {
    /** Données liée à un FormNode. */
    readonly form: {
        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est valide (FormNode uniquement). */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: NodeToErrors<T, U>;
    };

    /** Remplace le contenu du noeud par le contenu donné. */
    replace(data: EntityToType<T>): void;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    readonly sourceNode: StoreNode<T>;
};

export interface FormListNode<T extends Entity = any, U = {}> extends IObservableArray<FormNode<T, U>> {
    /** Métadonnées. */
    readonly $entity: T;

    /** Données liée à un FormNode. */
    readonly form: {
        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est valide (FormNode uniquement). */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: NodeToErrors<T, U>[];
    };

    /** Fonction de transformation du noeud de la liste. */
    $transform?: (source: StoreNode<T>) => U | void;

    /** Ajoute un élément à la liste. */
    pushNode(...items: EntityToType<T>[]): void;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    replaceNodes(data: (EntityToType<T> & NodeToType<U>)[]): void;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    setNodes(data: (EntityToType<T> & NodeToType<U>)[]): void;

    /** StoreNode original. */
    readonly sourceNode: StoreListNode<T>;
}

/** Définition de champ dans un FormNode. */
export interface FormEntityField<F extends FieldEntry = FieldEntry> extends EntityField<F> {
    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error: string | undefined;

    /** Précise si le champ associé est en édition ou non. */
    isEdit: boolean;

    /** Précise si le champ associé est valide (pas d'erreur ou pas en édition). */
    readonly isValid: boolean;
}
