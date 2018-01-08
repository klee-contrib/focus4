import {autobind} from "core-decorators";
import i18next from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "../../../components";

import {ListStoreBase, SearchStore} from "../../store";
import {Table, TableProps} from "./table";

import * as styles from "./__style__/list.css";

/** Props additionnelles pour un StoreTable. */
export interface StoreTableProps<T> {
    /** Code du groupe à afficher, pour une recherche groupée. */
    groupCode?: string;
    /** Les colonnes sur lesquelles on peut trier. */
    sortableColumns?: (keyof T)[];
    /** Le store contenant la liste. */
    store: ListStoreBase<T>;
}

/** Composant de tableau lié à un store, qui permet le tri de ses colonnes. */
@autobind
@observer
export class StoreTable<T> extends Table<T, StoreTableProps<T>> {

    /** Les données. */
    @computed
    protected get data() {
        const {groupCode, store} = this.props;
        return groupCode ? (store as SearchStore<T>).groups.find(group => group.code === groupCode).list : store.list;
    }

    /** On modifie le header pour y ajouter les boutons de tri. */
    protected renderTableHeader() {
        const {columns, i18nPrefix = "focus", sortableColumns = [], store: {sortAsc, sortBy}} = this.props;
        return (
            <thead>
                <tr>
                    {Object.keys(columns).map(col => (
                        <th key={col}>
                            <div style={{display: "flex", alignItems: "center", marginBottom: sortableColumns.find(c => c === col) ? -3 : 0}}>
                                <div>{i18next.t(columns[col])}</div>
                                {sortableColumns.find(c => c === col) ?
                                    <div style={{marginLeft: 3, display: "flex"}}>
                                        <IconButton
                                            disabled={sortAsc && sortBy === col}
                                            onClick={() => this.sort(col, true)}
                                            icon={getIcon(`${i18nPrefix}.icons.table.sortAsc`)}
                                        />
                                        <IconButton
                                            disabled={!sortAsc && sortBy === col}
                                            onClick={() => this.sort(col, false)}
                                            icon={getIcon(`${i18nPrefix}.icons.table.sortDesc`)}
                                        />
                                    </div>
                                : null}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
        );
    }

    /** Fonction de tri, modifie les critères du store. */
    @action
    private sort(sortBy: string, sortAsc: boolean) {
        const {store} = this.props;
        store.sortAsc = sortAsc;
        store.sortBy = sortBy as keyof T;
    }
}

const ThemedStoreTable = themr("list", styles)(StoreTable);
export default ThemedStoreTable;

/**
 * Crée un composant de tableau avec store.
 * @param props Les props du tableau.
 */
export function storeTableFor<T>(props: TableProps<T> & StoreTableProps<T>) {
    const Table2 = ThemedStoreTable as any;
    return <Table2 {...props} />;
}
