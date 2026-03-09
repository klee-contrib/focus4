import {action, computed, IObservableArray, observable, remove, set, toJS} from "mobx";

import {requestStore} from "@focus4/core";

import {FacetInput, FacetOutput, GroupResult, InputFacets, SelectionStatus, SortInput} from "./types";

/** Store de recherche. Contient les critères/facettes ainsi que les résultats, et s'occupe des recherches. */
export abstract class CollectionStore<T extends object = any> {
    /** Type de store. */
    abstract get type(): "local" | "server";

    /** Facettes en entrée de la recherche. */
    protected readonly innerInputFacets = observable.map<string, FacetInput>();
    /** Liste brute (non triée, non filtrée) des données, fournie en local ou récupérée du serveur si recherche non groupée. */
    protected readonly innerList: IObservableArray<T> = observable([]);

    /** Champ sur lequel grouper. */
    @observable accessor groupingKey: string | undefined;
    /** Filtre texte. */
    @observable accessor query = "";

    /** Liste des champs disponibles pour la recherche texte. */
    abstract get availableSearchFields(): string[];

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

    /** Permet d'omettre certains élements de la liste de la sélection. */
    @observable accessor isItemSelectionnable: (data: T) => boolean = () => true;

    /** Set contenant les éléments sélectionnés. */
    readonly selectedItems = observable.set<T>();

    /** Id de suivi, pour les requêtes de chargement. */
    trackingId = Math.random().toString();

    /** Facettes résultantes de la recherche. */
    abstract get facets(): FacetOutput[];

    /** Groupes résultants de la recherche. */
    abstract get groups(): GroupResult<T>[];

    /** La liste. */
    abstract get list(): T[];

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
    abstract get totalCount(): number;

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

    /** Vide les résultats de recherche. */
    @action.bound
    clear() {
        this.selectedItems.clear();
        this.innerList.clear();
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
    abstract search(isScroll?: boolean): Promise<any>;

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
}
