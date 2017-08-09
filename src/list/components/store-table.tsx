import {autobind} from "core-decorators";
import i18next from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button from "focus-components/button";

import {ListStore} from "../store";
import {ListStoreBase} from "../store-base";
import {Table, TABLE_CELL_CLASS} from "./table";

import * as styles from "./__style__/list.css";

/** Props additionnelles pour un StoreTable. */
export interface StoreTableProps<T> {
    /** Les colonnes sur lesquelles on peut trier. */
    sortableColumns?: (keyof T)[];
    /** Le store contenant la liste. */
    store: ListStoreBase<T>;
}

/** Composant de tableau lié à un store, qui permet le tri de ses colonnes. */
@autobind
@observer
export class StoreTable<T, P extends {data?: T}> extends Table<T, P, StoreTableProps<T>> {

    /** Les données. */
    @computed
    protected get data() {
        const data = this.props.data || (this.props.store as ListStore<T>).dataList;
        if (!data) {
            throw new Error("`props.data` doit être renseigné pour un usage avec un `SearchStore`");
        }
        return data;
    }

    /** On modifie le header pour y ajouter les boutons de tri. */
    protected renderTableHeader() {
        const {columns, i18nPrefix = "focus", sortableColumns = [], store: {sortAsc, sortBy}} = this.props;
        return (
            <thead>
                <tr>
                    {Object.keys(columns).map(col => (
                        <th className={TABLE_CELL_CLASS} key={col}>
                            <div style={{display: "flex", alignItems: "center", marginBottom: sortableColumns.find(c => c === col) ? -3 : 0}}>
                                <div>{i18next.t(columns[col])}</div>
                                {sortableColumns.find(c => c === col) ?
                                    <div style={{marginLeft: 3, display: "flex"}}>
                                        <Button
                                            disabled={sortAsc && sortBy === col}
                                            handleOnClick={() => this.sort(col, true)}
                                            shape="icon"
                                            type="button"
                                            icon={i18next.t(`${i18nPrefix}.icons.table.sortAsc.name`)}
                                            iconLibrary={i18next.t(`${i18nPrefix}.icons.table.sortAsc.library`)}
                                        />
                                        <Button
                                            disabled={!sortAsc && sortBy === col}
                                            handleOnClick={() => this.sort(col, false)}
                                            shape="icon"
                                            type="button"
                                            icon={i18next.t(`${i18nPrefix}.icons.table.sortDesc.name`)}
                                            iconLibrary={i18next.t(`${i18nPrefix}.icons.table.sortDesc.library`)}
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

export default themr("list", styles)(StoreTable);
