import {debounce, flatten} from "lodash";
import {action, computed, IObservableArray, observable, reaction, runInAction} from "mobx";

import {config} from "../../config";
import {buildEntityEntry, Entity, EntityField, StoreNode, toFlatValues, validate} from "../../entity";

import {ListStoreBase} from "./base";
import {FacetOutput, GroupResult, QueryInput, QueryOutput} from "./types";

/** Définition d'un service de recherche. */
export type SearchService<T = any, C = {}> = (query: QueryInput<C>) => Promise<QueryOutput<T, C>>;

/** Critères génériques de recherche. */
export interface SearchProperties {
    /** Critère personnalisé. */
    criteria?: {};
    /** Champ texte. */
    query?: string;
    /** Champ sur lequel grouper. */
    groupingKey?: string;
    /** Facettes sélectionnées ({facet: value}) */
    selectedFacets?: {[facet: string]: string[]};
    /** Tri croissant. */
    sortAsc?: boolean;
    /** Champ sur lequel trier. */
    sortBy?: string;
    /** Nombre de résultats à retourner par requête. */
    top?: number;
}

/** Store de recherche. Contient les critères/facettes ainsi que les résultats, et s'occupe des recherches. */
export class SearchStore<T = any, C extends StoreNode = any> extends ListStoreBase<T> {
    /** Bloque la recherche (la recherche s'effectuera lorsque elle repassera à false) */
    @observable blockSearch = false;

    /** StoreNode contenant les critères personnalisés de recherche. */
    readonly criteria!: C;
    /** Champ sur lequel grouper. */
    @observable groupingKey: string | undefined;
    /** Facettes sélectionnées ({facet: value}) */
    @observable.ref selectedFacets: {[facet: string]: string[]} = {};
    /** Nombre maximum de résultat par requête serveur. */
    @observable top = 50;

    /** Facettes résultat de la recherche. */
    readonly facets: IObservableArray<FacetOutput> = observable([]);
    /** Résultats de la recherche, si elle retourne des groupes. */
    readonly groups: IObservableArray<GroupResult<T>> = observable([]);
    /** Résultats de la recherche, si elle retourne une liste. */
    readonly list: IObservableArray<T> = observable([]);

    /** Service de recherche. */
    readonly service: SearchService<T>;

    /** Nombre de requêtes serveur en cours. */
    @observable private pendingCount = 0;

    /** Nombre d'éléments dans le résultat, d'après la requête serveur. */
    @observable private serverCount = 0;

    constructor(
        service: SearchService<T>,
        criteria?: [C, Entity],
        initialQuery?: SearchProperties & {debounceCriteria?: boolean}
    );
    /**
     * Crée un nouveau store de recherche.
     * @param initialQuery Les paramètres de recherche à l'initilisation.
     * @param service Le service de recherche.
     * @param criteria La description du critère de recherche personnalisé.
     */
    constructor(
        service: SearchService<T>,
        initialQuery?: SearchProperties & {debounceCriteria?: boolean},
        criteria?: [C, Entity]
    );
    constructor(
        service: SearchService<T>,
        secondParam?: SearchProperties & {debounceCriteria?: boolean} | [C, Entity],
        thirdParam?: SearchProperties & {debounceCriteria?: boolean} | [C, Entity]
    ) {
        super();
        this.service = service;

        // On gère les paramètres du constructeur dans les deux ordres.
        const initialQuery = (!Array.isArray(secondParam) && secondParam) || (!Array.isArray(thirdParam) && thirdParam);
        const criteria = (Array.isArray(secondParam) && secondParam) || (Array.isArray(thirdParam) && thirdParam);

        if (initialQuery) {
            this.setProperties(initialQuery);
        }

        // On construit le StoreNode à partir de la définition de critère, comme dans un EntityStore.
        if (criteria) {
            this.criteria = buildEntityEntry({criteria: {} as any}, {criteria: criteria[1]}, {}, "criteria") as any;
        }

        // Relance la recherche à chaque modification de propriété.
        reaction(
            () => [
                this.blockSearch,
                this.groupingKey,
                this.selectedFacets,
                !initialQuery || !initialQuery.debounceCriteria ? this.flatCriteria : undefined, // On peut choisir de debouncer ou non les critères personnalisés, par défaut ils ne le sont pas.
                this.sortAsc,
                this.sortBy
            ],
            () => this.search()
        );

        // Pour les champs texte, on utilise la recherche "debouncée" pour ne pas surcharger le serveur.
        reaction(
            () => [
                initialQuery && initialQuery.debounceCriteria ? this.flatCriteria : undefined, // Par exemple, si les critères sont entrés comme du texte ça peut être utile.
                this.query
            ],
            debounce(() => this.search(), config.textSearchDelay)
        );
    }

    /** Store en chargement. */
    @computed
    get isLoading() {
        return this.pendingCount > 0;
    }

    /** Nombre d'éléments récupérés depuis le serveur. */
    @computed
    get currentCount() {
        return this.flatResultList.length;
    }

    /** Liste de tous les résultats mis à plat depuis les différents groupes. */
    @computed
    get flatResultList() {
        if (this.groups.length) {
            return flatten(this.groups.map(g => g.list.slice()));
        } else {
            return this.list;
        }
    }

    /** Label du groupe choisi. */
    @computed
    get groupingLabel() {
        const group = this.facets.find(facet => facet.code === this.groupingKey);
        return (group && group.label) || this.groupingKey;
    }

    /** Nombre total de résultats de la recherche (pas forcément récupérés). */
    @computed
    get totalCount() {
        return this.serverCount;
    }

    /** Liste des éléments sélectionnables. */
    @computed.struct
    get selectionnableList() {
        return this.flatResultList.filter(this.isItemSelectionnable);
    }

