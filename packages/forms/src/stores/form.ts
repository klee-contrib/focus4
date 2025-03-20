import {isFunction} from "es-toolkit";
import {useEffect, useId, useRef, useState} from "react";

import {
    buildNode,
    EntityToType,
    FormActions,
    FormActionsBuilder,
    FormListNode,
    FormListNodeBuilder,
    FormNode,
    FormNodeBuilder,
    isAnyStoreNode,
    isStoreListNode,
    SourceNodeType,
    StoreListNode,
    StoreNode,
    toFlatValues
} from "@focus4/stores";

/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    node: StoreListNode<E>,
    builder?: (s: FormListNodeBuilder<E, E>) => FormListNodeBuilder<NE, E>,
    initialData?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE, E>;
/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormListNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    node: StoreNode<E>,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
/**
 * Construit un FormListNode à partir d'une définition d'entité.
 * @param entity La définition d'entité, dans un array.
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    entity: [E],
    builder?: (s: FormListNodeBuilder<E, E>) => FormListNodeBuilder<NE, E>,
    initialData?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE, E>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * @param entity La définition d'entité.
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    entity: E,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
export function useFormNode(entityOrNode: any, builder: (x: any) => any = (x: any) => x, initialData: any = undefined) {
    const [node] = useState(() => (isAnyStoreNode(entityOrNode) ? entityOrNode : buildNode(entityOrNode)));
    const [formNode] = useState(() => {
        let fn;
        if (isStoreListNode(node)) {
            fn = builder(new FormListNodeBuilder(node)).build();
            if (initialData) {
                fn.setNodes(isFunction(initialData) ? initialData() : initialData);
            }
        } else {
            fn = builder(new FormNodeBuilder(node)).build();
            if (initialData) {
                fn.set(isFunction(initialData) ? initialData() : initialData);
            }
        }
        fn.form._initialData = toFlatValues(fn, true);
        return fn;
    });
    useEffect(() => formNode.dispose, []);
    return formNode;
}

/**
 * Permet de définir des actions de formulaires pour un noeud de formulaire. Les actions peuvent comprendre un service de chargement et un service de sauvegarde.
 *
 * Le service de chargement sera rappelé automatiquement à chaque fois que les paramètres définis changent.
 *
 * @param formNode FormNode ou FormListNode.
 * @param builder Builder pour les actions de formulaires (permet de définir les paramètres, les services, et d'autres configurations).
 * @param deps Liste de dépendances (React) pour les actions de formulaire. Le builder sera redéfini à tout changement d'une valeur de cette liste, et l'éventuel service de chargement sera rappelé.
 * @returns Objet d'actions de formulaire.
 */
export function useFormActions<
    FN extends FormListNode | FormNode,
    A extends readonly any[] = never,
    C extends SourceNodeType<FN> | void | string | number = never,
    U extends SourceNodeType<FN> | void | string | number = never,
    S extends SourceNodeType<FN> | void | string | number = never
>(node: FN, builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A, C, U, S>, deps: any[] = []) {
    const trackingId = useId();
    const [formActions] = useState(() => new FormActions(node, builder(new FormActionsBuilder()), trackingId));

    const firstRender = useRef(true);
    useEffect(() => {
        const disposer = formActions.register(node.sourceNode, builder(new FormActionsBuilder()));
        if (firstRender.current) {
            formActions.init();
            firstRender.current = false;
        }
        return disposer;
    }, [node, ...deps]);

    return formActions;
}
