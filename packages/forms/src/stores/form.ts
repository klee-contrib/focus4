import {disposeOnUnmount} from "mobx-react";

import {
    ActionConfig,
    ActionConfigMultiple,
    Entity,
    EntityToType,
    FormActions,
    FormConfig,
    FormListNode,
    FormNode,
    FormNodeOptions,
    makeFormActionsCore,
    makeFormNodeCore,
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
export function makeFormNode<T extends Entity, U = {}>(
    componentClass: React.Component | null,
    node: StoreListNode<T>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<T>) => U
): FormListNode<T, U>;
export function makeFormNode<T extends Entity, U = {}>(
    componentClass: React.Component | null,
    node: StoreNode<T>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<T>) => U
): FormNode<T, U>;
export function makeFormNode<T extends Entity, U = {}>(
    componentClass: React.Component | null,
    node: StoreNode<T> | StoreListNode<T>,
    opts: FormNodeOptions = {},
    initializer: (source: StoreNode<T>) => U = _ => ({} as U)
) {
    const formNode = makeFormNodeCore(node as any, opts, initializer);

    if (componentClass) {
        disposeOnUnmount(componentClass, formNode.dispose);
    }

    return formNode as FormNode<T, U> | FormListNode<T, U>;
}

/**
 * Crée les actions d'un formulaire.
 * @param componentClass Le composant (classe) lié au FormActions, pour disposer la réaction de chargement à son démontage.
 * @param formNode Le FormNode du formulaire.
 * @param actions La config d'actions pour le formulaire ({getLoadParams, load, save}).
 * @param config Configuration additionnelle.
 */
export function makeFormActions<T extends Entity, U>(
    componentClass: React.Component | null,
    formNode: FormListNode<T, U>,
    actions: ActionConfig<EntityToType<T>[]>,
    config?: FormConfig
): FormActions;
export function makeFormActions<
    T extends Entity,
    U,
    S extends {
        [key: string]: (entity: EntityToType<T>[]) => Promise<EntityToType<T>[] | void>;
        default: (entity: EntityToType<T>[]) => Promise<EntityToType<T>[] | void>;
    }
>(
    componentClass: React.Component | null,
    formNode: FormListNode<T, U>,
    actions: ActionConfigMultiple<EntityToType<T>[], S>,
    config?: FormConfig<Extract<keyof S, string>>
): FormActions<Extract<keyof S, string>>;
export function makeFormActions<T extends Entity, U>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U>,
    actions: ActionConfig<EntityToType<T>>,
    config?: FormConfig
): FormActions;
export function makeFormActions<
    T extends Entity,
    U,
    S extends {
        [key: string]: (entity: EntityToType<T>) => Promise<EntityToType<T> | void>;
        default: (entity: EntityToType<T>) => Promise<EntityToType<T> | void>;
    }
>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U>,
    actions: ActionConfigMultiple<EntityToType<T>, S>,
    config?: FormConfig<Extract<keyof S, string>>
): FormActions<Extract<keyof S, string>>;
export function makeFormActions<
    T extends Entity,
    U,
    S extends {[key: string]: (entity: any) => Promise<any>; default: (entity: any) => Promise<any>}
>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U> | FormListNode<T, U>,
    actions: ActionConfig<any> | ActionConfigMultiple<any, S>,
    config: FormConfig = {}
) {
    const formActions = makeFormActionsCore(formNode as any, actions as any, config);

    if (actions.getLoadParams && componentClass && formActions.dispose) {
        disposeOnUnmount(componentClass, formActions.dispose);
    }

    return formActions;
}
