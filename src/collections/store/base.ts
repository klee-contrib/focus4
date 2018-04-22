import {action, computed, IObservableArray, observable} from "mobx";

/** Statut de la séléection */
export type SelectionStatus = "none" | "partial" | "selected";

/** Socle commun entre le store de liste et de recherche. */
export abstract class ListStoreBase<T> {
    /** Filtre texte. */
    @observable query = "";
    /** Tri par ordre croissant. */
    @observable sortAsc = true;
    /** Nom du champ sur lequel trier. */
    @observable sortBy: string | undefined;

    /** Permet d'omettre certains élements de la liste de la sélection. */
    @observable isItemSelectionnable: (data: T) => boolean = () => true;
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
            case 0:
                return "none";
            case this.selectionnableList.length:
                return "selected";
            default:
                return "partial";
        }
    }

    /** Liste des résultats (vide si recherche groupée). */
    abstract readonly list: T[];

    /** Nombre d'éléments chargés dans le store. */
    abstract get currentCount(): number;

    /** Nombre d'éléments au total (y compris non chargés pour la recherche). */
    abstract get totalCount(): number;

    /** Liste des éléments sélectionnables. */
    abstract get selectionnableList(): T[];

    /**
     * Sélectionne ou déselectionne un item.
     * @param item L'item.
     */
    @action.bound
    toggle(item: T) {
        if (this.selectedItems.has(item)) {
            this.selectedList.remove(item);
        } else if (this.isItemSelectionnable(item)) {
            this.selectedList.push(item);
        }
    }

    /** Sélectionne ou déselectionne tous les éléments du store. */
    @action.bound
    toggleAll() {
        if (this.selectedItems.size === this.selectionnableList.length) {
            this.selectedList.clear();
        } else {
            this.selectedList.replace(this.selectionnableList);
        }
    }
}
