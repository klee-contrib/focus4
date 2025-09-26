import {debounce, flatten, isFunction, isString, orderBy} from "es-toolkit";
import {
    action,
    computed,
    IObservableArray,
    isObservableArray,
    observable,
    reaction,
    remove,
    runInAction,
    set,
    toJS
} from "mobx";

import {isAbortError, requestStore} from "@focus4/core";

import {
    buildNode,
    EntityToType,
    FormEntityField,
    FormNode,
    FormNodeBuilder,
    isEntityField,
    toFlatValues
} from "../entity";

import {
    CollectionStoreInitProperties,
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
    SelectionStatus,
    SortInput
} from "./types";

export type {FacetItem, FacetOutput, GroupResult, InputFacets, QueryInput, QueryOutput, SortInput};

/** Store de recherche. Contient les critères/facettes ainsi que les résultats, et s'occupe des recherches. */
export class CollectionStore<T extends object = any, C = any, NC = C> {
    /** Type de store. */
    readonly type: "local" | "server";

    /** Config du store local. */
    private readonly localStoreConfig?: LocalStoreConfig<T>;
    /** Service de recherche serveur. */
    private readonly service?: SearchService<T>;

    /** @internal */
    /** Service de chargement posé par un `useLoad()`, en mode local. */
    localLoadService?: () => Promise<void>;

    /** Liste des champs disponibles pour la recherche texte. */
    @observable.ref accessor availableSearchFields: string[] = [];

    /** Facettes en entrée de la recherche. */
    private readonly innerInputFacets = observable.map<string, FacetInput>();
    /** Facettes résultat de la recherche. */
    private readonly innerFacets: IObservableArray<FacetOutput> = observable([]);
    /** Résultats de la recherche, si elle retourne des groupes. */
    private readonly innerGroups: IObservableArray<GroupResult<T>> = observable([]);
    /** Liste brute (non triée, non filtrée) des données, fournie en local ou récupérée du serveur si recherche non groupée. */
    private readonly innerList: IObservableArray<T> = observable([]);

    /** Nombre d'éléments dans le résultat, d'après la requête serveur. */
    @observable private accessor serverCount = 0;

    /** Champ sur lequel grouper. */
    @observable accessor groupingKey: string | undefined;
    /** Filtre texte. */
    @observable accessor query = "";
    /** Liste des champs sur lesquels le champ texte filtre (si non renseigné : tous les champs disponibles). */
    @observable.ref accessor searchFields: string[] | undefined;

    /** Facettes sélectionnées. */
    @computed.struct
    get inputFacets() {
        return [...this.innerInputFacets.entries()].reduce(
            (res, [key, value]) => ({...res, [key]: toJS(value)}),
            {} as InputFacets
        );
    }

    /** Définitions de tri, dans l'ordre d'application. */
    @observable accessor sort: SortInput[] = [];

    /** Nombre maximum de résultat par requête serveur. */
    @observable accessor top = 50;
    /** Token à utiliser pour la pagination. */
    skipToken?: string;

    /** Permet d'omettre certains élements de la liste de la sélection. */
    // oxlint-disable-next-line class-methods-use-this
    @observable accessor isItemSelectionnable: (data: T) => boolean = () => true;

    /** StoreNode contenant les critères personnalisés de recherche. */
    readonly criteria!: FormNode<NC, C>;

    /** Mode de prise en compte de l'objet de critère. */
    readonly criteriaMode!: CollectionStoreInitProperties["criteriaMode"];

    /** Set contenant les éléments sélectionnés. */
    readonly selectedItems = observable.set<T>();

    private abortController?: AbortController;

