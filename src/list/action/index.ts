import {buildOrderAndSort, buildPagination, ListStoreNodes} from "./builder";
import {parser, ListServiceResponse} from "./parser";

import dispatcher from "dispatcher";

export {ListStoreNodes};

export interface ListServiceParam {
    top?: number;
    skip?: number;
    sortFieldName?: string;
    sortDesc?: boolean;
    criteria?: {};
    group?: string;
}

export interface ListActionBuilderSpec {
    identifier: string;
    service: (data: ListServiceParam) => Promise<ListServiceResponse>;
    getListOptions: () => ListStoreNodes;
    nbElement?: number;
}

/**
 * Search action generated from the config.
 * @param  {object} config - Action configuration.
 * @return {function} - The generated action from the congig.
 */
export default function loadActionFn(config: ListActionBuilderSpec) {
    function dispatchResult(data: ListServiceResponse) {
        dispatcher.handleServerAction({
            data,
            type: "update",
            identifier: config.identifier
        });
    }

    return async function listLoader(isScroll: boolean) {
        const {
            criteria,
            groupingKey, sortBy, sortAsc,
            dataList, totalCount
        } = config.getListOptions();

        const nbElement = config.nbElement;
        const data = Object.assign(
            buildPagination({dataList, totalCount, isScroll, nbElement}),
            buildOrderAndSort({sortBy, sortAsc}),
            {
                criteria,
                group: groupingKey || "",
            }
        );

        let response = await config.service(data);
        response = parser(response, {isScroll, dataList});
        dispatchResult(response);
    };
};
