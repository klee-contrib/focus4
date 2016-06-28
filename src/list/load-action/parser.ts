import {Context} from "./builder";

export interface ListServiceResponse {
    dataList: any[];
    totalCount: number;
};

export function parser(data: {dataList: any[], totalCount: number}, context: Context): ListServiceResponse {
    let {dataList, totalCount} = data;

    if (context.isScroll) {
        dataList = [...context.dataList, ...data.dataList];
    }

    if (dataList.length === 0 && totalCount > 0) {
        throw new Error("totalCount must be equal to zero when no data are returned.");
    }

    return Object.assign({}, data, {
        dataList,
        totalCount
    });
};
