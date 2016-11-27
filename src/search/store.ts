import {autobind} from "core-decorators";
import {isArray} from "lodash";
import {action, computed, observable} from "mobx";

import {OutputFacet, QueryInput, QueryOutput, Results, StoreFacet, UnscopedQueryOutput} from "./types";

export interface SearchActionService {
    scoped: <T>(query: QueryInput) => Promise<QueryOutput<T>>;
    unscoped: (query: QueryInput) => Promise<UnscopedQueryOutput>;
}

@autobind
export class SearchStore {
    @observable query = "";
    @observable scope = "ALL";

    @observable groupingKey: string | undefined;
    @observable selectedFacets: {[facet: string]: string} | undefined;
    @observable sortAsc: boolean | undefined;
    @observable sortBy: string | undefined;

    @observable facets: StoreFacet[] = [];
    @observable results: Results<{}> = [];
    @observable totalCount = 0;

    @observable private pendingCount = 0;
    private service: SearchActionService;
    private nbSearchElement: number;

    constructor(service: SearchActionService, nbSearchElement?: number) {
        this.service = service;
        this.nbSearchElement = nbSearchElement || 50;
    }

    @computed
    get isLoading() {
        return this.pendingCount > 0;
    }

    @action
    async search(isScroll?: boolean) {
        let {scope, query, selectedFacets, groupingKey, sortBy, sortAsc, results, totalCount, nbSearchElement} = this;

        if (!results || isScroll === undefined || !scope) {
            return;
        }

        if (!query || "" === query) {
            query = "*";
        }

        const data = {
            ...buildPagination({results, totalCount, isScroll, nbSearchElement}),
            criteria: {query, scope},
            facets: selectedFacets || {},
            group: groupingKey || "",
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            sortFieldName: sortBy
        };

        let response: {facets: StoreFacet[], results: Results<{}>, totalCount: number};

        this.pendingCount++;
        if (scope.toUpperCase() === "ALL") {
            response = unscopedResponse(await this.service.unscoped(data));
        } else {
            response = scopedResponse(await this.service.scoped(data), {isScroll, scope, results});
        }
        this.pendingCount--;

        this.facets = response.facets;
        this.results = response.results;
        this.totalCount = response.totalCount;
    }

    @action
    setProperties(props: {query?: string, scope?: string, groupingKey?: string, selectedFacets?: {[facet: string]: string}, sortAsc?: boolean, sortBy?: string}) {
        if (props.scope && props.scope !== this.scope) {
            this.selectedFacets = {};
            this.groupingKey = props.groupingKey;
            this.sortAsc = props.sortAsc;
            this.sortBy = props.sortBy;
        } else {
            this.groupingKey = props.groupingKey || this.groupingKey;
            this.selectedFacets = props.selectedFacets || this.selectedFacets;
            this.sortAsc = props.sortAsc || this.sortAsc;
            this.sortBy = props.sortBy || this.sortBy;
        }

        this.query = props.query || this.query;
        this.scope = props.scope || this.scope;
    }
}

function buildPagination(opts: {results: Results<{}>, totalCount: number, isScroll?: boolean, nbSearchElement?: number}) {
    const resultsKeys = Object.keys(opts.results);
    if (opts.isScroll && !isArray(opts.results) && resultsKeys.length === 1) {
        const key = resultsKeys[0];
        const previousRes = opts.results[key];
        return {
            skip: previousRes.length,
            top: opts.nbSearchElement || 0
        };
    } else {
        return {
            skip: 0,
            top: opts.nbSearchElement || 0
        };
    }
};

function parseFacets(serverFacets: OutputFacet[]) {
    return serverFacets.reduce((formattedFacets, facet) => {
        const facetName = Object.keys(facet)[0];
        const values = facet[facetName];
        return [...formattedFacets, {code: facetName, label: facetName, values}];
    }, [] as StoreFacet[]);
}

function scopedResponse<T>(data: QueryOutput<T>, context: {results: Results<T>, isScroll?: boolean, scope: string}) {
    // Results are stored as an object if there is no group.
    if (context.isScroll && !isArray(context.results)) {
        let resultsKeys = Object.keys(context.results);
        let key = resultsKeys[0];
        data.list = [...context.results[key], ...(data.list ? data.list : [])];
    }
    return ({
        facets: parseFacets(data.facets),
        results: data.groups || {[context.scope]: data.list || []},
        totalCount: data.totalCount
    });
}

function unscopedResponse(data: UnscopedQueryOutput) {
    // Results are always stored as an array.
    return ({
        facets: parseFacets(data.facets),
        results: data.groups,
        totalCount: data.totalCount
    });
}
