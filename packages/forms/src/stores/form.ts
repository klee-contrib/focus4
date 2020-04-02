import {isFunction} from "lodash";
import {disposeOnUnmount} from "mobx-react";
import {useEffect, useState} from "react";

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
    StoreNode
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
    componentClass: React.Component | null,
    node: StoreNode<E>,
    builder: (s: FormNodeBuilder<E>) => FormNodeBuilder<NE>,
    initialData?: EntityToType<NE> | (() => EntityToType<NE>)
): FormNode<NE>;
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
    componentClass: React.Component | null,
    node: StoreListNode<E>,
    builder: (s: FormListNodeBuilder<E>) => FormListNodeBuilder<NE>,
    initialData?: EntityToType<NE>[] | (() => EntityToType<NE>[])
): FormListNode<NE>;
export function makeFormNode(
    componentClass: React.Component | null,
    node: StoreNode | StoreListNode,
    builder: Function = (x: any) => x,
    initialData?: any
): any {
    let formNode;
    if (isStoreListNode(node)) {
        formNode = builder(new FormListNodeBuilder(node)).build();
        if (initialData) {
            formNode.replaceNodes(isFunction(initialData) ? initialData() : initialData);
        }
    } else {
        formNode = builder(new FormNodeBuilder(node)).build();
        if (initialData) {
            formNode.replace(isFunction(initialData) ? initialData() : initialData);
        }
    }
    return withDisposer(formNode, componentClass);
}

/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE>(
    node: StoreListNode<E>,
    builder: (s: FormListNodeBuilder<E>) => FormListNodeBuilder<NE>,
    initialData?: EntityToType<NE>[] | (() => EntityToType<NE>[])
): FormListNode<NE>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 * @param initialData Les données initiales du formulaire
 */
export function useFormNode<E, NE>(
    node: StoreNode<E>,
    builder: (s: FormNodeBuilder<E>) => FormNodeBuilder<NE>,
    initialData?: EntityToType<NE> | (() => EntityToType<NE>)
): FormNode<NE>;
export function useFormNode(node: StoreNode | StoreListNode, builder: Function = (x: any) => x, initialData: any) {
    const [formNode] = isStoreListNode(node)
        ? useState(() => {
              const fn = builder(new FormListNodeBuilder(node)).build();
              if (initialData) {
                  fn.replaceNodes(isFunction(initialData) ? initialData() : initialData);
              }
              return fn;
          })
        : useState(() => {
              const fn = builder(new FormNodeBuilder(node)).build();
              if (initialData) {
                  fn.replace(isFunction(initialData) ? initialData() : initialData);
              }
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
    componentClass: React.Component | null,
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

function withDisposer(formNode: any, componentClass: React.Component | null) {
    if (componentClass && formNode.dispose) {
        disposeOnUnmount(componentClass, formNode.dispose);
    }
    return formNode;
}
