import {action, asReference, autorun, isObservableArray, isObservableObject, observable} from "mobx";

import {StoreNode, toFlatValues} from "./store";

export interface ViewModel {
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
export function createViewModel<T extends StoreNode<{}>>(model: T) {
    const viewModel = clone(model) as any as T & ViewModel;

    const reset = () => viewModel.set(toFlatValues(model as any));

    viewModel.reset = action(reset);
    viewModel.subscribe = () => {
        if (!viewModel.isSubscribed) {
            const disposer = autorun(reset);
            viewModel.unsubscribe = () => {
                disposer();
                viewModel.isSubscribed = false;
            };
            viewModel.isSubscribed = true;
        }
    };

    viewModel.subscribe();
    return viewModel;
}

/** Version adaptée de `toJS` de MobX. */
function clone(source: any): any {
    if (isObservableArray(source)) {
        let res = [];
        const toAdd = source.map(value => clone(value));
        res.length = toAdd.length;
        for (let i = 0; i < toAdd.length; i++) {
            res[i] = toAdd[i];
        }

        res = observable(res);

        if ((source as any).$entity) {
            (res as any).$entity = (source as any).$entity;
        }
        if ((source as any).set) {
            (res as any).set = (source as any).set;
        }

        return res;
    } else if (isObservableObject(source)) {
        const res: any = {};
        for (const key in source) {
            if (key === "$entity") {
                res[key] = asReference(source[key]);
            } else {
                res[key] = clone(source[key]);
            }
        }
        return observable(res);
    }

    return source;
}
