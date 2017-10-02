import {autobind} from "core-decorators";
import {debounce, flatten} from "lodash";
import {action, computed, IObservableArray, observable, reaction} from "mobx";

import {config} from "../config";
import {buildEntityEntry, Entity, EntityField, StoreNode, toFlatValues, validate} from "../entity";
import {ListStoreBase, MiniListStore} from "../list";

import {FacetOutput, GroupResult, QueryInput, QueryOutput} from "./types";

export type SearchService<T = any> = (query: QueryInput) => Promise<QueryOutput<T>>;

export interface SearchProperties {
    query?: string;
    scope?: string;
    groupingKey?: string;
    selectedFacets?: {[facet: string]: string};
    sortAsc?: boolean;
    sortBy?: string;
    top?: number;
}

@autobind
export class SearchStore<T = any, C extends StoreNode = any> extends ListStoreBase<T> implements SearchProperties {

    @observable blockSearch = false;

    @observable readonly criteria: C;
    @observable groupingKey: string | undefined;
    @observable scope = "ALL";
    @observable selectedFacets: {[facet: string]: string} = {};

    readonly facets: IObservableArray<FacetOutput> = observable([]);
    readonly results: IObservableArray<GroupResult<T>> = observable([]);

    service: SearchService<T>;

    constructor(service: SearchService<T>, initialProperties: SearchProperties, criteria?: [C, Entity]) {
        super();
        this.service = service;
        this.setProperties(initialProperties);
        if (criteria) {
            this.criteria = buildEntityEntry({criteria: {} as any}, {criteria: criteria[1]}, {}, "criteria") as any;
        }

        // Relance la recherche à chaque modification de propriété.
        reaction(() => [
            this.blockSearch,
            this.groupingKey,
            this.scope,
            this.selectedFacets,
            this.sortAsc,
            this.sortBy
        ], () => this.search());

        // Pour les champs texte, on utilise la recherche "debouncée" pour ne pas surcharger le serveur.
        reaction(() => [
            this.flatCriteria,
            this.query
        ], debounce(() => this.search(), config.textSearchDelay));
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
                if ((criteria as any)[criteriaKey] === "" || (criteria as any)[criteriaKey] === undefined) {
                    delete (criteria as any)[criteriaKey];
                }
            }
        }
        return criteria || {};
    }

    @action
    clear() {
        this.serverCount = 0;
        this.facets.clear();
        this.results.clear();
    }

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

        this.pendingCount++;

        this.selectedList.clear();
        const response = await this.service(data);

        this.pendingCount--;

        if (isScroll && response.list) {
            response.list = [...results[0].list, ...response.list];
        }

        this.facets.replace(response.facets);
        this.results.replace(response.groups || [{list: response.list || []}]);
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
    setProperties(props: SearchProperties) {
        this.groupingKey = props.hasOwnProperty("groupingKey") ? props.groupingKey : this.groupingKey;
        this.selectedFacets = props.selectedFacets || this.selectedFacets;
        this.sortAsc = props.sortAsc !== undefined ? props.sortAsc : this.sortAsc;
        this.sortBy = props.hasOwnProperty("sortBy") ? props.sortBy as keyof T : this.sortBy;
        this.query = props.query || this.query;
        this.scope = props.scope || this.scope;
        this.top = props.top || this.top;
    }

    getSearchGroupStore(groupCode: string): MiniListStore<any> {
        // tslint:disable-next-line:no-this-assignment
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
