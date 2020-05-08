import {debounce, flatten, isFunction, isString, orderBy} from "lodash";
import {action, computed, IObservableArray, observable, reaction, runInAction} from "mobx";

import {config} from "@focus4/core";

import {buildNode, FormEntityField, FormNode, nodeToFormNode, toFlatValues} from "../entity";
import {
    FacetItem,
    FacetOutput,
    GroupResult,
    QueryInput,
    QueryOutput,
    SearchProperties,
    SearchService,
    SelectionStatus
} from "./types";
export {FacetItem, FacetOutput, GroupResult, QueryInput, QueryOutput};

/** Store de recherche. Contient les critères/facettes ainsi que les résultats, et s'occupe des recherches. */
export class CollectionStore<T = any, C = any> {
    readonly type: "local" | "server";

    /** Bloque la recherche (la recherche s'effectuera lorsque elle repassera à false) */
    @observable blockSearch = false;
    /** Champ sur lequel grouper. */
    @observable groupingKey: string | undefined;
    /** Filtre texte. */
    @observable query = "";
    /** Facettes sélectionnées ({facet: value}) */
    @observable.ref selectedFacets: {[facet: string]: string[]} = {};
    /** Tri par ordre croissant. */
    @observable sortAsc = true;
    /** Nom du champ sur lequel trier. */
    @observable sortBy: string | undefined;
    /** Nombre maximum de résultat par requête serveur. */
    @observable top = 50;

    /** Permet d'omettre certains élements de la liste de la sélection. */
    @observable isItemSelectionnable: (data: T) => boolean = () => true;

    /** Set contenant les éléments sélectionnés. */
    readonly selectedItems = observable.set<T>();

    /** Liste des éléments séléctionnés */
    @computed
    get selectedList(): ReadonlyArray<T> {
        return Array.from(this.selectedItems);
    }

    /** Etat de la sélection (aucune, partielle, totale). */
    @computed
    get selectionStatus(): SelectionStatus {
        switch (this.selectedItems.size) {
            case 0:
                return "none";
            case this.selectionnableList.length:
                return "selected";
            default:
                return "partial";
        }
    }

    /** StoreNode contenant les critères personnalisés de recherche. */
    readonly criteria!: FormNode<C>;
    /** Facettes résultat de la recherche. */
    readonly facets: IObservableArray<FacetOutput> = observable([]);
    /** Résultats de la recherche, si elle retourne des groupes. */
    readonly groups: IObservableArray<GroupResult<T>> = observable([]);

    /** Liste brute (non triée, non filtrée) des données, fournie en local ou récupérée du serveur si recherche non groupée. */
    private readonly innerList: IObservableArray<T> = observable([]);
    /** Champs sur lequels on autorise le filtrage, en local. */
    private readonly filterFields?: (keyof T)[];

    /** La liste. */
    @computed
    get list(): T[] {
        if (this.type === "server") {
            if (this.groups.length) {
                return flatten(this.groups.map(g => g.list.slice()));
            } else {
                return this.innerList;
            }
        }

        let list;

        // Tri.
        if (this.sortBy) {
            list = orderBy(
                this.innerList,
                item => `${(item as any)[this.sortBy!]}`.toLowerCase(),
                this.sortAsc ? "asc" : "desc"
            );
        } else {
            list = this.innerList;
        }

        // Filtrage simple, sur les champs choisis.
        if (this.filterFields) {
            list = list.filter(item =>
                this.filterFields!.some(filter => {
                    const field = item[filter];
                    if (isString(field)) {
                        return field.toLowerCase().includes(this.query.toLowerCase()); // Pour faire simple, on compare tout en minuscule.
                    } else {
                        return false;
                    }
                })
            );
        }

        return list;
    }

    set list(list) {
        this.innerList.replace(list);
    }

    /** Service de recherche. */
    readonly service?: SearchService<T>;

    /** Nombre de requêtes serveur en cours. */
    @observable private pendingCount = 0;

    /** Nombre d'éléments dans le résultat, d'après la requête serveur. */
    @observable private serverCount = 0;

