import {action, autorun, extendObservable, observable, untracked} from "mobx";

import {
    Entity,
    EntityToType,
    isEntityField,
    isStoreListNode,
    isStoreNode,
    StoreListNode,
    StoreNode,
    toFlatValues
} from "@focus4/stores";

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
export function createViewModel<E extends Entity>(
    model: StoreNode<E> | StoreListNode<E>
): (StoreNode<E> | StoreListNode<E>) & ViewModel {
    const viewModel = clone(model) as (StoreNode<E> | StoreListNode<E>) & ViewModel;

    // La fonction `reset` va simplement vider et reremplir le viewModel avec les valeurs du model.
    const reset = () => {
        untracked(() => viewModel.clear());
        if (isStoreListNode(viewModel) && isStoreListNode(model)) {
            viewModel.replaceNodes(toFlatValues(model));
        } else if (isStoreNode(viewModel) && isStoreNode(model)) {
            viewModel.replace(toFlatValues(model) as EntityToType<E>);
        }
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
        const res = observable.array([] as any[], {deep: false}) as StoreListNode;

        (res as any).$entity = source.$entity;
        res.pushNode = source.pushNode;
        res.replaceNodes = source.replaceNodes;
        res.setNodes = source.setNodes;

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            (res as any)[key] = clone((source as any)[key]);
        }
        return res;
    } else if (isEntityField(source)) {
        return extendObservable(
            {
                $field: source.$field
            },
            {
                value: source.value
            },
            {
                value: observable.ref
            }
        );
    }

    return source;
}
