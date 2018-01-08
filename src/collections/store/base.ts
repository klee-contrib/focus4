import {autobind} from "core-decorators";
import {action, computed, IObservableArray, observable} from "mobx";

/** Statut de la séléection */
export type SelectionStatus = "none" | "partial" | "selected";

/** Socle commun entre le store de liste et de recherche. */
@autobind
export abstract class ListStoreBase<T> {

    /** Filtre texte. */
    @observable query = "";
    /** Tri par ordre croissant. */
    @observable sortAsc = true;
    /** Nom du champ sur lequel trier. */
    @observable sortBy: string | undefined;

    /** Liste des éléments séléctionnés */
    readonly selectedList: IObservableArray<T> = observable<T>([]);

    /** Set contenant les éléments sélectionnés. */
    @computed
    get selectedItems() {
        return new Set(this.selectedList);
    }

    /** Etat de la sélection (aucune, partielle, totale). */
    @computed
    get selectionStatus(): SelectionStatus {
        switch (this.selectedItems.size) {
            case 0: return "none";
            case this.totalCount: return "selected";
            default: return "partial";
        }
    }

    /** Liste des résultats (vide si recherche groupée). */
    abstract readonly list: T[];

    /** Nombre d'éléments chargés dans le store. */
    abstract get currentCount(): number;

    /** Nombre d'éléments au total (y compris non chargés pour la recherche). */
    abstract get totalCount(): number;

    /**
     * Sélectionne ou déselectionne un item.
     * @param item L'item.
     */
    @action
    toggle(item: T) {
        if (this.selectedItems.has(item)) {
            this.selectedList.remove(item);
        } else {
            this.selectedList.push(item);
        }
    }

    /** Sélectionne ou déselectionne tous les éléments du store. */
    abstract toggleAll(): void;
}
