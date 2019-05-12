import {disposeOnUnmount} from "??";
import {extendObservable, observable} from "mobx";

import {nodeToFormNode, patchNodeEdit} from "../store";
import {
    Entity,
    FormListNode,
    FormNode,
    isAnyFormNode,
    isEntityField,
    isStoreListNode,
    isStoreNode,
    StoreListNode,
    StoreNode
} from "../types";

/** Options de `makeFormNode` */
export interface FormNodeOptions {
    /** Etat d'édition initial ou getter vers un état d'édition externe. */
    isEdit?: boolean | (() => boolean);
    /** Construit un FormNode vide au lieu de recopier le contenu actuel du noeud source. */
    isEmpty?: boolean;
}

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
    {isEdit, isEmpty}: FormNodeOptions = {},
    initializer: (source: StoreNode<T>) => U = _ => ({} as U)
) {
    if (isAnyFormNode(node)) {
        throw new Error("Impossible de créer un FormNode à partir d'un autre FormNode.");
    }

    const formNode = clone(node, isEmpty, initializer);
    nodeToFormNode(patchNodeEdit(formNode, isEdit || false), node);

    if (componentClass) {
        disposeOnUnmount(componentClass, formNode.dispose);
    }

    return formNode;
}

/** Clone un StoreNode */
function clone(source: any, isEmpty?: boolean, initializer?: (node: any) => any): any {
    if (isStoreListNode(source)) {
        let res = [];

        if (!isEmpty) {
            const toAdd = source.map(i => clone(i, isEmpty, initializer || source.$initializer));
            res.length = toAdd.length;
            for (let i = 0; i < toAdd.length; i++) {
                res[i] = toAdd[i];
            }
        }

        res = observable.array(res, {deep: false}) as StoreListNode;

        (res as any).$entity = source.$entity;
        res.pushNode = source.pushNode;
        res.replaceNodes = source.replaceNodes;
        res.setNodes = source.setNodes;
        res.$initializer = initializer || source.$initializer;

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            (res as any)[key] = clone((source as any)[key], isEmpty);
        }
        if (initializer) {
            Object.assign(res, initializer(res) || {});
        }
        return res;
    } else if (isEntityField(source)) {
        return extendObservable(
            {
                $field: source.$field
            },
            {
                value: isEmpty ? undefined : source.value
            },
            {
                value: observable.ref
            }
        );
    }

    return source;
}
