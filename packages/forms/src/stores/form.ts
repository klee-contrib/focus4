import {isFunction} from "lodash";
import {disposeOnUnmount} from "mobx-react";
import {useEffect, useState} from "react";

import {
    Entity,
    EntityToType,
    FormActions,
    FormActionsBuilder,
    FormListNode,
    FormListNodeBuilder,
    FormNode,
    FormNodeBuilder,
    FormNodeOptions,
    isStoreListNode,
    makeFormActionsCore,
    makeFormNodeCore,
    NodeToType,
    StoreListNode,
    StoreNode
} from "@focus4/stores";
import {ActionConfig, ActionConfigMultiple, FormConfig} from "@focus4/stores/lib/entity/form/actions-legacy";

/** @deprecated Utiliser `makeFormNode(this, node, builder)` à la place. */
export function makeFormNode<E extends Entity, U = {}>(
    componentClass: React.Component | null,
    node: StoreListNode<E>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<E>) => U
): FormListNode<E, U>;
/** @deprecated Utiliser `makeFormNode(this, node, builder)` à la place. */
export function makeFormNode<E extends Entity, U = {}>(
    componentClass: React.Component | null,
    node: StoreNode<E>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<E>) => U
): FormNode<E, U>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param node Le noeud de base
 * @param builder Le configurateur.
 */
export function makeFormNode<E extends Entity, NE extends Entity>(
    componentClass: React.Component | null,
    node: StoreNode<E>,
    builder: (s: FormNodeBuilder<E>) => FormNodeBuilder<NE>
): FormNode<E>;
/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param node Le noeud de base
 * @param builder Le configurateur.
 */
export function makeFormNode<E extends Entity, NE extends Entity>(
    componentClass: React.Component | null,
    node: StoreListNode<E>,
    builder: (s: FormListNodeBuilder<E>) => FormListNodeBuilder<NE>
): FormListNode<E>;
export function makeFormNode(
    componentClass: React.Component | null,
    node: StoreNode | StoreListNode = {} as StoreNode,
    opts: FormNodeOptions | Function = {},
    initializer: (source: StoreNode) => {} = _ => ({})
): any {
    const formNode = !isFunction(opts)
        ? makeFormNodeCore(node as any, opts as any, initializer)
        : isStoreListNode(node)
        ? opts(new FormListNodeBuilder(node)).build()
        : opts(new FormNodeBuilder(node)).build();

    return withDisposer(formNode, componentClass);
}

/**
 * Construit un FormListNode à partir d'un StoreListNode.
 * Le FormListNode est un clone d'un StoreListNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreListNode réinitialise le FormListNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 */
export function useFormNode<E extends Entity, NE extends Entity>(
    node: StoreListNode<E>,
    builder: (s: FormListNodeBuilder<E>) => FormListNodeBuilder<NE>,
    initialState?: EntityToType<E>[] | (() => EntityToType<E>[])
): FormListNode<NE>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 * @param builder Le configurateur
 */
export function useFormNode<E extends Entity, NE extends Entity>(
    node: StoreNode<E>,
    builder: (s: FormNodeBuilder<E>) => FormNodeBuilder<NE>,
    initialState?: EntityToType<E> | (() => EntityToType<E>)
): FormNode<NE>;
export function useFormNode(node: StoreNode | StoreListNode, builder: Function, initialState: any) {
    const [formNode] = isStoreListNode(node)
        ? useState(() => {
              const fn = builder(new FormListNodeBuilder(node)).build();
              if (initialState) {
                  fn.replaceNodes(isFunction(initialState) ? initialState() : initialState);
              }
              return fn;
          })
        : useState(() => {
              const fn = builder(new FormNodeBuilder(node)).build();
              if (initialState) {
                  fn.replace(isFunction(initialState) ? initialState() : initialState);
              }
              return fn;
          });
    useEffect(() => formNode.dispose, []);
    return formNode;
}

/** @deprecated Utiliser makeFormActions(node, builder) à la place. */
export function makeFormActions<FN extends FormListNode | FormNode>(
    componentClass: React.Component | null,
    formNode: FN,
    actions: ActionConfig<NodeToType<FN>>,
    config?: FormConfig
): FormActions;
export function makeFormActions<
    FN extends FormListNode | FormNode,
    S extends {
        [key: string]: (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>;
        default: (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>;
    }
>(
    componentClass: React.Component | null,
    formNode: FN,
    actions: ActionConfigMultiple<NodeToType<FN>, S>,
    config?: FormConfig<Extract<keyof S, string>>
): FormActions<Extract<keyof S, string>>;
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
): FormActions<S>;
export function makeFormActions<
    FN extends FormListNode | FormNode,
    S extends {[key: string]: (entity: any) => Promise<any>; default: (entity: any) => Promise<any>}
>(
    componentClass: React.Component | null,
    formNode: FN,
    actions?:
        | ActionConfig<any>
        | ActionConfigMultiple<any, S>
        | ((s: FormActionsBuilder<FN>) => FormActionsBuilder<FN>),
    config: FormConfig = {}
) {
    const formActions = isFunction(actions)
        ? actions(new FormActionsBuilder(formNode)).build()
        : makeFormActionsCore(formNode as any, actions as any, config);

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
