import {debounce, flatten} from "es-toolkit";
import {action, computed, IObservableArray, observable, reaction} from "mobx";

import {isAbortError, requestStore} from "@focus4/core";
import {Entity, EntityToType} from "@focus4/entities";

import {FormEntityField, FormNode, FormNodeBuilder, makeStoreNode, toFlatValues} from "../entity";

import {CollectionStore} from "./base";
import {
    FacetOutput,
    GroupResult,
    SearchService,
    ServerCollectionStoreInitProperties,
    ServerCollectionStoreProperties
} from "./types";

/**
 * Store de collection serveur, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes via une API dédiée à implémenter sur votre serveur.
 */
export class ServerCollectionStore<
    T extends object = any,
    C extends Entity = never,
    NC extends Entity = C
> extends CollectionStore<T> {
    /** Service de recherche serveur. */
    private readonly service?: SearchService<T>;

    /** Facettes résultat de la recherche. */
    private readonly innerFacets: IObservableArray<FacetOutput> = observable([]);
    /** Résultats de la recherche, si elle retourne des groupes. */
    private readonly innerGroups: IObservableArray<GroupResult<T>> = observable([]);

    /** Liste des champs disponibles pour la recherche texte. */
    @observable.ref override accessor availableSearchFields: string[] = [];

    /** Nombre d'éléments dans le résultat, d'après la requête serveur. */
    @observable private accessor serverCount = 0;

    /** Nombre maximum de résultat par requête serveur. */
    @observable accessor top = 50;
    /** Token à utiliser pour la pagination. */
    skipToken?: string;

    /** StoreNode contenant les critères personnalisés de recherche. */
    readonly criteria: FormNode<NC, C>;

    /** Mode de prise en compte de l'objet de critère. */
    readonly criteriaMode!: ServerCollectionStoreInitProperties["criteriaMode"];

    private abortController?: AbortController;

    /* @internal */
    constructor(service: SearchService<T>, criteria?: C, initialQuery?: ServerCollectionStoreInitProperties<C, NC>);
    /* @internal */
    constructor(service: SearchService<T>, initialQuery?: ServerCollectionStoreInitProperties<C, NC>, criteria?: C);
    /* @internal */
    constructor(
        service: SearchService<T>,
        secondParam?: C | ServerCollectionStoreInitProperties<C, NC>,
        thirdParam?: C | ServerCollectionStoreInitProperties<C, NC>
    ) {
        super();
        this.service = service;

        // On gère les paramètres du constructeur dans les deux ordres.
        let initialQuery: ServerCollectionStoreInitProperties<C, NC>;
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
            this.criteria = criteriaBuilder(new FormNodeBuilder(makeStoreNode(criteria)))
                .edit(() => true)
                .build();
        } else {
            this.criteria = new FormNodeBuilder<NC, C>(makeStoreNode({} as NC)).build();
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
    }

    // oxlint-disable-next-line class-methods-use-this
    override get type(): "server" {
        return "server";
    }

    override get facets() {
        return this.innerFacets;
    }

    override get groups() {
        return this.innerGroups;
    }

    @computed
    override get list(): T[] {
        if (this.innerGroups.length) {
            return flatten(this.innerGroups.map(g => [...g.list]));
        } else {
            return this.innerList;
        }
    }

    @computed
    override get totalCount() {
        return this.serverCount;
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
    override clear() {
        super.clear();
        this.serverCount = 0;
        this.innerFacets.clear();
        this.innerGroups.clear();
    }

    @action.bound
    override async search(isScroll = false) {
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
            const response = await requestStore.track(
                this.trackingId,
                () => this.service!(data, {signal}),
                res => {
                    // On ajoute les résultats à la suite des anciens si on scrolle, sachant qu'on ne peut pas scroller si on est groupé, donc c'est bien toujours la liste.
                    if (isScroll) {
                        this.innerList.push(...(res.list ?? []));
                    } else {
                        this.innerList.replace(res.list ?? []);
                    }

                    this.innerFacets.replace(res.facets);
                    this.innerGroups.replace(res.groups ?? []);
                    this.availableSearchFields = res.searchFields ?? [];

                    if (!this.skipToken) {
                        this.serverCount = res.totalCount; // Si on a utilisé un skipToken, le total serveur ne doit pas être mis à jour.
                    }

                    this.skipToken = res.skipToken;
                }
            );

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
    setProperties(props: ServerCollectionStoreProperties<NC>) {
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
}

/**
 * Crée un store de collection serveur, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes via une API dédiée à implémenter sur votre serveur.
 * @param service Le service de recherche.
 * @param criteria La description du critère de recherche personnalisé.
 * @param initialQuery Les paramètres de recherche à l'initilisation.
 */
export function makeServerCollectionStore<T extends object, C extends Entity, NC extends Entity>(
    service: SearchService<T>,
    criteria?: C,
    initialQuery?: ServerCollectionStoreInitProperties<C, NC>
): ServerCollectionStore<T, C, NC>;
/**
 * Crée un store de collection serveur, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes via une API dédiée à implémenter sur votre serveur.
 * @param initialQuery Les paramètres de recherche à l'initilisation.
 * @param service Le service de recherche.
 * @param criteria La description du critère de recherche personnalisé.
 */
export function makeServerCollectionStore<T extends object, C extends Entity, NC extends Entity>(
    service: SearchService<T>,
    initialQuery?: ServerCollectionStoreInitProperties<C, NC>,
    criteria?: C
): ServerCollectionStore<T, C, NC>;
export function makeServerCollectionStore(service: SearchService, secondParam?: any, thirdParam?: any) {
    return new ServerCollectionStore(service, secondParam, thirdParam);
}
