import {mapValues} from "lodash";
import {InputFacet} from "./types";

export interface Context<T> {
    isScroll: boolean;
    results: {[key: string]: T[]};
    totalCount?: number;
    nbSearchElement?: number;
}

export function buildFacets(facets: {[key: string]: InputFacet}): {[key: string]: string} {
    return mapValues(facets, facetData => {
        return facetData.key;
    });
};

export function buildOrderAndSort({sortBy, sortAsc}: {sortBy?: string, sortAsc?: boolean}) {
    return {
        sortFieldName: sortBy,
        sortDesc: sortAsc === undefined ? false : !sortAsc
    };
}

export function buildPagination(opts: Context<any>) {
    const resultsKeys = Object.keys(opts.results);
    if (opts.isScroll && resultsKeys.length === 1) {
        const key = resultsKeys[0];
        const previousRes = opts.results[key];
        return {
            top: opts.nbSearchElement || 0,
            skip: previousRes.length
        };
    } else {
        return {
            skip: 0,
            top: opts.nbSearchElement || 0
        };
    }
};
