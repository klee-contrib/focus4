import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ListStore} from "../store";
import {MiniListStore} from "../store-base";
import {LineProps, LineWrapperProps} from "./line";
import {LineItem, List, ListProps} from "./list";

import * as styles from "./__style__/list.css";

/** Props additionnelles pour un StoreList. */
export interface StoreListProps<T> {
    /** Affiche la sélection sur les lignes. */
    hasSelection?: boolean;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data?: T) => boolean;
    /** Store contenant la liste. */
    store: MiniListStore<T>;
}

/** Composant de liste lié à un store, qui permet la sélection de ses éléments. */
@autobind
@observer
export class StoreList<T> extends List<T, StoreListProps<T>> {

    /** Les données. */
    @computed
    protected get data() {
        const data = this.props.data || (this.props.store as ListStore<T>).dataList;
        if (!data) {
            throw new Error("`props.data` doit être renseigné pour un usage avec un `SearchStore`");
        }
        return data;
    }

    /** `hasMoreData` regarde dans le store pour savoir s'il y a d'autres éléments. */
    @computed
    protected get hasMoreData() {
        const {store} = this.props;
        if (this.maxElements) {
            return this.data.length > this.maxElements;
        } else {
            return store.totalCount > store.currentCount;
        }
    }

    /**
     * Quelques props supplémentaires à ajouter pour la sélection.
     * @param Component Le composant de ligne.
     */
    protected getItems(Component: React.ComponentClass<LineProps<T>> | React.SFC<LineProps<T>>) {
        const {hasSelection = false, isLineSelectionnable = () => true, store} = this.props;
        return super.getItems(Component).map(({key, data}) => ({
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
            style: {}
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
