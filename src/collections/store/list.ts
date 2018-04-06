import {isString, orderBy} from "lodash";
import {computed, IObservableArray, observable} from "mobx";

import {ListStoreBase} from "./base";

/**
 * Store de liste
 *
 * Permet de gérer des actions sur la liste comme du tri, de la sélection ou bien du filtrage.
 *
 * S'utilise sur une liste pré-chargée
 */
export class ListStore<T> extends ListStoreBase<T> {

    /** Liste brute (non triée, non filtrée) des données. */
    readonly innerList: IObservableArray<T> = observable<T>([]);

    /** Champs sur lequels on autorise le filtrage, en local. */
    private readonly filterFields?: (keyof T)[];

    /**
     * Construit un store de liste local.
     * @param filterFields Les champs sur lequels on peut filtrer.
     */
    constructor(filterFields?: (keyof T)[]) {
        super();
        this.filterFields = filterFields;
    }

    /** La liste. */
    @computed
    get list() {
        let list;

        // Tri.
        if (this.sortBy) {
            list = orderBy(this.innerList, item => `${(item as any)[this.sortBy!]}`.toLowerCase(), this.sortAsc ? "asc" : "desc");
        } else {
            list = this.innerList;
        }

        // Filtrage simple, sur les champs choisis.
        if (this.filterFields) {
            list = list.filter(item => this.filterFields!.some(filter => {
                const field = item[filter];
                if (isString(field)) {
                    return field.toLowerCase()
                        .includes(this.query.toLowerCase()); // Pour faire simple, on compare tout en minuscule.
                } else {
                    return false;
                }
            }));
        }

        return list;
    }

    set list(list) {
        this.innerList.replace(list);
    }

    /** Nombre d'éléments dans le store.  */
    @computed
    get currentCount() {
        return this.innerList.length;
    }

    /** Nombre d'éléments dans le store. */
    @computed
    get totalCount() {
        return this.currentCount;
    }

    /** Liste des éléments sélectionnables. */
    @computed.struct
    get selectionnableList() {
        return this.innerList.filter(this.isItemSelectionnable);
    }
}

export function isList<T>(store: ListStoreBase<T>): store is ListStore<T> {
    return store.hasOwnProperty("innerList");
}
