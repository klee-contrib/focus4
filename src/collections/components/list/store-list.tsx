import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ReactComponent} from "../../../config";

import {isSearch, ListStoreBase} from "../../store";
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

    /** `hasMoreData` regarde dans le store pour savoir s'il y a d'autres éléments. */
    @computed
    protected get hasMoreData() {
        const {store} = this.props;
        if (this.displayedCount) {
            return this.data.length > this.displayedCount;
        } else {
            return store.totalCount > store.currentCount;
        }
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

    /** `handleShowMore` appelle le store de liste serveur si c'est le cas. */
    protected handleShowMore() {
        if ((this.props.store as any).service) {
            (this.props.store as any).load(true);
        } else {
            super.handleShowMore();
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
