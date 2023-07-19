import {debounce, flatten, isFunction, isString, orderBy, toPairs} from "lodash";
import {
    action,
    computed,
    IObservableArray,
    isObservableArray,
    makeObservable,
    observable,
    reaction,
    remove,
    runInAction,
    set,
    toJS
} from "mobx";
import {v4} from "uuid";

import {config} from "@focus4/core";

import {buildNode, FormEntityField, FormNode, isEntityField, nodeToFormNode, toFlatValues} from "../entity";

import {
    FacetInput,
    FacetItem,
    FacetOutput,
    GroupResult,
    InputFacets,
    LocalFacetDefinition,
    LocalStoreConfig,
    QueryInput,
    QueryOutput,
    SearchProperties,
    SearchService,
    SelectionStatus
} from "./types";
export {FacetItem, FacetOutput, GroupResult, InputFacets, QueryInput, QueryOutput};

/** Store de recherche. Contient les critères/facettes ainsi que les résultats, et s'occupe des recherches. */
export class CollectionStore<T = any, C = any> {
    /** Type de store. */
    readonly type: "local" | "server";

    /** Config du store local. */
    private readonly localStoreConfig?: LocalStoreConfig<T>;
    /** Service de recherche serveur. */
    private readonly service?: SearchService<T>;

    /** Liste des champs disponibles pour la recherche texte. */
    @observable.ref availableSearchFields: string[] = [];

    /** Facettes en entrée de la recherche. */
    private readonly innerInputFacets = observable.map<string, FacetInput>();
    /** Facettes résultat de la recherche. */
    private readonly innerFacets: IObservableArray<FacetOutput> = observable([]);
    /** Résultats de la recherche, si elle retourne des groupes. */
    private readonly innerGroups: IObservableArray<GroupResult<T>> = observable([]);
    /** Liste brute (non triée, non filtrée) des données, fournie en local ou récupérée du serveur si recherche non groupée. */
    private readonly innerList: IObservableArray<T> = observable([]);

    /** Identifiant de la requête en cours. */
    @observable private pendingQuery?: string;

    /** Nombre d'éléments dans le résultat, d'après la requête serveur. */
    @observable private serverCount = 0;

    /** Champ sur lequel grouper. */
    @observable groupingKey: string | undefined;
    /** Filtre texte. */
    @observable query = "";
    /** Liste des champs sur lesquels le champ texte filtre (si non renseigné : tous les champs disponibles). */
    @observable.ref searchFields: string[] | undefined;

    /** Facettes sélectionnées. */
    @computed.struct
    get inputFacets() {
        return Array.from(this.innerInputFacets.entries()).reduce(
            (res, [key, value]) => ({...res, [key]: toJS(value)}),
            {} as InputFacets
        );
    }

    /** Tri par ordre croissant. */
    @observable sortAsc = true;
    /** Nom du champ sur lequel trier. */
    @observable sortBy: string | undefined;
    /** Nombre maximum de résultat par requête serveur. */
    @observable top = 50;
    /** Token à utiliser pour la pagination. */
    skipToken?: string;

    /** Permet d'omettre certains élements de la liste de la sélection. */
    @observable isItemSelectionnable: (data: T) => boolean = () => true;

    /** StoreNode contenant les critères personnalisés de recherche. */
    readonly criteria!: FormNode<C>;

    /** Set contenant les éléments sélectionnés. */
    readonly selectedItems = observable.set<T>();