    /** Objet contenant toutes les erreurs de validation des critères personnalisés. */
    @computed.struct
    get criteriaErrors() {
        const errors: {[key: string]: boolean} = {};
        const {criteria = {}} = this;
        for (const key in criteria) {
            if (key !== "set" && key !== "clear") {
                const entry = (criteria as any)[key] as EntityField<any>;
                const {
                    $entity: {domain},
                    value
                } = entry;
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

    /** Récupère l'objet de critères personnalisé à plat (sans le StoreNode) */
    @computed.struct
    get flatCriteria() {
        const criteria = this.criteria && toFlatValues(this.criteria);
        if (criteria) {
            // On enlève les critères en erreur.
            for (const error in this.criteriaErrors) {
                if (this.criteriaErrors[error]) {
                    delete (criteria as any)[error];
                }
            }

            // On enlève les critères non renseignés.
            for (const criteriaKey in criteria) {
                if ((criteria as any)[criteriaKey] === "" || (criteria as any)[criteriaKey] === undefined) {
                    delete (criteria as any)[criteriaKey];
                }
            }
        }
        return criteria || {};
    }

    /** Vide les résultats de recherche. */
    @action.bound
    clear() {
        this.serverCount = 0;
        this.selectedItems.clear();
        this.facets.clear();
        this.list.clear();
        this.groups.clear();
    }

    /**
     * Effectue la recherche.
     * @param isScroll Récupère la suite des résultats.
     */
    @action.bound
    async search(isScroll = false) {
        if (this.blockSearch) {
            /* tslint:disable */ return; /* tslint:enable */
        }

        const {query, selectedFacets, groupingKey, sortBy, sortAsc, list, top} = this;

        const data = {
            criteria: {...this.flatCriteria, query: query || "*"} as QueryInput<C>["criteria"],
            facets: selectedFacets || {},
            group: groupingKey || "",
            skip: (isScroll && list.length) || 0, // On skip les résultats qu'on a déjà si `isScroll = true`
            sortDesc: sortAsc === undefined ? false : !sortAsc,
            sortFieldName: sortBy,
            top
        };

        this.pendingCount++;

        // On vide les éléments sélectionnés avant de rechercher à nouveau, pour ne pas avoir d'état de sélection incohérent.
        if (!isScroll) {
            this.selectedItems.clear();
        }

        const response = await this.service(data);

        runInAction(() => {
            this.pendingCount--;

            // On ajoute les résultats à la suite des anciens si on scrolle, sachant qu'on ne peut pas scroller si on est groupé, donc c'est bien toujours la liste.
            if (isScroll) {
                this.list.push(...(response.list || []));
            } else {
                this.list.replace(response.list || []);
            }

            this.facets.replace(response.facets);
            this.groups.replace(response.groups || []);
            this.serverCount = response.totalCount;
        });

        return response;
    }

    /**
     * Met à jour plusieurs critères de recherche.
     * @param props Les propriétés à mettre à jour.
     */
    @action.bound
    setProperties(props: SearchProperties) {
        this.groupingKey = props.hasOwnProperty("groupingKey") ? props.groupingKey : this.groupingKey;
        this.selectedFacets = props.selectedFacets || this.selectedFacets;
        this.sortAsc = props.sortAsc !== undefined ? props.sortAsc : this.sortAsc;
        this.sortBy = props.hasOwnProperty("sortBy") ? props.sortBy : this.sortBy;
        this.query = props.query || this.query;
        this.top = props.top || this.top;

        if (this.criteria && props.criteria) {
            this.criteria.set(props.criteria);
        }
    }

    /**
     * Construit un store de recherche partiel pour l'affichage en groupe : utilisé par l'ActionBar du groupe ainsi que sa liste.
     * @param groupCode Le code de la valeur de groupe en cours.
     */
    getSearchGroupStore(groupCode: string): ListStoreBase<T> {
        // tslint:disable-next-line:no-this-assignment
        const store = this;
        return observable(
            {
                get currentCount() {
                    return store.groups.find(result => result.code === groupCode)!.totalCount || 0;
                },

                get totalCount() {
                    return store.groups.find(result => result.code === groupCode)!.totalCount || 0;
                },

                isItemSelectionnable: store.isItemSelectionnable,

                get list() {
                    const resultGroup = store.groups.find(result => result.code === groupCode);
                    return (resultGroup && resultGroup.list) || [];
                },

                get selectionnableList(): T[] {
                    return this.list.filter(store.isItemSelectionnable);
                },

                get selectedItems() {
                    return new Set(store.selectedList.filter(item => this.list.find((i: T) => i === item)));
                },

                get selectionStatus() {
                    if (this.selectedItems.size === 0) {
                        return "none";
                    } else if (this.selectedItems.size === this.selectionnableList.length) {
                        return "selected";
                    } else {
                        return "partial";
                    }
                },

                toggle(item: T) {
                    store.toggle(item);
                },

                // Non immédiat car le set de sélection contient tous les résultats alors que le toggleAll ne doit agir que sur le groupe.
                toggleAll() {
                    const areAllItemsIn = this.selectionnableList.every(item => store.selectedItems.has(item));

                    this.list.forEach(item => {
                        if (store.selectedItems.has(item)) {
                            store.selectedItems.delete(item);
                        }
                    });

                    if (!areAllItemsIn) {
                        this.selectionnableList.forEach(item => store.selectedItems.add(item));
                    }
                }
            },
            {
                toggle: action.bound,
                toggleAll: action.bound
            }
        ) as any;
    }
}

export function isSearch<T>(store: ListStoreBase<T>): store is SearchStore<T> {
    return store.hasOwnProperty("groupingKey");
}
