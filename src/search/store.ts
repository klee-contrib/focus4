import {autobind} from "core-decorators";
import {flatten} from "lodash";
import {debounce} from "lodash-decorators";
import {action, computed, IObservableArray, observable, reaction} from "mobx";

import {buildEntityEntry, Entity, EntityField, StoreNode, toFlatValues, validate} from "../entity";
import {ListStoreBase, MiniListStore} from "../list";

import {FacetOutput, GroupResult, QueryInput, QueryOutput, UnscopedQueryOutput} from "./types";

export interface SearchActionServices {
    scoped?: <T, C = {}>(query: QueryInput<{}>) => Promise<QueryOutput<T, C>>;
    unscoped?: <C = {}>(query: QueryInput<{}>) => Promise<UnscopedQueryOutput<C>>;
}

@autobind
export class SearchStore<C extends StoreNode<{}>> extends ListStoreBase<any> {

    @observable blockSearch = false;

    @observable readonly criteria?: C;
    @observable groupingKey: string | undefined;
    @observable scope = "ALL";
    @observable selectedFacets: {[facet: string]: string} = {};

    readonly facets: IObservableArray<FacetOutput> = observable([]);
    readonly results: IObservableArray<GroupResult<{}>> = observable([]);

    services: SearchActionServices;

    constructor(services: SearchActionServices, criteriaEntity?: Entity) {
        super();
        this.services = services;
        if (criteriaEntity) {
            this.criteria = buildEntityEntry({criteria: {} as any}, {criteria: criteriaEntity}, {}, "criteria") as any;
        }

        // Relance la recherche à chaque modification de propriété.
        reaction(() => [
            this.blockSearch,
            this.flatCriteria,
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
    get flatResultList() {
        return flatten(this.results.map(g => g.list.slice()));
    }

    @computed
    get groupingLabel() {
        return this.facets.find(facet => facet.code === this.groupingKey).label;
    }

    @computed
    get totalCount() {
        return this.serverCount;
    }

    @computed.struct
    get criteriaErrors() {
        const errors: {[key: string]: boolean} = {};
        const {criteria = {}} = this;
        for (const key in criteria) {
            if (key !== "set" && key !== "clear") {
                const entry = ((criteria as any)[key] as EntityField<any>);
                const {$entity: {domain}, value} = entry;
                if (domain && domain.validator && value !== undefined && value !== null) {
                    const validStat = validate({value, name: ""}, domain.validator);
                    if (validStat.errors.length) {
                        errors[key] = true;
                        continue;
                    }
                }
                errors[key] = false;
            }
        }
        return errors;
    }

    @computed.struct
    get flatCriteria() {
        const criteria = this.criteria && toFlatValues(this.criteria);
        if (criteria) {
            for (const error in this.criteriaErrors) {
                if (this.criteriaErrors[error]) {
                    delete (criteria as any)[error];
                }
            }

            for (const criteriaKey in criteria) {
                if (!(criteria as any)[criteriaKey]) {
                    delete (criteria as any)[criteriaKey];
                }
            }
        }
        return criteria || {};
    }

    @debounce(200)
    @action
    async search(isScroll = false) {
        if (this.blockSearch) {
            /* tslint:disable */ return; /* tslint:enable */
        }

        let {query} = this;
        const {scope, selectedFacets, groupingKey, sortBy, sortAsc, results, top} = this;

        if (!query || query === "") {
            query = "*";
        }

        const data = {
            criteria: {...this.flatCriteria, query, scope} as QueryInput<C>["criteria"],
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

    getSearchGroupStore(groupCode: string): MiniListStore<any> {
        const store = this;
        const searchGroupStore = {
            get currentCount() {
                return store.results.find(result => result.code === groupCode).totalCount || 0;
            },
            get totalCount() {
                return store.results.find(result => result.code === groupCode).totalCount || 0;
            },
            toggle(item: any) {
                store.toggle(item);
            },
            get list() {
                const resultGroup = store.results.find(result => result.code === groupCode);
                return resultGroup && resultGroup.list || [];
            }
        } as any as MiniListStore<any>;

        searchGroupStore.toggleAll = action(function() {
            const areAllItemsIn = searchGroupStore.list!.every(item => store.selectedItems.has(item));

            searchGroupStore.list!.forEach(item => {
                if (store.selectedItems.has(item)) {
                    store.selectedList.remove(item);
                }
            });

            if (!areAllItemsIn) {
                store.selectedList.push(...searchGroupStore.list!);
            }
        });

        const selectedItems = computed(() =>
            new Set(store.selectedList.filter(item => searchGroupStore.list!.find(i => i === item))));

        const selectionStatus = computed(() => {
             if (selectedItems.get().size === 0) {
                return "none";
            } else if (selectedItems.get().size === searchGroupStore.totalCount) {
                return "selected";
            } else {
                return "partial";
            }
        });

        searchGroupStore.selectedItems = selectedItems as any;
        searchGroupStore.selectionStatus = selectionStatus as any;
        return observable(searchGroupStore);
    }
}

function scopedResponse<T, C>(data: QueryOutput<T, C>, results: GroupResult<T>[], isScroll?: boolean) {
    if (isScroll && data.list) {
        data.list = [...results[0].list, ...data.list];
    }
    return ({
        facets: data.facets,
        groups: data.groups || [{list: data.list} as GroupResult<T>],
        totalCount: data.totalCount
    });
}
