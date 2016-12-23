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

    @observable dataList: T[] = [];

    service?: ListService<T>;

    constructor(service?: ListService<T>) {
        super();
        this.service = service;

        // Tri.
        reaction(() => [this.sortAsc, this.sortBy], () => {
            if (this.service) {
                this.load();
            } else if (this.sortBy) {
                this.dataList = orderBy(this.dataList, item => item[this.sortBy!], this.sortAsc);
            }
        });

        // Tri à la saisie manuelle de la liste.
        if (!this.service) {
            reaction(() => this.dataList, () => {
                this.dataList = orderBy(this.dataList, item => item[this.sortBy!], this.sortAsc);
            });
        }
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
            return this.dataList.length;
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

            this.dataList = (fetchNext ? [...this.dataList, ...response.dataList] : response.dataList) || [];
            this.serverCount = response.totalCount;
        }
    }

    @action
    toggleAll() {
        if (this.selectedItems.size) {
            this.selectedList.replace(this.dataList);
        } else {
            this.selectedList.clear();
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
