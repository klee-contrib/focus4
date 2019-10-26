import {IObservableArray, Lambda} from "mobx";

import {Entity, EntityField, EntityToType, FieldEntry} from "./entity";
import {NodeToType, StoreListNode, StoreNode} from "./store";

/** Transforme les nodes et fields d'un noeud en leur équivalent dans un formulaire. */
export type NodeToForm<E extends Entity, A = {}> = {
    readonly [P in keyof (StoreNode<E> & A)]: (StoreNode<E> & A)[P] extends StoreNode<infer OE>
        ? FormNode<OE>
        : (StoreNode<E> & A)[P] extends StoreListNode<infer LE, infer LA>
        ? FormListNode<LE, LA>
        : (StoreNode<E> & A)[P] extends EntityField<infer F>
        ? FormEntityField<F>
        : (StoreNode<E> & A)[P];
};

/** Récupère le type décrivant les erreurs possible d'un noeud de formulaire quelconque. */
export type NodeToErrors<E extends Entity, A = {}> = Omit<
    {
        readonly [P in keyof (FormNode<E> & A)]?: (FormNode<E> & A)[P] extends FormNode<infer OE>
            ? NodeToErrors<OE>
            : (FormNode<E> & A)[P] extends FormListNode<infer LE, infer LA>
            ? NodeToErrors<LE, LA>[]
            : (FormNode<E> & A)[P] extends FormEntityField
            ? string
            : never;
    },
    {
        [P in keyof (FormNode<E> & A)]: (FormNode<E> & A)[P] extends FormNode | FormListNode | FormEntityField
            ? never
            : P;
    }[keyof (FormNode<E> & A)]
>;

/** Champs additionnels pour un noeud de formulaire. */
export type FormNode<E extends Entity = any, A = {}> = NodeToForm<E, A> & {
    /** Données liée à un FormNode. */
    readonly form: {
        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est valide (FormNode uniquement). */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: NodeToErrors<E, A>;
    };

    /** Vide l'objet (récursivement). */
    clear(): FormNode<E, A>;

    /** Désactive la synchronisation entre ce FormNode et son noeud source. */
    dispose(): void;

    /** Remplace le contenu du noeud par le contenu donné. */
    replace(data: EntityToType<E>): FormNode<E, A>;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): FormNode<E, A>;

    /** Met à jour les champs donnés dans le noeud. */
    set(data: EntityToType<E>): FormNode<E, A>;

    /** StoreNode original. */
    readonly sourceNode: StoreNode<E>;
};

export interface FormListNode<E extends Entity = any, A = {}> extends IObservableArray<FormNode<E, A>> {
    /** Métadonnées. */
    readonly $entity: E;

    /** Données liée à un FormNode. */
    readonly form: {
        /** Précise si le formulaire associé est en édition ou non. */
        isEdit: boolean;

        /** Précise si le noeud est valide (FormNode uniquement). */
        readonly isValid: boolean;

        /** Les erreurs des champs du noeud. */
        readonly errors: NodeToErrors<E, A>[];
    };

    /** Fonction d'initialisation pour les items d'un noeud de formulaire créé à partir de ce noeud liste. */
    /** @decprecated Utiliser makeFormNode(node).items() à la place. */
    $initializer?: (source: StoreNode<E>) => A | void;

    /** Fonction de modification d'un objet, appelé à la création. */
    /** @internal */
    $nodeBuilder?: <NE extends Entity>(source: StoreNode<E>) => StoreNode<NE>;

    /** @internal */
    /** Dispose l'observer qui suit l'ajout et la suppression d'élement dans la liste source. */
    _dispose: Lambda;

    /** Désactive la synchronisation entre ce FormNode et son noeud source. */
    dispose(): void;

    /** Ajoute un élément à la liste. */
    pushNode(...items: EntityToType<E>[]): number;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    replaceNodes(data: (EntityToType<E> & NodeToType<A>)[]): FormListNode<E, A>;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** Reconstruit le noeud de liste à partir de la liste fournie. */
    setNodes(data: (EntityToType<E> & NodeToType<A>)[]): FormListNode<E, A>;

    /** StoreNode original. */
    readonly sourceNode: StoreListNode<E>;
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
