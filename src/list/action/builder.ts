import {isArray} from "lodash";

import {ListStoreNodes} from "../store";
export {ListStoreNodes}

export interface Context {
    isScroll: boolean;
    dataList: any[];
    totalCount?: number;
    nbElement?: number;
}

export function buildOrderAndSort({sortBy, sortAsc}: {sortBy?: string, sortAsc?: boolean}) {
    return {
        sortFieldName: sortBy,
        sortDesc: sortAsc === undefined ? false : !sortAsc
    };
}

export function buildPagination({isScroll, dataList, totalCount, nbElement}: Context) {
    if (isScroll) {
        if (!isArray(dataList)) {
            throw new Error("The data list options sould exist and be an array");
        }
        if (dataList.length < totalCount) {
            return {top: nbElement, skip: dataList.length};
        }
    }
    return {
        top: nbElement,
        skip: 0
    };
}
