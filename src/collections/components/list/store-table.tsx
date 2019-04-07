import i18next from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "../../../components";

import {isSearch, ListStoreBase} from "../../store";
import {Table, TableProps} from "./table";

/** Props additionnelles pour un StoreTable. */
export interface StoreTableProps<T> extends TableProps<T> {
    /** Code du groupe à afficher, pour une recherche groupée. */
    groupCode?: string;
    /** La description des colonnes du tableau. */
    columns: {
        /** Classe CSS pour la colonne. */
        className?: string;
        /** Contenu de la colonne. */
        content: (data: T) => React.ReactNode;
        /** Si la colonne est triable, le nom du champ sur lequel on doit trier. */
        sortKey?: string;
        /** Libellé du titre de la colonne. */
        title: string;
    }[];
    /** Le store contenant la liste. */
    store: ListStoreBase<T>;
}

/** Composant de tableau lié à un store, qui permet le tri de ses colonnes. */
@observer
export class StoreTable<T> extends Table<T, StoreTableProps<T>> {
    /** Les données. */
    @computed
    protected get data() {
        const {groupCode, store} = this.props;
        return groupCode && isSearch(store) ? store.groups.find(group => group.code === groupCode)!.list : store.list;
    }

    protected get hasInfiniteScroll() {
        const {isManualFetch, store, perPage} = this.props;
        return !isManualFetch && (isSearch(store) || !!perPage);
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

    /** On modifie le header pour y ajouter les boutons de tri. */
    protected renderTableHeader() {
        const {
            columns,
            i18nPrefix = "focus",
            store: {sortAsc, sortBy}
        } = this.props;
        return (
            <thead>
                <tr>
                    {columns.map(({title, sortKey}) => (
                        <th key={title}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: sortKey ? -3 : 0
                                }}
                            >
                                <div>{i18next.t(title)}</div>
                                {sortKey ? (
                                    <div style={{marginLeft: 3, display: "flex"}}>
                                        <IconButton
                                            disabled={sortAsc && sortBy === sortKey}
                                            onClick={() => this.sort(sortKey, true)}
                                            icon={getIcon(`${i18nPrefix}.icons.table.sortAsc`)}
                                        />
                                        <IconButton
                                            disabled={!sortAsc && sortBy === sortKey}
                                            onClick={() => this.sort(sortKey, false)}
                                            icon={getIcon(`${i18nPrefix}.icons.table.sortDesc`)}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
        );
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

    /** Fonction de tri, modifie les critères du store. */
    @action
    protected sort(sortBy: string, sortAsc: boolean) {
        const {store} = this.props;
        store.sortAsc = sortAsc;
        store.sortBy = sortBy;
    }
}

/**
 * Crée un composant de tableau avec store.
 * @param props Les props du tableau.
 */
export function storeTableFor<T>(props: TableProps<T> & StoreTableProps<T>) {
    return <StoreTable {...props} />;
}
