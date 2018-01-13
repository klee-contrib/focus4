import {isObject} from "lodash";
import {action, autorun, extendObservable, isObservableArray, isObservableObject, observable, untracked} from "mobx";

import {StoreNode, toFlatValues} from "./store";

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
export function makeFormNode<T extends StoreNode, U>(node: T, transform: (source: T) => U = _ => ({}) as U) {
    const formNode = clone(node) as T & FormNode<T>;
    Object.assign(formNode, transform(formNode) || {});

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
    return formNode as T & U & FormNode<T>;
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

        res = observable.shallowArray(res);

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
        const obsRes: any = {};
        const nonObsRes: any = {};
        for (const key in source) {
            if (key === "$field") {
                nonObsRes[key] = source[key as keyof typeof source];
            } else {
                const res = clone(source[key as keyof typeof source]);
                if (isObject(res)) {
                    nonObsRes[key] = res;
                } else {
                    obsRes[key] = res;
                }
            }
        }
        return extendObservable(nonObsRes, obsRes);
    }

    return source;
}
