import {action, autorun, isObservableArray, isObservableObject, observable, untracked} from "mobx";

import {StoreNode, toFlatValues} from "./store";

export interface FormNode {
    /** @internal */
    /** Précise l'état de la synchronisation entre le StoreNode et le FormNode. */
    isSubscribed: boolean;

    /** Réinitialise le FormNode à partir du StoreNode. */
    reset(): void;

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
export function makeFormNode<T extends StoreNode>(node: T) {
    const formNode = clone(node) as T & FormNode;

    // La fonction `reset` va simplement vider et reremplir le FormNode avec les valeurs du StoreNode.
    const reset = () => {
        untracked(() => formNode.clear());
        formNode.set(toFlatValues(node as any));
    };

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

/** Version adaptée de `toJS` de MobX pour prendre en compte `$entity` et les fonctions `set` et `pushNode` pour les arrays. */
function clone(source: any): any {
    if (isObservableArray(source)) {
        let res = [];
        const toAdd = source.map(clone);
        res.length = toAdd.length;
        for (let i = 0; i < toAdd.length; i++) {
            res[i] = toAdd[i];
        }

        res = observable(res);

        if ((source as any).$entity) {
            (res as any).$entity = (source as any).$entity;
        }
        if ((source as any).pushNode) {
            (res as any).pushNode = (source as any).pushNode;
        }
        if ((source as any).set) {
            (res as any).set = (source as any).set;
        }

        return res;
    } else if (isObservableObject(source)) {
        const res: any = {};
        for (const key in source) {
            if (key === "$entity" || key === "$field") {
                res[key] = observable.ref((source as any)[key]);
            } else {
                res[key] = clone((source as any)[key]);
            }
        }
        return observable(res);
    }

    return source;
}
