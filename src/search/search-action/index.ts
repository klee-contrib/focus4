import {buildFacets, buildOrderAndSort, buildPagination} from "./builder";
import {scopedResponse, unscopedResponse} from "./parser";
import {dispatcher} from "../..";
import {QueryInput, QueryOutput, UnscopedQueryOutput} from "./types";
import {AdvancedSearch, Results} from "../../store/search/advanced-search";

export interface SearchActionService {
    scoped: <T>(query: QueryInput) => Promise<QueryOutput<T>>;
    unscoped: (query: QueryInput) => Promise<UnscopedQueryOutput>;
}

export interface SearchActionBuilderSpec {

    /** SearchStore identifier */
    identifier: string;

    /** Service */
    service: SearchActionService;

    /** Function that get the associated search store value. */
    getSearchOptions: () => AdvancedSearch;

    /**  Number of elements to request on each search. */
    nbSearchElement?: number;
}

export interface Context<T> {
    isScroll: boolean;
    results: Results<T>;
    totalCount?: number;
    nbSearchElement?: number;
}

/**
 * Search action generated from the config.
 * @param config Action configuration.
 */
export default function searchAction(config: SearchActionBuilderSpec) {

    function dispatchResult(data: AdvancedSearch) {
        dispatcher.handleServerAction({
            data,
            type: "update",
            identifier: config.identifier
        });
    }

    return async function searchAction(isScroll?: boolean) {
        let {
            scope, query, selectedFacets,
            groupingKey, sortBy, sortAsc,
            results, totalCount
        } = config.getSearchOptions();

        const {nbSearchElement} = config;

        if (!results || isScroll === undefined || !scope) {
            return;
        }

        if (!query || "" === query) {
            query = "*";
        }

        const data = Object.assign({},
            buildPagination({results, totalCount, isScroll, nbSearchElement}),
            buildOrderAndSort({sortBy, sortAsc}),
        {
            criteria: {query, scope},
            facets: selectedFacets ? buildFacets(selectedFacets) : {},
            group: groupingKey || ""
        });

        if (scope.toUpperCase() === "ALL") {
            const response = await config.service.unscoped(data);
            dispatchResult(unscopedResponse(response));
        } else {
            const response = await config.service.scoped(data);
            dispatchResult(scopedResponse(response, {isScroll, scope, results}));
        }
    };
};
