import {autobind} from "core-decorators";
import {action, computed, IObservableArray, isObservableArray, observable, reaction} from "mobx";

import {ListStoreBase} from "../list";

import {OutputFacet, QueryInput, QueryOutput, Results, StoreFacet, UnscopedQueryOutput} from "./types";

export interface SearchActionService {
    scoped?: <T>(query: QueryInput) => Promise<QueryOutput<T>>;
    unscoped?: (query: QueryInput) => Promise<UnscopedQueryOutput>;
}

@autobind
export class SearchStore extends ListStoreBase<any> {
    @observable query = "";
    @observable scope = "ALL";

    @observable groupingKey: string | undefined;
    @observable selectedFacets: {[facet: string]: string} | undefined;

    @observable facets: IObservableArray<StoreFacet> = [] as any;
    @observable results: Results<{}> = [] as any;

    private service: SearchActionService;

    constructor(service: SearchActionService) {
        super();
        this.service = service;

        // Relance la recherche à chaque modification de propriété.
        reaction(() => [
            this.groupingKey,
            this.query,
            this.scope,
            this.selectedFacets,
            this.sortAsc,
            this.sortBy
        ], () => this.search());
    }

    @computed
    get totalCount() {
        return this.serverCount;
    }

    @action
    async search(isScroll?: boolean) {
        let {query} = this;
        const {scope, selectedFacets, groupingKey, sortBy, sortAsc, results, totalCount, top} = this;

        if (!query || "" === query) {
            query = "*";
        }

        const data = {
            ...buildPagination({results, totalCount, isScroll, top}),
            criteria: {query, scope},
            facets: selectedFacets || {},
            group: groupingKey || "",
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            sortFieldName: sortBy
        };

        let response;

        this.pendingCount++;
        if (scope.toUpperCase() === "ALL") {
            if (this.service.unscoped) {
                response = unscopedResponse(await this.service.unscoped(data));
            } else {
                throw new Error("Impossible de lancer une recherche non scopée puisque le service correspondant n'a pas été défini.");
            }
        } else {
            if (this.service.scoped) {
                response = scopedResponse(await this.service.scoped(data), {isScroll, scope, results});
            } else {
                throw new Error("Impossible de lancer une recherche scopée puisque le service correspondant n'a pas été défini.");
            }
        }
        this.pendingCount--;

        this.facets = response.facets as IObservableArray<StoreFacet>;
        this.results = response.results as Results<{}>;
        this.serverCount = response.totalCount;
    }

    @action
    toggleAll() {
        if (this.selectedItems.size) {
            // TODO
            // this.selectedList.replace(this.results);
        } else {
            this.selectedList.clear();
        }
    }

    @action
    setProperties(props: {query?: string, scope?: string, groupingKey?: string, selectedFacets?: {[facet: string]: string}, sortAsc?: boolean, sortBy?: string}) {
        if (props.scope && props.scope !== this.scope) {
            this.selectedFacets = {};
            this.groupingKey = props.groupingKey;
            this.sortAsc = props.sortAsc || false;
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

function buildPagination(opts: {results: Results<{}>, totalCount: number, isScroll?: boolean, top?: number}) {
    const resultsKeys = Object.keys(opts.results);
    if (opts.isScroll && !isObservableArray(opts.results) && resultsKeys.length === 1) {
        const key = resultsKeys[0];
        const previousRes = opts.results[key];
        return {
            skip: previousRes.length,
            top: opts.top || 0
        };
    } else {
        return {
            skip: 0,
            top: opts.top || 0
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
    if (context.isScroll && !isObservableArray(context.results)) {
        const resultsKeys = Object.keys(context.results);
        const key = resultsKeys[0];
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
