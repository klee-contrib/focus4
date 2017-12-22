import {autobind} from "core-decorators";
import {isArray, isString, orderBy} from "lodash";
import {action, computed, observable, reaction, runInAction} from "mobx";

import {ListStoreBase} from "./store-base";

/** Paramètres pour un service de liste. */
export interface ListServiceParams {
    /** Nombre d'éléments à sauter dans le résultat. */
    skip?: number;
    /** Tri par ordre décroissant. */
    sortDesc?: boolean;
    /** Nom du champ sur lequel trier. */
    sortFieldName?: string;
    /** Nombre maximum de résultat par requête serveur. */
    top?: number;
}

/** Réponse d'un service de liste. */
export interface ListServiceResponse<T> {
    /** La liste retournée, possiblement partielle. */
    dataList: T[];
    /** Nombre d'éléments au total (y compris non chargés). */
    totalCount: number;
}

/** Service de liste. */
export type ListService<T> = (data: ListServiceParams) => Promise<ListServiceResponse<T>>;

/**
 * Store de liste
 *
 * Permet de gérer des actions sur la liste comme du tri, de la sélection, du chargement partiel ou bien du filtrage.
 *
 * Peut s'utiliser avec un service de chargement comme sur une liste pré-chargée.
 */
@autobind
export class ListStore<T> extends ListStoreBase<T> {

    /** Liste brute des données. */
    @observable private baseDataList: T[] = [];
    /** Liste potentiellement triée et filtrée. */
    @observable private innerDataList: T[] = [];

    /** La liste. */
    @computed
    get dataList() {
        return this.innerDataList;
    }

    set dataList(list) {
        runInAction(() => {
            this.baseDataList = list;
            if (!this.service) {
                this.sortAndFilter();
            } else {
                this.innerDataList = list;
            }
        });
    }

    /** Champs sur lequels on autorise le filtrage, en local. */
    private filterFields?: (keyof T)[];
    /** Service de chargement éventuel. */
    service?: ListService<T>;

    /**
     * Construit un store de liste local.
     * @param filterFields Les champs sur lequels on peut filtrer.
     */
    constructor(filterFields?: (keyof T)[])
    /**
     * Construit un store de liste serveur.
     * @param service Le service de chargement.
     */
    constructor(service?: ListService<T>)
    constructor(param?: (keyof T)[] | ListService<T>) {
        super();
        if (isArray(param)) {
            this.filterFields = param;
        } else if (param) {
            this.service = param;
        }

        // Tri et filtrage.
        reaction(() => [this.query, this.sortAsc, this.sortBy], () => {
            if (this.service) {
                this.load();
            } else {
                this.sortAndFilter();
            }
        });
    }

    /** Nombre d'éléments dans le store.  */
    @computed
    get currentCount() {
        return this.dataList.length;
    }

    /** Nombre d'éléments au total (y compris non chargés si liste serveur). */
    @computed
    get totalCount() {
        if (this.service) {
            return this.serverCount;
        } else {
            return this.innerDataList.length;
        }
    }

    /**
     * Charge la liste.
     * @param fetchNext Charge les éléments suivants.
     */
    @action
    async load(fetchNext?: boolean) {
        this.pendingCount++;
        const response = await this.service!({
            skip: fetchNext && this.dataList.length < this.totalCount ? this.dataList.length : 0,
            sortDesc: !this.sortAsc,
            sortFieldName: this.sortBy,
            top: this.top
        });
        this.pendingCount--;

        this.innerDataList = (fetchNext ? [...this.dataList, ...response.dataList] : response.dataList) || [];
        this.serverCount = response.totalCount;

        return response;
    }

    /** Sélectionne ou déselectionne tous les éléments du store. */
    @action
    toggleAll() {
        if (this.selectedItems.size === this.dataList.length) {
            this.selectedList.clear();
        } else {
            this.selectedList.replace(this.dataList);
        }
    }

    /**
     * Met à jour plusieurs critères du store dans une action.
     * @param props Les propriétés à mettre à jour.
     */
    @action
    setProperties(props: {dataList?: T[], sortAsc?: boolean, sortBy?: keyof T, top?: number}) {
        this.dataList = props.dataList || this.dataList;
        this.sortAsc = props.sortAsc || this.sortAsc;
        this.sortBy = props.sortBy || this.sortBy;
        this.top = props.top || this.top;
    }

    /** Tri et filtre la liste */
    @action
    private sortAndFilter() {
        // Tri.
        if (this.sortBy) {
            this.innerDataList = orderBy(this.baseDataList, this.sortBy, this.sortAsc ? "asc" : "desc");
        } else {
            this.innerDataList = this.baseDataList;
        }

        // Filtrage simple, sur les champs choisis.
        if (this.filterFields) {
            this.innerDataList = this.innerDataList.filter(item => this.filterFields!.some(filter => {
                const field = item[filter];
                if (isString(field)) {
                    return field.toLowerCase().includes(this.query.toLowerCase()); // Pour faire simple, on compare tout en minuscule.
                } else {
                    return false;
                }
            }));
        }
    }
}
