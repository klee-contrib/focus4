import {OutputFacet, QueryOutput, UnscopedQueryOutput} from "./types";
import {Context} from "./";
import {AdvancedSearch, StoreFacets} from "../../store/search/advanced-search";
import {isArray} from "lodash";

function parseFacets(serverFacets: OutputFacet[]) {
    return serverFacets.reduce((formattedFacets, facet) => {
        const facetName = Object.keys(facet)[0];
        const values = facet[facetName];
        return [...formattedFacets, {code: facetName, label: facetName, values}];
    }, [] as StoreFacets);
}

export function unscopedResponse(data: UnscopedQueryOutput): AdvancedSearch {
    // Results are always stored as an array.
    return ({
        results: data.groups,
        facets: parseFacets(data.facets),
        totalCount: data.totalCount
    });
};

export function scopedResponse<T>(data: QueryOutput<T>, context: Context<T> & {scope: string}): AdvancedSearch {
    // Results are stored as an object if their is no groups.
    if (context.isScroll && !isArray(context.results)) {
        let resultsKeys = Object.keys(context.results);
        let key = resultsKeys[0];
        data.list = [...context.results[key], ...(data.list ? data.list : [])];
    }
    return ({
        results: data.groups || {[context.scope]: data.list || []},
        facets: parseFacets(data.facets),
        totalCount: data.totalCount
    });
};
