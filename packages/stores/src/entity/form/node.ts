import {extendObservable, observable} from "mobx";

import {nodeToFormNode} from "../store";
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

/** @deprecated Utiliser `new Form(List)NodeBuilder(node).build() à la place.` */
export function makeFormNodeCore<E extends Entity, U = {}>(
    node: StoreListNode<E>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<E>) => U
): FormListNode<E, U>;
export function makeFormNodeCore<E extends Entity, U = {}>(
    node: StoreNode<E>,
    opts?: FormNodeOptions,
    initializer?: (source: StoreNode<E>) => U
): FormNode<E, U>;
export function makeFormNodeCore<E extends Entity, U = {}>(
    node: StoreNode<E> | StoreListNode<E>,
    {isEdit, isEmpty}: FormNodeOptions = {},
    initializer: (source: StoreNode<E>) => U = _ => ({} as U)
) {
    if (isAnyFormNode(node)) {
        throw new Error("Impossible de créer un FormNode à partir d'un autre FormNode.");
    }

    const formNode = clone(node, isEmpty, initializer);
    formNode.$tempEdit = isEdit || false;
    nodeToFormNode(formNode, node);

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
