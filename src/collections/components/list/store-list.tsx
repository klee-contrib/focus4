import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ReactComponent} from "../../../config";

import {isSearch, ListStoreBase, SearchStore} from "../../store";
import {LineProps, LineWrapperProps} from "./line";
import {LineItem, List, ListProps} from "./list";

import * as styles from "./__style__/list.css";

/** Props additionnelles pour un StoreList. */
export interface StoreListProps<T> extends ListProps<T> {
    /** Code du groupe à afficher, pour une recherche groupée. */
    groupCode?: string;
    /** Affiche la sélection sur les lignes. */
    hasSelection?: boolean;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data?: T) => boolean;
    /** Store contenant la liste. */
    store: ListStoreBase<T>;
}

/** Composant de liste lié à un store, qui permet la sélection de ses éléments. */
@autobind
@observer
export class StoreList<T> extends List<T, StoreListProps<T>> {

    /** Les données. */
    @computed
    protected get data() {
        const {groupCode, store} = this.props;
        return groupCode && isSearch(store) ? store.groups.find(group => group.code === groupCode).list : store.list;
    }

    /** Correspond aux données chargées mais non affichées. */
    @computed
    private get hasMoreHidden() {
        return this.displayedCount && this.data.length > this.displayedCount || false;
    }

    /** Correpond aux données non chargées. */
    @computed
    private get hasMoreToLoad() {
        const {store} = this.props;
        return isSearch(store) && store.totalCount > store.currentCount;
    }

    /** On complète le `hasMoreData` avec l'info du nombre de données chargées, si c'est un SearchStore. */
    @computed
    protected get hasMoreData() {
        return this.hasMoreHidden || this.hasMoreToLoad;
    }

    /**
     * Quelques props supplémentaires à ajouter pour la sélection.
     * @param Component Le composant de ligne.
     */
    protected getItems(Component: ReactComponent<LineProps<T>>) {
        const {hasSelection = false, isLineSelectionnable = () => true, store} = this.props;
        return super.getItems(Component).map(({key, data, style}) => ({
            key,
            data: {
                Component: data.Component,
                props: {
                    ...data.props,
                    hasSelection,
                    isSelectionnable: isLineSelectionnable,
                    store
                }
            },
            style
        })) as LineItem<LineWrapperProps<T>>[];
    }

    /** `handleShowMore` peut aussi appeler le serveur pour récupérer les résultats suivants, si c'est un SearchStore. */
    protected handleShowMore() {
        if (this.hasMoreHidden) {
            super.handleShowMore();
        } else if (this.hasMoreToLoad) {
            (this.props.store as SearchStore).search(true);
        }
    }
}

const ThemedStoreList = themr("list", styles)(StoreList);
export default ThemedStoreList;

/**
 * Crée un composant de liste avec store.
 * @param props Les props de la liste.
 */
export function storeListFor<T>(props: ListProps<T> & StoreListProps<T>) {
    const List2 = ThemedStoreList as any;
    return <List2 {...props} />;
}
