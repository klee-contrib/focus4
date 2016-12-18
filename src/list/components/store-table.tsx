import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../theming";

import {ListStore} from "../store";
import {ListStoreBase} from "../store-base";
import {LineProps} from "./line";
import {Table, TABLE_CELL_CLASS} from "./table";

export interface StoreTableProps<T> {
    sortableColumns?: {[field: string]: {sortAsc?: boolean, sortDesc?: boolean}};
    store: ListStoreBase<T>;
}

@injectStyle("list")
@autobind
@observer
export class StoreTable<T, P extends LineProps<T>> extends Table<T, P, StoreTableProps<T>> {

    @computed
    protected get data() {
        const data = this.props.data || (this.props.store as ListStore<T>).dataList;
        if (!data) {
            throw new Error("`props.data` doit être renseigné pour un usage avec un `SearchStore`");
        }
        return data;
    }

    protected renderTableHeader() {
        const {columns, sortableColumns = {}} = this.props;
        return (
            <thead>
                <tr>
                    {Object.keys(columns).map(col => (
                        <th className={TABLE_CELL_CLASS} key={col}>
                            {i18n.t(col)}
                            {sortableColumns[col] && sortableColumns[col].sortAsc ?
                                <span onClick={() => this.sort(col, true)}><i className="material-icons">{"arrow_drop_up"}</i></span>
                            : null}
                            {sortableColumns[col] && sortableColumns[col].sortDesc ?
                                <span onClick={() => this.sort(col, false)}><i className="material-icons">{"arrow_drop_down"}</i></span>
                            : null}
                        </th>
                    ))}
                </tr>
            </thead>
        );
    }

    @action
    private sort(sortBy: string, sortAsc: boolean) {
        const {store} = this.props;
        store.sortAsc = sortAsc;
        store.sortBy = sortBy as keyof T;
    }
}
