import {autobind} from "core-decorators";
import {observable, action, computed} from "mobx";

export interface ListServiceParams {
    criteria?: {};
    group?: string;
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
export class ListStore<T> {
    @observable criteria = {};
    @observable groupingKey: string | undefined;
    @observable sortAsc = true;
    @observable sortBy: string | undefined;

    @observable dataList: T[] = [];
    @observable totalCount = 0;

    @observable private pendingCount = 0;
    private service: ListService<T>;
    private nbElement: number;

    constructor(service: ListService<T>, nbElement?: number) {
        this.service = service;
        this.nbElement = nbElement || 50;
    }

    @computed
    get isLoading() {
        return this.pendingCount > 0;
    }

    @action
    async listLoader(isScroll: boolean) {
        const {dataList, totalCount, sortAsc, sortBy, criteria, groupingKey, nbElement} = this;

        this.pendingCount++;
        const response = await this.service({
            top: nbElement,
            skip: isScroll && dataList.length < totalCount ? dataList.length : 0,
            sortFieldName: sortBy,
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            criteria,
            group: groupingKey || ""
        });
        this.pendingCount--;

        this.dataList = isScroll ? [...this.dataList, ...response.dataList] : response.dataList;
        this.totalCount = response.totalCount;
    }

    @action
    setProperties(props: {criteria?: {}, groupingKey?: string, sortAsc?: boolean, sortBy?: string}) {
        this.criteria = props.criteria || this.criteria;
        this.groupingKey = props.groupingKey || this.groupingKey;
        this.sortAsc = props.sortAsc || this.sortAsc;
        this.sortBy = props.sortBy || this.sortBy;
    }
}
