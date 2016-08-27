import {mapValues, isArray} from "lodash";

import {InputFacet} from "../types";
import {Context} from "./";

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

export function buildPagination(opts: Context<{}>) {
    const resultsKeys = Object.keys(opts.results);
    if (opts.isScroll && !isArray(opts.results) && resultsKeys.length === 1) {
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
