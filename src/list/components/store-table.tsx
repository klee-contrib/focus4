import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {injectStyle} from "../../theming";

import {ListStore} from "../store";
import {ListStoreBase} from "../store-base";
import {LineProps} from "./line";
import {TABLE_CELL_CLASS, TableWithoutStyle} from "./table";

export interface StoreTableProps<T> {
    sortableColumns?: (keyof T)[];
    store: ListStoreBase<T>;
}

@injectStyle("list")
@autobind
@observer
export class StoreTable<T, P extends LineProps<T>> extends TableWithoutStyle<T, P, StoreTableProps<T>> {

    @computed
    protected get data() {
        const data = this.props.data || (this.props.store as ListStore<T>).dataList;
        if (!data) {
            throw new Error("`props.data` doit être renseigné pour un usage avec un `SearchStore`");
        }
        return data;
    }

    protected renderTableHeader() {
        const {columns, sortableColumns = [], store: {sortAsc, sortBy}} = this.props;
        return (
            <thead>
                <tr>
                    {Object.keys(columns).map(col => (
                        <th className={TABLE_CELL_CLASS} key={col}>
                            <div style={{display: "flex", alignItems: "center", marginBottom: sortableColumns.find(c => c === col) ? -3 : 0}}>
                                <div>{i18n.t(columns[col])}</div>
                                {sortableColumns.find(c => c === col) ?
                                    <div style={{marginLeft: 3}}>
                                        <Button disabled={sortAsc && sortBy === col} handleOnClick={() => this.sort(col, true)} shape="icon" type="button" icon="arrow_drop_up" />
                                        <Button disabled={!sortAsc && sortBy === col} handleOnClick={() => this.sort(col, false)} shape="icon" type="button" icon="arrow_drop_down" />
                                    </div>
                                : null}
                            </div>
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