    /**
     * Crée un nouveau store de liste.
     * @param localStoreConfig Configuration du store local.
     */
    constructor(localStoreConfig?: LocalStoreConfig<T>);
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
        firstParam?: LocalStoreConfig<T> | SearchService<T>,
        secondParam?: C | (SearchProperties<C> & {debounceCriteria?: boolean}),
        thirdParam?: C | (SearchProperties<C> & {debounceCriteria?: boolean})
    ) {
        makeObservable(this);
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
                nodeToFormNode(node, node);
                this.criteria = node as any;
            }

            if (initialQuery) {
                this.setProperties(initialQuery);
            }

            // Relance la recherche à chaque modification de propriété.
            reaction(
                () => [
                    this.groupingKey,
                    this.inputFacets,
                    this.searchFields,
                    !initialQuery?.debounceCriteria ? this.flatCriteria : undefined, // On peut choisir de debouncer ou non les critères personnalisés, par défaut ils ne le sont pas.
                    this.sortAsc,
                    this.sortBy
                ],
                () => this.search()
            );

            // Pour les champs texte, on utilise la recherche "debouncée" pour ne pas surcharger le serveur.
            reaction(
                () => [
                    initialQuery?.debounceCriteria ? this.flatCriteria : undefined, // Par exemple, si les critères sont entrés comme du texte ça peut être utile.
                    this.query
                ],
                debounce(() => this.search(), config.textSearchDelay)
            );
        } else {
            this.type = "local";
            this.localStoreConfig = firstParam;
            this.availableSearchFields = firstParam?.searchFields ?? [];
        }
    }

    @computed
    get facets(): FacetOutput[] {
        if (this.type === "server") {
            return this.innerFacets;
        }

        return (this.localStoreConfig?.facetDefinitions ?? []).map(
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
                    this.localStoreConfig!.facetDefinitions!.filter(
                        facet => !facet.isMultiSelectable || facet.code !== code
                    ).every(facet => this.filterItemByFacet(item, facet))
                );

                return {
                    code,
                    label,
                    isMultiSelectable,
                    isMultiValued: false,
                    canExclude,
                    values: orderBy(
                        toPairs(groupByFacet(list, fieldName))
                            .map(([value, items]) => ({
                                code: value,
                                label: value === "<null>" ? "focus.search.results.missing" : displayFormatter(value),
                                count: items.length
                            }))
                            .filter(f => f.count !== 0),
                        f => (ordering.includes("count") ? f.count : f.code),
                        ordering.includes("desc") ? "desc" : "asc"
                    )
                };
            }
        );
    }

    @computed
    get groups(): GroupResult<T>[] {
        if (this.type === "server") {
            return this.innerGroups;
        }

        if (!this.groupingKey || !this.localStoreConfig?.facetDefinitions) {
            return [];
        }

        return toPairs(
            groupByFacet(
                this.list,
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                this.localStoreConfig.facetDefinitions.find(f => f.code === this.groupingKey)?.fieldName!
            )
        ).map(([code, list]) => ({
            code,
            label: this.facets.find(f => f.code === this.groupingKey)?.values.find(v => v.code === code)?.label ?? code,
            list,
            totalCount: list.length
        }));
    }

    /** La liste. */
    @computed
    get list(): T[] {
        if (this.type === "server") {
            if (this.innerGroups.length) {
                return flatten(this.innerGroups.map(g => g.list.slice()));
            } else {
                return this.innerList;
            }
        }

        let list: T[] = this.innerList;

        // Tri.
        if (this.sortBy) {
            list = orderBy(this.innerList, item => (item as any)[this.sortBy!], this.sortAsc ? "asc" : "desc");
        }

        // Filtrage simple, sur les champs choisis.
        if (this.availableSearchFields.length > 0) {
            list = list.filter(item => this.filterItemByFilters(item));
        }

        // Facettes
        if (this.localStoreConfig?.facetDefinitions) {
            list = list.filter(item =>
                this.localStoreConfig!.facetDefinitions!.every(facet => this.filterItemByFacet(item, facet))
            );
        }

        return list;
    }

    set list(list) {
        this.innerList.replace(list);
    }

    /** Label du groupe choisi. */
    @computed
    get groupingLabel() {
        const group = this.facets.find(facet => facet.code === this.groupingKey);
        return group?.label ?? this.groupingKey;
    }

    /** Store en chargement. */
    @computed
    get isLoading() {
        return this.type === "local" ? undefined : !!this.pendingQuery;
    }

    /** Nombre d'éléments récupérés depuis le serveur. */
    @computed
    get currentCount() {
        return this.list.length;
    }

    /** Nombre total de résultats de la recherche (pas forcément récupérés). */
    @computed
    get totalCount() {
        return this.type === "server" ? this.serverCount : this.currentCount;
    }

    /** Liste des éléments séléctionnés */
    @computed
    get selectedList(): readonly T[] {
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
        this.innerFacets.clear();
        this.innerList.clear();
        this.innerGroups.clear();
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
        if (!this.service) {
            return;
        }

        // On vide les éléments sélectionnés et le skiptoken avant de rechercher à nouveau, pour ne pas avoir d'état de sélection incohérent.
        if (!isScroll) {
            this.selectedItems.clear();
            this.skipToken = undefined;
        }

        const {query, inputFacets, groupingKey, sortBy, sortAsc, list, top, skipToken} = this;

        const data = {
            criteria: {...this.flatCriteria, query, searchFields: this.searchFields},
            facets: inputFacets || {},
            group: groupingKey ?? "",

            // On utilise le skipToken si on en a un, sinon on calcule un skip à partir des résultats.
            skip: !skipToken ? (isScroll && list.length) || 0 : undefined,
            skipToken,

            sortDesc: sortAsc === undefined ? false : !sortAsc,
            sortFieldName: sortBy,
            top
        };

        const pendingQuery = v4();
        this.pendingQuery = pendingQuery;

        const response = await this.service(data);

        runInAction(() => {
            if (pendingQuery !== this.pendingQuery) {
                return;
            }
            this.pendingQuery = undefined;

            // On ajoute les résultats à la suite des anciens si on scrolle, sachant qu'on ne peut pas scroller si on est groupé, donc c'est bien toujours la liste.
            if (isScroll) {
                this.innerList.push(...(response.list ?? []));
            } else {
                this.innerList.replace(response.list ?? []);
            }

            this.innerFacets.replace(response.facets);
            this.innerGroups.replace(response.groups ?? []);
            this.availableSearchFields = response.searchFields ?? [];

            if (!this.skipToken) {
                this.serverCount = response.totalCount; // Si on a utilisé un skipToken, le total serveur ne doit pas être mis à jour.
            }

            this.skipToken = response.skipToken;
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
        this.searchFields = props.hasOwnProperty("searchFields") ? props.searchFields : this.searchFields;
        if (props.inputFacets) {
            this.innerInputFacets.replace(props.inputFacets);
        }
        this.sortAsc = props.sortAsc ?? this.sortAsc;
        this.sortBy = props.hasOwnProperty("sortBy") ? props.sortBy : this.sortBy;
        this.query = props.query ?? this.query;
        this.top = props.top ?? this.top;

        if (this.criteria && props.criteria) {
            this.criteria.set(props.criteria);
        }
    }

    /**
     * Ajoute une valeur à sélectionner pour une facette.
     * @param facetKey Code de la facette.
     * @param facetValue Valeur à ajouter.
     * @param type Type de valeur.
     */
    @action.bound
    addFacetValue(facetKey: string, facetValue: string, type: "excluded" | "selected") {
        // On retire la valeur au cas où elle est déjà dans l'autre liste.
        this.removeFacetValue(facetKey, facetValue);

        // Ajout de la facette si elle n'existe pas.
        if (!this.innerInputFacets.has(facetKey)) {
            this.innerInputFacets.set(facetKey, {});
        }

        const facet = this.innerInputFacets.get(facetKey)!;

        if (!facet[type]) {
            set(facet, {[type]: []});
        }

        facet[type]!.push(facetValue);
    }

    /**
     * Retire une valeur dans une facette (sélectionnée ou exclue).
     * @param facetKey Code de la facette.
     * @param facetValue Valeur à retirer.
     */
    removeFacetValue(facetKey: string, facetValue: string): void;
    /**
     * Retire toutes les valeurs d'une facette.
     * @param facetKey Code de la facette
     */
    removeFacetValue(facetKey: string): void;
    /**
     * Retire toutes les valeurs de toutes les facettes.
     */
    removeFacetValue(): void;
    @action.bound
    removeFacetValue(facetKey?: string, facetValue?: string) {
        // Suppression globale : on fait un forEach au lieu d'un simple "clear" car on ne veut pas perdre les opérateurs.
        if (!facetKey) {
            this.innerInputFacets.forEach((_, code) => this.removeFacetValue(code));
            return;
        }

        const facet = this.innerInputFacets.get(facetKey)!;
        if (!facet) {
            return;
        }

        (["excluded", "selected"] as const).forEach(type => {
            const values = facet[type] as IObservableArray<string>;
            if (facetValue) {
                values?.remove(facetValue);
            } else {
                values?.clear();
            }
        });

        // On nettoie...
        if (facet.selected?.length === 0) {
            remove(facet, "selected");
        }

        if (facet.excluded?.length === 0) {
            remove(facet, "excluded");
        }

        if (!facet.excluded && !facet.selected && !facet.operator) {
            this.innerInputFacets.delete(facetKey);
        }
    }

    /** Change l'opérateur d'une facette multi-sélectionnable à plusieurs valeurs. */
    @action.bound
    toggleFacetOperator(facetKey: string) {
        // Ajout de la facette si elle n'existe pas.
        if (!this.innerInputFacets.has(facetKey)) {
            this.innerInputFacets.set(facetKey, {});
        }

        const facet = this.innerInputFacets.get(facetKey)!;

        if (!facet.operator) {
            set(facet, {operator: "and"});
        } else {
            facet.operator = facet.operator === "and" ? "or" : "and";
        }
    }

    /**
     * Construit un store de recherche partiel pour l'affichage en groupe : utilisé par l'ActionBar du groupe ainsi que sa liste.
     * @param groupCode Le code de la valeur de groupe en cours.
     */
    getSearchGroupStore(groupCode: string): CollectionStore<T> {
        const self = this;
        return observable(
            {
                get currentCount() {
                    return self.groups.find(result => result.code === groupCode)?.totalCount ?? 0;
                },

                get totalCount() {
                    return self.groups.find(result => result.code === groupCode)?.totalCount ?? 0;
                },

                isItemSelectionnable: self.isItemSelectionnable,

                get list() {
                    return self.groups.find(result => result.code === groupCode)?.list ?? [];
                },

                get selectionnableList(): T[] {
                    return this.list.filter(self.isItemSelectionnable);
                },

                get selectedItems() {
                    return new Set(self.selectedList.filter(item => this.list.find((i: T) => i === item)));
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
                    self.toggle(item);
                },

                // Non immédiat car le set de sélection contient tous les résultats alors que le toggleAll ne doit agir que sur le groupe.
                toggleAll() {
                    const areAllItemsIn = this.selectionnableList.every(item => self.selectedItems.has(item));

                    this.list.forEach(item => {
                        if (self.selectedItems.has(item)) {
                            self.selectedItems.delete(item);
                        }
                    });

                    if (!areAllItemsIn) {
                        this.selectionnableList.forEach(item => self.selectedItems.add(item));
                    }
                }
            },
            {
                toggle: action.bound,
                toggleAll: action.bound
            },
            {proxy: false}
        ) as any;
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

function groupByFacet<T>(list: T[], fieldName: keyof T) {
    return list.reduce((buckets, item) => {
        let value = item[fieldName];
        if (isEntityField(value)) {
            // eslint-disable-next-line prefer-destructuring
            value = value.value;
        }

        function add(key?: any) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            buckets[`${key ?? "<null>"}`] = [...(buckets[`${key ?? "<null>"}`]?.slice() ?? []), item];
        }

        if (Array.isArray(value) || isObservableArray(value)) {
            if (value.length === 0) {
                add();
            } else {
                value.forEach(add);
            }
        } else {
            add(value);
        }
        return buckets;
    }, {} as Record<string, T[]>);
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
        return itemValue === (parseFloat(facetValue) || undefined);
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

    // eslint-disable-next-line eqeqeq
    return itemValue == facetValue;
}