    /** Id de suivi, pour les requêtes de chargement. */
    trackingId = Math.random().toString();

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
    constructor(service: SearchService<T>, criteria?: C, initialQuery?: CollectionStoreInitProperties<C, NC>);
    /**
     * Crée un nouveau store de recherche.
     * @param initialQuery Les paramètres de recherche à l'initilisation.
     * @param service Le service de recherche.
     * @param criteria La description du critère de recherche personnalisé.
     */
    constructor(service: SearchService<T>, initialQuery?: CollectionStoreInitProperties<C, NC>, criteria?: C);
    constructor(
        firstParam?: LocalStoreConfig<T> | SearchService<T>,
        secondParam?: C | CollectionStoreInitProperties<C, NC>,
        thirdParam?: C | CollectionStoreInitProperties<C, NC>
    ) {
        if (isFunction(firstParam)) {
            this.type = "server";
            this.service = firstParam as SearchService<T>;

            // On gère les paramètres du constructeur dans les deux ordres.
            let initialQuery: CollectionStoreInitProperties<C, NC>;
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
                const {criteriaBuilder = (x: any) => x} = initialQuery ?? {};
                this.criteria = criteriaBuilder(new FormNodeBuilder(buildNode(criteria as C)))
                    .edit(() => true)
                    .build();
            }

            if (initialQuery) {
                this.setProperties(initialQuery);
            }

            this.criteriaMode = initialQuery?.criteriaMode ?? "direct";

            // Relance la recherche à chaque modification de propriété.
            reaction(
                () => [
                    this.groupingKey,
                    this.inputFacets,
                    this.searchFields,
                    this.criteriaMode === "direct" ? this.flatCriteria : undefined, // On peut choisir de debouncer ou non les critères personnalisés, par défaut ils ne le sont pas.
                    this.sort.map(({fieldName, sortDesc}) => ({fieldName, sortDesc}))
                ],
                () => this.search()
            );

            // Pour les champs texte, on utilise la recherche "debouncée" pour ne pas surcharger le serveur.
            reaction(
                () => [
                    this.criteriaMode === "debounced" ? this.flatCriteria : undefined, // Par exemple, si les critères sont entrés comme du texte ça peut être utile.
                    this.query
                ],
                debounce(() => this.search(), initialQuery?.textSearchDelay ?? 500)
            );
        } else {
            this.type = "local";
            this.localStoreConfig = firstParam as LocalStoreConfig<T>;
            this.availableSearchFields = this.localStoreConfig?.searchFields ?? [];
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
    get groups(): GroupResult<T>[] {
        if (this.type === "server") {
            return this.innerGroups;
        }

        if (!this.groupingKey || !this.localStoreConfig?.facetDefinitions) {
            return [];
        }

        return Object.entries(
            groupByFacet(
                this.list,
                // oxlint-disable-next-line no-non-null-asserted-optional-chain
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
                return flatten(this.innerGroups.map(g => [...g.list]));
            } else {
                return this.innerList;
            }
        }

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
        return requestStore.isLoading(this.trackingId);
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
        return [...this.selectedItems];
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

    /** Récupère l'objet de critères personnalisé à plat (via `toFlatValues`, sans les critères en erreurs). */
    @computed.struct
    get flatCriteria() {
        const criteria =
            this.criteria &&
            (toFlatValues(
                this.criteriaMode === "manual" ? this.criteria.sourceNode : this.criteria
            ) as EntityToType<C>);
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
     * Appelle le service de recherche (en mode serveur), ou le service enregistré dans un `useLoad` (en mode local).
     * @param isScroll Récupère la suite des résultats.
     */
    @action.bound
    async search(isScroll = false) {
        if (this.localLoadService) {
            await this.localLoadService();
            return;
        }

        if (!this.service) {
            return;
        }

        this.abortController?.abort();
        this.abortController = new AbortController();
        const {signal} = this.abortController;

        // On vide les éléments sélectionnés et le skiptoken avant de rechercher à nouveau, pour ne pas avoir d'état de sélection incohérent.
        if (!isScroll) {
            this.selectedItems.clear();
            this.skipToken = undefined;
        }

        const {query, inputFacets, groupingKey, sort, list, top, skipToken} = this;

        if (this.criteriaMode === "manual" && !isScroll) {
            this.criteria.sourceNode.replace(toFlatValues(this.criteria) as EntityToType<C>);
        }

        const data = {
            criteria: {...this.flatCriteria, query, searchFields: this.searchFields},
            facets: inputFacets || {},
            group: groupingKey ?? "",

            // On utilise le skipToken si on en a un, sinon on calcule un skip à partir des résultats.
            skip: !skipToken ? (isScroll && list.length) || 0 : undefined,
            skipToken,

            sort,
            top
        };

        try {
            const response = await requestStore.track(this.trackingId, () => this.service!(data, {signal}));

            runInAction(() => {
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

            this.abortController = undefined;
            return response;
        } catch (error: unknown) {
            if (isAbortError(error)) {
                return;
            }

            throw error;
        }
    }

    /**
     * Met à jour plusieurs critères de recherche.
     * @param props Les propriétés à mettre à jour.
     */
    @action.bound
    setProperties(props: SearchProperties<NC>) {
        this.groupingKey = props.hasOwnProperty("groupingKey") ? props.groupingKey : this.groupingKey;
        this.searchFields = props.hasOwnProperty("searchFields") ? props.searchFields : this.searchFields;
        if (props.inputFacets) {
            this.innerInputFacets.replace(props.inputFacets);
        }
        this.sort = props.sort ?? this.sort;
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
            // oxlint-disable-next-line no-array-for-each
            this.innerInputFacets.forEach((_, code) => this.removeFacetValue(code));
            return;
        }

        const facet = this.innerInputFacets.get(facetKey)!;
        if (!facet) {
            return;
        }

        for (const type of ["excluded", "selected"] as const) {
            const values = facet[type] as IObservableArray<string>;
            if (facetValue) {
                values?.remove(facetValue);
            } else {
                values?.clear();
            }
        }

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
        // oxlint-disable-next-line no-this-assignment
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

                    for (const item of this.list) {
                        if (self.selectedItems.has(item)) {
                            self.selectedItems.delete(item);
                        }
                    }

                    if (!areAllItemsIn) {
                        for (const item of this.selectionnableList) {
                            self.selectedItems.add(item);
                        }
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
                    for (const item of value) {
                        add(item);
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
