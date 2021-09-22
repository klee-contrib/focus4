import {isFunction} from "lodash";
import {disposeOnUnmount} from "mobx-react";
import {Component, useEffect, useState} from "react";

import {
    EntityToType,
    FormActions,
    FormActionsBuilder,
    FormListNode,
    FormListNodeBuilder,
    FormNode,
    FormNodeBuilder,
    isStoreListNode,
    StoreListNode,
    StoreNode,
    toFlatValues
} from "@focus4/stores";

/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function makeFormNode<E, NE = E>(
    componentClass: Component | null,
    node: StoreNode<E>,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function makeFormNode<E, NE = E>(
    componentClass: Component | null,
    node: StoreListNode<E>,
    builder?: (s: FormListNodeBuilder<E, E>) => FormListNodeBuilder<NE, E>,
    initialData?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE, E>;
export function makeFormNode(
    componentClass: Component | null,
    node: StoreNode | StoreListNode,
    builder: Function = (x: any) => x,
    initialData?: any
): any {
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
    return withDisposer(fn, componentClass);
}

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
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE = E>(
    node: StoreNode<E>,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
export function useFormNode(
    node: StoreNode | StoreListNode,
    builder: (x: any) => any = (x: any) => x,
    initialData: any = undefined
) {
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
 * Crée les actions d'un formulaire.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param formNode Le FormNode du formulaire.
 * @param builder Le configurateur.
 */
export function makeFormActions<
    FN extends FormNode | FormListNode,
    A extends ReadonlyArray<any> = never,
    S extends string = never
>(
    componentClass: Component | null,
    formNode: FN,
    builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A, S>
): FormActions<S> {
    const formActions = builder(new FormActionsBuilder(formNode)).build();
    return withDisposer(formActions, componentClass);
}

/**
 * Crée les actions d'un formulaire.
 * @param formNode Le FormNode du formulaire.
 * @param builder Le configurateur.
 */
export function useFormActions<
    FN extends FormNode | FormListNode,
    A extends ReadonlyArray<any> = never,
    S extends string = never
>(node: FN, builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A, S>) {
    const [formActions] = useState(() => builder(new FormActionsBuilder(node)).build());
    useEffect(() => formActions.dispose, []);
    return formActions;
}

function withDisposer(formNode: any, componentClass: Component | null) {
    if (componentClass && formNode.dispose) {
        disposeOnUnmount(componentClass, formNode.dispose);
    }
    return formNode;
}
