import {extendObservable, observable, reaction} from "mobx";

import {nodeToFormNode, toFlatValues} from "../store";
import {Entity, FormListNode, FormNode, isEntityField, isFormNode, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "../types";

/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 * @param transform La fonction de transformation
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function makeFormNode<T extends Entity, U = {}>(node: StoreListNode<T>, transform?: (source: StoreNode<T>) => U, isEdit?: boolean | (() => boolean)): FormListNode<T, U> & {stopSync(): void};
export function makeFormNode<T extends Entity, U = {}>(node: StoreNode<T>, transform?: (source: StoreNode<T>) => U, isEdit?: boolean | (() => boolean)): FormNode<T, U> & {stopSync(): void};
export function makeFormNode<T extends Entity, U = {}>(node: StoreNode<T> | StoreListNode<T>, transform: (source: StoreNode<T>) => U = _ => ({}) as U, isEdit: boolean | (() => boolean) = false) {
    if (isFormNode(node)) {
        throw new Error("Impossible de créer un FormNode à partir d'un autre FormNode.");
    }

    const formNode = clone(node);
    if (isStoreListNode<T>(formNode)) {
        formNode.$transform = transform;
    } else {
        Object.assign(formNode, transform(formNode) || {});
    }

    nodeToFormNode(formNode, node, isEdit);
    formNode.stopSync = reaction(() => toFlatValues(node), formNode.reset);

    return formNode;
}

/** Clone un StoreNode */
function clone(source: any): any {
    if (isStoreListNode(source)) {
        let res = [];
        const toAdd = source.map(clone);
        res.length = toAdd.length;
        for (let i = 0; i < toAdd.length; i++) {
            res[i] = toAdd[i];
        }

        res = observable.array(res, {deep: false}) as StoreListNode;

        (res as any).$entity = source.$entity;
        res.pushNode = source.pushNode;
        res.set = source.set;
        if (source.$transform) {
            res.$transform = source.$transform;
            res.forEach(item => {
                Object.assign(item, source.$transform!(item) || {});
            });
        }

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            (res as any)[key] = clone((source as any)[key]);
        }
        return res;
    } else if (isEntityField(source)) {
        return extendObservable({
            $field: source.$field
        }, {
            value: source.value
        }, {
            value: observable.ref
        });
    }

    return source;
}
