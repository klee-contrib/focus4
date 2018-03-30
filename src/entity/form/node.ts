import {action, autorun, extendObservable, observable, untracked} from "mobx";

import {toFlatValues} from "../store";
import {FormNode, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "../types";
import {addFormProperties} from "./properties";

/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 * @param node Le noeud de base
 * @param transform La fonction de transformation
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function makeFormNode<T, U>(node: StoreListNode<T>, transform?: (source: StoreNode<T>) => U, isEdit?: boolean | (() => boolean)): StoreListNode<T & U> & FormNode<T>;
export function makeFormNode<T, U>(node: StoreNode<T>, transform?: (source: StoreNode<T>) => U, isEdit?: boolean | (() => boolean)): StoreNode<T> & U & FormNode<T>;
export function makeFormNode<T, U>(node: StoreNode<T>, transform: (source: StoreNode<T>) => U = _ => ({}) as U, isEdit: boolean | (() => boolean) = false) {
    if (node.form) {
        throw new Error("Impossible de créer un FormNode à partir d'un autre FormNode.");
    }

    const formNode = clone(node) as FormNode<T>;
    if (isStoreListNode<T>(formNode)) {
        formNode.$transform = transform;
    } else {
        Object.assign(formNode, transform(formNode) || {});
    }

    // On ajoute les `isEdit` et les champs dérivés pour les erreurs.
    addFormProperties(formNode, isEdit);

    // La fonction `reset` va simplement vider et reremplir le FormNode avec les valeurs du StoreNode.
    const reset = () => {
        untracked(() => formNode.clear());
        formNode.set(toFlatValues(formNode.sourceNode));
    };

    formNode.sourceNode = node;
    formNode.reset = action("resetEntity", reset);
    formNode.subscribe = () => {
        if (!formNode.isSubscribed) {
            const disposer = autorun(reset); // On crée la réaction de synchronisation.
            formNode.unsubscribe = () => {
                disposer();
                formNode.isSubscribed = false;
            };
            formNode.isSubscribed = true;
        }
    };

    formNode.subscribe(); // On s'abonne par défaut, puisque c'est à priori le comportement souhaité la plupart du temps.
    return formNode;
}

export function isFormNode<T>(node: StoreNode<T>): node is FormNode<T> {
    return !!(node as FormNode<T>).reset;
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

        res = observable.shallowArray(res) as StoreListNode;

        (res as any).$entity = source.$entity;
        res.$isFormNode = true;
        res.pushNode = source.pushNode;
        res.set = source.set;
        if (source.$transform) {
            res.$transform = source.$transform;
            res.forEach(source.$transform);
        }

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            (res as any)[key] = clone((source as any)[key]);
        }
        return res;
    } else if (source.$field) {
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
