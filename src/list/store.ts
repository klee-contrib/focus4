import CoreStore from "store";

export interface ListStoreNodes {
    criteria?: {};
    groupingKey?: string;
    sortBy?: string;
    sortAsc?: boolean;
    dataList: any[];
    totalCount: number;
}

export const definition: ListStoreNodes = {
    criteria: {},
    groupingKey: "groupingKey",
    sortBy: "sortBy",
    sortAsc: true,
    dataList: [],
    totalCount: 0
};

export default class ListStore extends CoreStore<ListStoreNodes> {
    constructor(identifier: string) {
        super({definition, identifier});
    }
}
