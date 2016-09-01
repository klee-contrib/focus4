import {autobind} from "core-decorators";
import {observable, action} from "mobx";

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

@autobind
export class ListStore<T> {
    @observable criteria = {};
    @observable groupingKey: string | undefined;
    @observable sortAsc = true;
    @observable sortBy: string | undefined;

    @observable dataList: T[] = [];
    @observable totalCount = 0;

    private service: (data: ListServiceParams) => Promise<ListServiceResponse<T>>;

    constructor(service: (data: ListServiceParams) => Promise<ListServiceResponse<T>>) {
        this.service = service;
    }

    @action
    async listLoader(isScroll: boolean, nbElement: number) {
        const {dataList, totalCount, sortAsc, sortBy, criteria, groupingKey} = this;

        const response = await this.service({
            top: nbElement,
            skip: isScroll && dataList.length < totalCount ? dataList.length : 0,
            sortFieldName: sortBy,
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            criteria,
            group: groupingKey || ""
        });

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
