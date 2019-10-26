import {disposeOnUnmount} from "mobx-react";

import {
    ActionConfig,
    ActionConfigMultiple,
    Entity,
    FormActions,
    FormConfig,
    FormListNode,
    FormListNodeBuilder,
    FormNode,
    FormNodeBuilder,
    FormNodeOptions,
    isStoreListNode,
    isStoreNode,
    makeFormActionsCore,
    makeFormNodeCore,
    NodeToType,
    StoreListNode,
    StoreNode
} from "@focus4/stores";

/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de synchronisation à son démontage.
 * @param node Le noeud de base
 * @param opts Options du FormNode.
 * @param initializer La fonction d'initialisation (peut contenir des transformations comme `patchField` et retourner des `makeField`).
 */
export function makeFormNode<E extends Entity, U = {}>(
    componentClass: React.Component | null,
    node: StoreListNode<E>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<E>) => U
): FormListNode<E, U>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de synchronisation à son démontage.
 * @param node Le noeud de base
 * @param opts Options du FormNode.
 * @param initializer La fonction d'initialisation (peut contenir des transformations comme `patchField` et retourner des `makeField`).
 */
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
 * @param node Le noeud de base
 */
export function makeFormNode<E extends Entity>(node: StoreNode<E>): FormNodeBuilderClass<E>;
/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 */
export function makeFormNode<E extends Entity>(node: StoreListNode<E>): FormListNodeBuilderClass<E>;
export function makeFormNode(
    firstArg: StoreNode | StoreListNode | React.Component | null,
    node: StoreNode | StoreListNode = {} as StoreNode,
    opts: FormNodeOptions = {},
    initializer: (source: StoreNode) => {} = _ => ({})
): any {
    if (isStoreListNode(firstArg)) {
        return new FormListNodeBuilderClass(firstArg);
    } else if (isStoreNode(firstArg)) {
        return new FormNodeBuilderClass(firstArg);
    } else {
        return withDisposer(makeFormNodeCore(node as any, opts, initializer), firstArg);
    }
}

class FormListNodeBuilderClass<E extends Entity> extends FormListNodeBuilder<E> {
    constructor(node: StoreListNode<E>) {
        super(node);
    }

    /**
     * Construit le FormListNode.
     * @param componentClass Le composant (classe) lié au FormListNode, pour disposer la réaction de synchronisation à son démontage.
     */
    build(componentClass: React.Component | null) {
        return withDisposer(super.build({}), componentClass) as FormListNode<E>;
    }
}

class FormNodeBuilderClass<E extends Entity> extends FormNodeBuilder<E> {
    constructor(node: StoreNode<E>) {
        super(node);
    }

    /**
     * Construit le FormNode.
     * @param componentClass Le composant (classe) lié au FormNode, pour disposer la réaction de synchronisation à son démontage.
     */
    build(componentClass: React.Component | null) {
        return withDisposer(super.build({}), componentClass) as FormNode<E>;
    }
}

function withDisposer(formNode: any, componentClass: React.Component | null) {
    if (componentClass) {
        disposeOnUnmount(componentClass, formNode.dispose);
    }
    return formNode;
}

/**
 * Crée les actions d'un formulaire.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param formNode Le FormNode du formulaire.
 * @param actions La config d'actions pour le formulaire ({getLoadParams, load, save}).
 * @param config Configuration additionnelle.
 */
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
export function makeFormActions<
    FN extends FormListNode | FormNode,
    S extends {[key: string]: (entity: any) => Promise<any>; default: (entity: any) => Promise<any>}
>(
    componentClass: React.Component | null,
    formNode: FN,
    actions: ActionConfig<any> | ActionConfigMultiple<any, S>,
    config: FormConfig = {}
) {
    const formActions = makeFormActionsCore(formNode as any, actions as any, config);

    if (actions.getLoadParams && componentClass && formActions.dispose) {
        disposeOnUnmount(componentClass, formActions.dispose);
    }

    return formActions;
}
