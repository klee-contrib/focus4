import {autobind} from "core-decorators";
import {flatten} from "lodash";
import {action, computed, IObservableArray, observable, reaction} from "mobx";

import {ListStoreBase} from "../list";

import {FacetOutput, GroupResult, QueryInput, QueryOutput, UnscopedQueryOutput} from "./types";

export interface SearchActionServices {
    scoped?: <T>(query: QueryInput) => Promise<QueryOutput<T>>;
    unscoped?: (query: QueryInput) => Promise<UnscopedQueryOutput>;
}

@autobind
export class SearchStore extends ListStoreBase<any> {
    @observable groupingKey: string | undefined;
    @observable scope = "ALL";
    @observable selectedFacets: {[facet: string]: string} = {};

    readonly facets: IObservableArray<FacetOutput> = observable([]);
    readonly results: IObservableArray<GroupResult<{}>> = observable([]);

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
    get groupingLabel() {
        return this.facets.find(facet => facet.code === this.groupingKey).label;
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
            skip: isScroll && results.length === 1 ? results[0].list.length : 0,
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            sortFieldName: sortBy,
            top
        };

        let response;

        this.pendingCount++;
        if (scope.toUpperCase() === "ALL") {
            if (this.services.unscoped) {
                response = await this.services.unscoped(data);
            } else {
                throw new Error("Impossible de lancer une recherche non scopée puisque le service correspondant n'a pas été défini.");
            }
        } else {
            if (this.services.scoped) {
                response = scopedResponse(await this.services.scoped(data), results, isScroll);
            } else {
                throw new Error("Impossible de lancer une recherche scopée puisque le service correspondant n'a pas été défini.");
            }
        }
        this.pendingCount--;

        this.selectedList.clear();
        this.facets.replace(response.facets);
        this.results.replace(response.groups);
        this.serverCount = response.totalCount;
    }

    @action
    toggleAll() {
        if (this.selectedItems.size === this.currentCount) {
            this.selectedList.clear();
        } else {
            this.selectedList.replace(this.flatResultList);
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
            this.groupingKey = props.hasOwnProperty("groupingKey") ? props.groupingKey : this.groupingKey;
            this.selectedFacets = props.selectedFacets || this.selectedFacets;
            this.sortAsc = props.sortAsc || this.sortAsc;
            this.sortBy = props.hasOwnProperty("sortBy") ? props.sortBy : this.sortBy;
        }

        this.query = props.query || this.query;
        this.scope = props.scope || this.scope;
    }

    getListByGroupCode(groupCode: string) {
        const resultGroup = this.results.find(result => result.code === groupCode);
        return resultGroup && resultGroup.list || [];
    }

    @computed
    private get flatResultList() {
        return flatten(this.results.map(g => g.list.slice()));
    }
}

function scopedResponse<T>(data: QueryOutput<T>, results: GroupResult<T>[], isScroll?: boolean) {
    if (isScroll && data.list) {
        data.list = [...results[0].list, ...data.list];
    }
    return ({
        facets: data.facets,
        groups: data.groups || [{list: data.list} as GroupResult<T>],
        totalCount: data.totalCount
    });
}
