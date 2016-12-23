import {autobind} from "core-decorators";
import {flatten, sumBy, values} from "lodash";
import {action, computed, IObservableArray, isObservableArray, observable, reaction} from "mobx";

import {ListStoreBase} from "../list";

import {OutputFacet, QueryInput, QueryOutput, Results, StoreFacet, UnscopedQueryOutput} from "./types";

export interface SearchActionServices {
    scoped?: <T>(query: QueryInput) => Promise<QueryOutput<T>>;
    unscoped?: (query: QueryInput) => Promise<UnscopedQueryOutput>;
}

@autobind
export class SearchStore extends ListStoreBase<any> {
    @observable query = "";
    @observable scope = "ALL";

    @observable selectedFacets: {[facet: string]: string} = {};

    @observable facets: IObservableArray<StoreFacet> = [] as any;
    @observable results: Results<{}> = [] as any;

    services: SearchActionServices;

    constructor(services: SearchActionServices) {
        super();
        this.services = services;

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
    get currentCount() {
        return this.flatResultList.length;
    }

    @computed
    get totalCount() {
        return this.serverCount;
    }

    @action
    async search(isScroll = false) {
        let {query} = this;
        const {scope, selectedFacets, groupingKey, sortBy, sortAsc, results, top} = this;

        if (!query || "" === query) {
            query = "*";
        }

        const data = {
            criteria: {query, scope},
            facets: selectedFacets || {},
            group: groupingKey || "",
            skip: buildPagination(isScroll, results),
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            sortFieldName: sortBy,
            top
        };

        let response;

        this.pendingCount++;
        if (scope.toUpperCase() === "ALL") {
            if (this.services.unscoped) {
                response = unscopedResponse(await this.services.unscoped(data));
            } else {
                throw new Error("Impossible de lancer une recherche non scopée puisque le service correspondant n'a pas été défini.");
            }
        } else {
            if (this.services.scoped) {
                response = scopedResponse(await this.services.scoped(data), {isScroll, scope, results});
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
            this.selectedList.replace(this.flatResultList);
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

    @computed
    private get flatResultList() {
        if (isObservableArray(this.results)) {
            return flatten(this.results.map(values).map(g => g.slice()));
        } else {
            return flatten(values(this.results).map(g => g.slice()));
        }
    }
}

function buildPagination(isScroll: boolean, results: Results<{}>) {
    if (isScroll && !isObservableArray(results)) {
        return sumBy(values(results), group => group.length);
    }
    return 0;
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
