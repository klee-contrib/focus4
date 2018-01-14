import {action, autorun, extendObservable, observable, untracked} from "mobx";

import {toFlatValues} from "./store";
import {isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "./types";
import {addErrorFields} from "./validation";

export interface FormNode<T = StoreNode> {
    /** @internal */
    /** Précise l'état de la synchronisation entre le StoreNode et le FormNode. */
    isSubscribed: boolean;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

    /** StoreNode original. */
    sourceNode: T;

    /** Active la synchronisation StoreNode -> FormNode. La fonction est appelée à la création. */
    subscribe(): void;

    /** Désactive la synchronisation StoreNode -> FormNode. */
    unsubscribe(): void;
}

/**
 * Construit un FormNode à partir d'un StoreNode.
 * Le FormNode est un clone d'un StoreNode qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du StoreNode réinitialise le FormNode.
 */
export function makeFormNode<T extends StoreNode, U>(node: StoreListNode<T>, transform?: (source: T) => U): StoreListNode<T & U> & FormNode<T>;
export function makeFormNode<T extends StoreNode, U>(node: T, transform?: (source: T) => U): T & U & FormNode<T>;
export function makeFormNode<T extends StoreNode, U>(node: T, transform: (source: T) => U = _ => ({}) as U) {
    const formNode = clone(node) as T & FormNode<T>;
    if (isStoreListNode<T>(formNode)) {
        formNode.$transform = transform;
    } else {
        Object.assign(formNode, transform(formNode) || {});
    }

    // On ajoute les champs dérivés pour les erreurs.
    addErrorFields(formNode);

    // La fonction `reset` va simplement vider et reremplir le FormNode avec les valeurs du StoreNode.
    const reset = () => {
        untracked(() => formNode.clear());
        formNode.set(toFlatValues(formNode.sourceNode));
    };

    formNode.sourceNode = node;
    formNode.reset = action(reset);
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
            const typedKey = key as keyof typeof source;
            res[typedKey] = clone(source[typedKey]);
        }
        return res;
    } else if (source.$field) {
        return extendObservable({
            $field: source.$field
        }, {
            value: observable.ref(source.value)
        });
    }

    return source;
}
