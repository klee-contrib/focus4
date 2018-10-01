import i18next from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {isSearch, ListStoreBase} from "../../store";
import {LineProps, LineWrapperProps} from "./line";
import {LineItem, List, ListProps} from "./list";

/** Props additionnelles pour un StoreList. */
export interface StoreListProps<T> extends ListProps<T> {
    /** Code du groupe à afficher, pour une recherche groupée. */
    groupCode?: string;
    /** Affiche la sélection sur les lignes. */
    hasSelection?: boolean;
    /** Store contenant la liste. */
    store: ListStoreBase<T>;
}

/** Composant de liste lié à un store, qui permet la sélection de ses éléments. */
@observer
export class StoreList<T> extends List<T, StoreListProps<T>> {
    /** Les données. */
    @computed
    protected get data() {
        const {groupCode, store} = this.props;
        return groupCode && isSearch(store) ? store.groups.find(group => group.code === groupCode)!.list : store.list;
    }

    protected get shouldAttachScrollListener() {
        const {isManualFetch, store} = this.props;
        return !isManualFetch && isSearch(store);
    }

    /** Correspond aux données chargées mais non affichées. */
    @computed
    protected get hasMoreHidden() {
        return (this.displayedCount && this.data.length > this.displayedCount) || false;
    }

    /** Correpond aux données non chargées. */
    @computed
    protected get hasMoreToLoad() {
        const {store} = this.props;
        return isSearch(store) && store.totalCount > store.currentCount;
    }

    /** On complète le `hasMoreData` avec l'info du nombre de données chargées, si c'est un SearchStore. */
    @computed
    protected get hasMoreData() {
        return this.hasMoreHidden || this.hasMoreToLoad;
    }

    /** Label du bouton "Voir plus". */
    @computed
    protected get showMoreLabel() {
        const {i18nPrefix = "focus", store} = this.props;
        if (isSearch(store)) {
            return i18next.t(`${i18nPrefix}.list.show.more`);
        } else {
            return `${i18next.t(`${i18nPrefix}.list.show.more`)} (${this.displayedData.length} / ${
                this.data.length
            } ${i18next.t(`${i18nPrefix}.list.show.displayed`)})`;
        }
    }

    /**
     * Quelques props supplémentaires à ajouter pour la sélection.
     * @param Component Le composant de ligne.
     */
    protected getItems(Component: React.ComponentType<LineProps<T>>) {
        const {hasSelection = false, store} = this.props;
        return super.getItems(Component).map(({key, data, style}) => ({
            key,
            data: {
                Component: data!.Component,
                props: {
                    ...data!.props,
                    hasSelection,
                    store
                }
            },
            style
        })) as LineItem<LineWrapperProps<T>>[];
    }

    /** `handleShowMore` peut aussi appeler le serveur pour récupérer les résultats suivants, si c'est un SearchStore. */
    @action
    protected handleShowMore() {
        const {perPage, store} = this.props;
        if (this.hasMoreHidden) {
            super.handleShowMore();
        } else if (isSearch(store) && this.hasMoreToLoad && !store.isLoading) {
            store.search(true);
            if (perPage) {
                super.handleShowMore();
            }
        }
    }
}

/**
 * Crée un composant de liste avec store.
 * @param props Les props de la liste.
 */
export function storeListFor<T>(props: ListProps<T> & StoreListProps<T>) {
    return <StoreList {...props} />;
}
