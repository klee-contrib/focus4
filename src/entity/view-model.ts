import {merge} from "lodash";
import {autorun, action, observable, toJS} from "mobx";

import {ClearSet, toFlatValues} from "./store";

export interface ViewModel {
    /** Précise l'état de la synchronisation entre le model et le viewModel. */
    isSubscribed: boolean;

    /** Réinitialise le viewModel à partir du model. */
    reset(): void;

    /** Met à jour le model à partir du viewModel. */
    submit(): void;

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
export function createViewModel<T extends ClearSet<{}>>(model: T) {
    const getModel = () => toJS(model);
    const viewModel = observable(getModel()) as any as T & ViewModel;

    const reset = () => viewModel.set(toFlatValues(model as any));

    viewModel.reset = action(reset);
    viewModel.submit = action(() => merge(model, viewModel));
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
