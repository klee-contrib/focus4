import {autobind} from "core-decorators";
import {orderBy} from "lodash";
import {action, computed, observable, reaction} from "mobx";

import {ListStoreBase} from "./store-base";

export interface ListServiceParams {
    skip?: number;
    sortDesc?: boolean;
    sortFieldName?: string;
    top?: number;
}

export interface ListServiceResponse<T> {
    dataList: T[];
    totalCount: number;
};

export type ListService<T> = (data: ListServiceParams) => Promise<ListServiceResponse<T>>;

@autobind
export class ListStore<T> extends ListStoreBase<T> {

    @observable private innerDataList: T[] = [];
    @computed
    get dataList() {
        return this.innerDataList;
    }

    set dataList(list) {
        if (!this.service && this.sortBy) {
            this.innerDataList = orderBy(list, this.sortBy, this.sortAsc ? "asc" : "desc");
        } else {
            this.innerDataList = list;
        }
    }

    service?: ListService<T>;

    constructor(service?: ListService<T>) {
        super();
        this.service = service;

        // Tri.
        reaction(() => [this.sortAsc, this.sortBy], () => {
            if (this.service) {
                this.load();
            } else if (this.sortBy) {
                this.innerDataList = orderBy(this.innerDataList, this.sortBy, this.sortAsc ? "asc" : "desc");
            }
        });
    }

    @computed
    get currentCount() {
        return this.dataList.length;
    }

    @computed
    get totalCount() {
        if (this.service) {
            return this.serverCount;
        } else {
            return this.innerDataList.length;
        }
    }

    @action
    async load(fetchNext?: boolean) {
        if (this.service) {
            this.pendingCount++;
            const response = await this.service({
                skip: fetchNext && this.dataList.length < this.totalCount ? this.dataList.length : 0,
                sortDesc: this.sortAsc === undefined ? false : !this.sortAsc,
                sortFieldName: this.sortBy,
                top: this.top
            });
            this.pendingCount--;

            this.innerDataList = (fetchNext ? [...this.dataList, ...response.dataList] : response.dataList) || [];
            this.serverCount = response.totalCount;
        }
    }

    @action
    toggleAll() {
        if (this.selectedItems.size === this.dataList.length) {
            this.selectedList.clear();
        } else {
            this.selectedList.replace(this.dataList);
        }
    }

    @action
    setProperties(props: {dataList?: T[], sortAsc?: boolean, sortBy?: keyof T, top?: number}) {
        this.dataList = props.dataList || this.dataList;
        this.sortAsc = props.sortAsc || this.sortAsc;
        this.sortBy = props.sortBy || this.sortBy;
        this.top = props.top || this.top;
    }
}
