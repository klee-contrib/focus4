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
    async load(isScroll: boolean) {
        this.pendingCount++;
        const response = await this.service({
            top: this.nbElement,
            skip: isScroll && this.dataList.length < this.totalCount ? this.dataList.length : 0,
            sortFieldName: this.sortBy,
            sortDesc: this.sortAsc === undefined ? false : !this.sortAsc,
            criteria: this.criteria,
            group: this.groupingKey || ""
        });
        this.pendingCount--;

        this.dataList = (isScroll ? [...this.dataList, ...response.dataList] : response.dataList) || [];
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

/** Retourne les props à fournir à un composant de liste pour se connecter à un ListStore. */
export function connectToListStore<T>({dataList, totalCount, load}: ListStore<T>) {
    return {data: dataList, fetchNextPage: () => load(false), hasMoreData: dataList.length < totalCount};
}