    /**
     * Crée un nouveau store de liste.
     * @param filterFields Les champs sur lesquels on peut filtrer.
     */
    constructor(filterFields?: (keyof T)[]);
    /**
     * Crée un nouveau store de recherche.
     * @param service Le service de recherche.
     * @param criteria La description du critère de recherche personnalisé.
     * @param initialQuery Les paramètres de recherche à l'initilisation.
     */
    constructor(
        service: SearchService<T>,
        criteria?: C,
        initialQuery?: SearchProperties<C> & {debounceCriteria?: boolean}
    );
    /**
     * Crée un nouveau store de recherche.
     * @param initialQuery Les paramètres de recherche à l'initilisation.
     * @param service Le service de recherche.
     * @param criteria La description du critère de recherche personnalisé.
     */
    constructor(
        service: SearchService<T>,
        initialQuery?: SearchProperties<C> & {debounceCriteria?: boolean},
        criteria?: C
    );
    constructor(
        firstParam?: SearchService<T> | (keyof T)[],
        secondParam?: (SearchProperties<C> & {debounceCriteria?: boolean}) | C,
        thirdParam?: (SearchProperties<C> & {debounceCriteria?: boolean}) | C
    ) {
        if (isFunction(firstParam)) {
            this.type = "server";
            this.service = firstParam;

            // On gère les paramètres du constructeur dans les deux ordres.
            let initialQuery: SearchProperties<C> & {debounceCriteria?: boolean};
            let criteria;

            if (secondParam && (secondParam as any)[Object.keys(secondParam)[0]].type) {
                criteria = secondParam as C;
                initialQuery = thirdParam as any;
            } else {
                initialQuery = secondParam as any;
                criteria = thirdParam as C;
            }

            // On construit le StoreNode à partir de la définition de critère, comme dans un EntityStore.
            if (criteria) {
                const node = buildNode(criteria);
                nodeToFormNode<C>(node, node);
                this.criteria = node as any;
            }

            if (initialQuery) {
                this.setProperties(initialQuery);
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
        } else {
            this.type = "local";
            this.filterFields = firstParam;
        }
    }

    /** Store en chargement. */
    @computed
    get isLoading() {
        return this.type === "local" ? undefined : this.pendingCount > 0;
    }

    /** Nombre d'éléments récupérés depuis le serveur. */
    @computed
    get currentCount() {
        return this.list.length;
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
        return this.type === "server" ? this.serverCount : this.currentCount;
    }

    /** Liste des éléments sélectionnables. */
    @computed.struct
    get selectionnableList() {
        return this.list.filter(this.isItemSelectionnable);
    }

    /** Objet contenant toutes les erreurs de validation des critères personnalisés. */
    @computed.struct
    get criteriaErrors() {
        const errors: {[key: string]: boolean} = {};
        const {criteria = {}} = this;
        for (const key in criteria) {
            if (key !== "set" && key !== "clear") {
                const entry = (criteria as any)[key] as FormEntityField;
                if (entry.error) {
                    errors[key] = true;
                    continue;
                }
                errors[key] = false;
            }
        }
        return errors;
    }

    /** Récupère l'objet de critères personnalisé à plat (sans le StoreNode) */
    @computed.struct
    get flatCriteria() {
        const criteria = this.criteria && (toFlatValues(this.criteria) as {});
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
        this.innerList.clear();
        this.groups.clear();
    }

    /**
     * Sélectionne ou déselectionne un item.
     * @param item L'item.
     */
    @action.bound
    toggle(item: T) {
        if (this.selectedItems.has(item)) {
            this.selectedItems.delete(item);
        } else if (this.isItemSelectionnable(item)) {
            this.selectedItems.add(item);
        }
    }

    /** Sélectionne ou déselectionne tous les éléments du store. */
    @action.bound
    toggleAll() {
        if (this.selectedItems.size === this.selectionnableList.length) {
            this.selectedItems.clear();
        } else {
            this.selectedItems.replace(this.selectionnableList);
        }
    }

    /**
     * Effectue la recherche.
     * @param isScroll Récupère la suite des résultats.
     */
    @action.bound
    async search(isScroll = false) {
        if (!this.service || this.blockSearch) {
            return;
        }

        const {query, selectedFacets, groupingKey, sortBy, sortAsc, list, top} = this;

        const data = {
            criteria: {...this.flatCriteria, query} as QueryInput<C>["criteria"],
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
                this.innerList.push(...(response.list || []));
            } else {
                this.innerList.replace(response.list || []);
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
    setProperties(props: SearchProperties<C>) {
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
    getSearchGroupStore(groupCode: string): CollectionStore<T> {
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
