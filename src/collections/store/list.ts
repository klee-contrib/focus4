import {autobind} from "core-decorators";
import {isString, orderBy} from "lodash";
import {action, computed, observable} from "mobx";

import {ListStoreBase} from "./base";

/**
 * Store de liste
 *
 * Permet de gérer des actions sur la liste comme du tri, de la sélection ou bien du filtrage.
 *
 * S'utilise sur une liste pré-chargée
 */
@autobind
export class ListStore<T> extends ListStoreBase<T> {

    /** Champs sur lequels on autorise le filtrage, en local. */
    private filterFields?: (keyof T)[];

    /** Liste brute des données. */
    private readonly innerList = observable<T>([]);

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
                    return field.toLowerCase().includes(this.query.toLowerCase()); // Pour faire simple, on compare tout en minuscule.
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

    /** Sélectionne ou déselectionne tous les éléments du store. */
    @action
    toggleAll() {
        if (this.selectedItems.size === this.innerList.length) {
            this.selectedList.clear();
        } else {
            this.selectedList.replace(this.innerList);
        }
    }
}

export function isList<T>(store: ListStoreBase<T>): store is ListStore<T> {
    return store.hasOwnProperty("innerList");
}
