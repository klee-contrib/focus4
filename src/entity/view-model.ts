import {action, autorun, extendObservable, isObservableArray, observable, untracked} from "mobx";

import {StoreListNode, StoreNode, toFlatValues} from "./store";
import {EntityField} from "./types";

export interface ViewModel {
    /** @internal */
    /** Précise l'état de la synchronisation entre le model et le viewModel. */
    isSubscribed: boolean;

    /** Réinitialise le viewModel à partir du model. */
    reset(): void;

    /** Active la synchronisation model -> viewModel. La fonction est appelée à la création. */
    subscribe(): void;

    /** Désactive la synchronisation model -> viewModel. */
    unsubscribe(): void;
}

/**
 * Construit un ViewModel à partir d'une entrée d'entityStore.
 * Le ViewModel est un clone d'un model qui peut être librement modifié sans l'impacter, et propose des méthodes pour se synchroniser.
 * Toute mise à jour du model réinitialise le viewModel.
 */
export function createViewModel<T extends StoreNode>(model: T) {
    const viewModel = clone(model) as T & ViewModel;

    // La fonction `reset` va simplement vider et reremplir le viewModel avec les valeurs du model.
    const reset = () => {
        untracked(() => viewModel.clear());
        viewModel.set(toFlatValues(model as any));
    };

    viewModel.reset = action(reset);
    viewModel.subscribe = () => {
        if (!viewModel.isSubscribed) {
            const disposer = autorun(reset); // On crée la réaction de synchronisation.
            viewModel.unsubscribe = () => {
                disposer();
                viewModel.isSubscribed = false;
            };
            viewModel.isSubscribed = true;
        }
    };

    viewModel.subscribe(); // On s'abonne par défaut, puisque c'est à priori le comportement souhaité la plupart du temps.
    return viewModel;
}

/** Version adaptée de `toJS` de MobX pour prendre en compte `$entity` et les fonctions `set` et `clear`. */
function clone(source: any): any {
    if (isStoreListNode(source)) {
        let res = [];
        const toAdd = source.map(clone);
        res.length = toAdd.length;
        for (let i = 0; i < toAdd.length; i++) {
            res[i] = toAdd[i];
        }

        res = observable.array(res, {deep: false});

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
    } else if (isStoreNode(source)) {
        const res: any = {};
        for (const key in source) {
            res[key] = clone((source as any)[key]);
        }
        return res;
    } else if (isEntityField(source)) {
        return extendObservable(
            {
                $entity: (source as any).$entity
            },
            {
                value: (source as any).value
            },
            {
                value: observable.ref
            }
        );
    }

    return source;
}

function isAnyStoreNode(data: any): data is StoreNode | StoreListNode {
    return data && !!(data as StoreNode).set && !!(data as StoreNode).clear;
}
function isStoreListNode(data: any): data is StoreListNode {
    return isAnyStoreNode(data) && isObservableArray(data);
}
function isStoreNode(data: any): data is StoreNode {
    return isAnyStoreNode(data) && !isObservableArray(data);
}
function isEntityField(data: any): data is EntityField<any> {
    return data && !isObservableArray(data) && !!(data as EntityField<any>).$entity;
}
