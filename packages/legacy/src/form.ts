import {isFunction} from "es-toolkit";
import {disposeOnUnmount} from "mobx-react";
import {Component} from "react";

import {EntityToType} from "@focus4/entities";
import {
    buildNode,
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
 * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de chargement à son démontage. Vous aurez proabablement besoin mettre un `as any` derrière...
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
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de chargement à son démontage. Vous aurez proabablement besoin mettre un `as any` derrière...
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
 * Construit un FormListNode à partir d'une définition d'entité
 * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de chargement à son démontage. Vous aurez proabablement besoin mettre un `as any` derrière...
 * @param entity La définition d'entité, dans un array.
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function makeFormNode<E, NE = E>(
    componentClass: Component | null,
    node: [E],
    builder?: (s: FormListNodeBuilder<E, E>) => FormListNodeBuilder<NE, E>,
    initialData?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE, E>;
/**
 * Construit un FormNode à partir d'une définition d'entité.
 * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de chargement à son démontage. Vous aurez proabablement besoin mettre un `as any` derrière...
 * @param entity La définition d'entité
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function makeFormNode<E, NE = E>(
    componentClass: Component | null,
    node: E,
    builder?: (s: FormNodeBuilder<E, E>) => FormNodeBuilder<NE, E>,
    initialData?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE, E>;
export function makeFormNode(
    componentClass: Component | null,
    entityOrNode: any,
    builder: (x: any) => any = (x: any) => x,
    initialData?: any
): any {
    const node = isAnyStoreNode(entityOrNode) ? entityOrNode : buildNode(entityOrNode);

    let formNode;
    if (isStoreListNode(node)) {
        formNode = builder(new FormListNodeBuilder(node)).build();
        if (initialData) {
            formNode.setNodes(isFunction(initialData) ? initialData() : initialData);
        }
    } else {
        formNode = builder(new FormNodeBuilder(node)).build();
        if (initialData) {
            formNode.set(isFunction(initialData) ? initialData() : initialData);
        }
    }
    formNode.form._initialData = toFlatValues(formNode, true);
    if (componentClass && formNode.dispose) {
        disposeOnUnmount(componentClass, formNode.dispose);
    }
    return formNode;
}

/**
 * Crée les actions d'un formulaire.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param formNode Le FormNode du formulaire.
 * @param builder Le configurateur.
 */
export function makeFormActions<
    FN extends FormListNode | FormNode,
    A extends readonly any[] = never,
    C extends SourceNodeType<FN> | void | string | number = never,
    U extends SourceNodeType<FN> | void | string | number = never,
    S extends SourceNodeType<FN> | void | string | number = never
>(
    componentClass: Component | null,
    formNode: FN,
    builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A, C, U, S>
) {
    const formActions = new FormActions(formNode, builder(new FormActionsBuilder()));
    if (componentClass) {
        disposeOnUnmount(componentClass, formActions.register());
        formActions.init();
    }
    return formActions;
}
