import {isString, orderBy} from "es-toolkit";
import {action, computed, isObservableArray} from "mobx";

import {isEntityField} from "../entity";

import {CollectionStore} from "./base";
import {CollectionStoreProperties, LocalCollectionStoreConfig, LocalFacetDefinition} from "./types";

/**
 * Store de collection local, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes côté client.
 * La liste pourra être renseignée manuellement via une affectation à la propriété `list` du store, ou vient en utilisant `useLoad`.
 */
export class LocalCollectionStore<T extends object = any> extends CollectionStore<T> {
    /** Config du store local. */
    private readonly config: LocalCollectionStoreConfig<T>;

    /** @internal */
    /** Service de chargement posé par un `useLoad()`, en mode local. */
    localLoadService?: () => Promise<void>;

    /* @internal */
    constructor(config: Partial<LocalCollectionStoreConfig<T>> = {}) {
        super();
        config.searchFields ??= [];
        config.facetDefinitions ??= [];
        this.config = config as LocalCollectionStoreConfig<T>;
    }

    // oxlint-disable-next-line class-methods-use-this
    override get type(): "local" {
        return "local";
    }

    override get availableSearchFields() {
        return this.config.searchFields;
    }

    @computed
    override get facets() {
        return this.config.facetDefinitions.map(
            ({
                code,
                fieldName,
                label,
                isMultiSelectable = false,
                canExclude = false,
                displayFormatter = x => x,
                ordering = "count-desc"
            }) => {
                let list: T[] = this.innerList;

                // Filtrage simple, sur les champs choisis.
                if (this.availableSearchFields.length > 0) {
                    list = list.filter(item => this.filterItemByFilters(item));
                }

                // Facettes
                list = list.filter(item =>
                    this.config.facetDefinitions
                        .filter(facet => !facet.isMultiSelectable || facet.code !== code)
                        .every(facet => this.filterItemByFacet(item, facet))
                );

                return {
                    code,
                    label,
                    isMultiSelectable,
                    isMultiValued: false,
                    canExclude,
                    values: orderBy(
                        Object.entries(groupByFacet(list, fieldName))
                            .map(([value, items]) => ({
                                code: value,
                                label: value === "<null>" ? "focus.search.results.missing" : displayFormatter(value),
                                count: items.length
                            }))
                            .filter(f => f.count !== 0),
                        [f => (ordering.includes("count") ? f.count : f.code)],
                        [ordering.includes("desc") ? "desc" : "asc"]
                    )
                };
            }
        );
    }

    @computed
    override get groups() {
        if (!this.groupingKey || !this.config.facetDefinitions.length) {
            return [];
        }

        return Object.entries(
            groupByFacet(
                this.list,
                // oxlint-disable-next-line no-non-null-asserted-optional-chain
                this.config.facetDefinitions.find(f => f.code === this.groupingKey)?.fieldName!
            )
        ).map(([code, list]) => ({
            code,
            label: this.facets.find(f => f.code === this.groupingKey)?.values.find(v => v.code === code)?.label ?? code,
            list,
            totalCount: list.length
        }));
    }

    @computed
    override get list(): T[] {
        let list: T[] = this.innerList;

        // Tri.
        if (this.sort.length > 0) {
            list = orderBy(
                this.innerList,
                this.sort.map(
                    ({fieldName}) =>
                        item =>
                            item[fieldName as keyof T]
                ),
                this.sort.map(({sortDesc}) => (sortDesc ? "desc" : "asc"))
            );
        }

        // Filtrage simple, sur les champs choisis.
        if (this.availableSearchFields.length > 0) {
            list = list.filter(item => this.filterItemByFilters(item));
        }

        // Facettes
        if (this.config.facetDefinitions.length > 0) {
            list = list.filter(item =>
                this.config.facetDefinitions.every(facet => this.filterItemByFacet(item, facet))
            );
        }

        return list;
    }

    set list(list) {
        this.innerList.replace(list);
    }

    @computed
    override get totalCount() {
        return this.currentCount;
    }

    @action.bound
    override async search() {
        if (this.localLoadService) {
            await this.localLoadService();
            return;
        }
    }

    /**
     * Met à jour plusieurs critères de recherche.
     * @param props Les propriétés à mettre à jour.
     */
    @action.bound
    setProperties(props: CollectionStoreProperties) {
        this.groupingKey = props.hasOwnProperty("groupingKey") ? props.groupingKey : this.groupingKey;
        this.searchFields = props.hasOwnProperty("searchFields") ? props.searchFields : this.searchFields;
        if (props.inputFacets) {
            this.innerInputFacets.replace(props.inputFacets);
        }
        this.sort = props.sort ?? this.sort;
        this.query = props.query ?? this.query;
    }

    private filterItemByFacet(item: T, facet: LocalFacetDefinition<T>) {
        const inputFacet = this.innerInputFacets.get(facet.code);
        if (!inputFacet) {
            return true;
        }

        const {selected = [], excluded = []} = inputFacet;
        const itemValue = item[facet.fieldName];

        if (selected.length) {
            return selected.some(facetValue => isFacetMatch(facetValue, itemValue));
        } else if (excluded.length) {
            return excluded.every(facetValue => !isFacetMatch(facetValue, itemValue));
        } else {
            return true;
        }
    }

    private filterItemByFilters(item: T) {
        if (!this.query) {
            return true;
        }

        return (this.searchFields ?? this.availableSearchFields).some(filter => {
            let field = item[filter as keyof T];
            if (isEntityField(field)) {
                field = field.value;
            }

            if (isString(field)) {
                return field.toLowerCase().includes(this.query.toLowerCase());
            } else {
                return false;
            }
        });
    }
}

/**
 * Crée un store de collection local, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes côté client.
 * La liste pourra être renseignée manuellement via une affectation à la propriété `list` du store, ou vient en utilisant `useLoad`.
 * @param config Configuration du store local.
 */
export function makeLocalCollectionStore<T extends object>(config?: Partial<LocalCollectionStoreConfig<T>>) {
    return new LocalCollectionStore<T>(config);
}

function groupByFacet<T>(list: T[], fieldName: keyof T) {
    return list.reduce(
        (buckets, item) => {
            let value = item[fieldName];
            if (isEntityField(value)) {
                value = value.value;
            }

            function add(key?: any) {
                buckets[`${key ?? "<null>"}`] = [...(buckets[`${key ?? "<null>"}`] ?? []), item];
            }

            if (Array.isArray(value) || isObservableArray(value)) {
                if (value.length === 0) {
                    add();
                } else {
                    for (const i of value) {
                        add(i);
                    }
                }
            } else {
                add(value);
            }
            return buckets;
        },
        {} as Record<string, T[]>
    );
}

function isFacetMatch(facetValue: string, itemValue: any): boolean {
    if (Array.isArray(itemValue) || isObservableArray(itemValue)) {
        if (facetValue === "<null>") {
            return itemValue.length === 0;
        }

        if (itemValue.length === 0) {
            return !facetValue;
        }

        return itemValue.some(v => isFacetMatch(facetValue, v));
    }

    if (facetValue === "<null>") {
        return !itemValue && itemValue !== 0;
    }

    if (typeof itemValue === "number") {
        return itemValue === (Number.parseFloat(facetValue) || undefined);
    }

    if (typeof itemValue === "boolean") {
        return itemValue === (facetValue === "true");
    }

    if (isEntityField(itemValue)) {
        return isFacetMatch(facetValue, itemValue.value);
    }

    if (!itemValue) {
        return !facetValue;
    }

    // oxlint-disable-next-line eqeqeq
    return itemValue == facetValue;
}
