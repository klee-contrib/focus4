import {OutputFacet, QueryOutput, UnscopedQueryOutput} from "./types";
import {Context} from "./builder";
import {AdvancedSearch, StoreFacets} from "../../store/search/advanced-search";

function parseFacets(serverFacets: OutputFacet[]) {
    return serverFacets.reduce((formattedFacets, facet) => {
        const facetName = Object.keys(facet)[0];
        const serverFacetData = facet[facetName];
        formattedFacets[facetName] = serverFacetData.reduce((facetData, serverFacetItem) => {
            facetData[serverFacetItem.code] = {
                label: serverFacetItem.label,
                count: serverFacetItem.count
            };
            return facetData;
        }, {} as {[code: string]: {count: number, label: string}});
        return formattedFacets;
    }, {} as StoreFacets);
}

export function unscopedResponse(data: UnscopedQueryOutput): AdvancedSearch {
    return ({
        results: data.groups,
        facets: parseFacets(data.facets),
        totalCount: data.totalCount
    });
};

export function scopedResponse<T>(data: QueryOutput<T>, context: Context<T> & {scope: string}): AdvancedSearch {
    if (context.isScroll) {
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
