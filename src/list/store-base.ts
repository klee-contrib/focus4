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
    @observable sortBy: keyof T | undefined;
    /** Nombre maximum de résultat par requête serveur. */
    @observable top = 50;

    /** Liste des éléments séléctionnés */
    @observable readonly selectedList: IObservableArray<T> = [] as any;

    /** Nombre d'éléments dans le résultat, d'après la requête serveur. */
    @observable protected serverCount = 0;

    /** Nombre de requêtes serveur en cours. */
    @observable protected pendingCount = 0;

    /** Store en chargement. */
    @computed
    get isLoading() {
        return this.pendingCount > 0;
    }

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

    /** Nombre d'éléments dans le store.  */
    abstract get currentCount(): number;
    /** Nombre d'éléments au total (y compris non chargés). */
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

/** Interface réduite d'un store de liste/recherche, utilisée par certains composants. */
export interface MiniListStore<T> {
    /** Nombre d'éléments dans le store.  */
    readonly currentCount: number;
    /** Liste des éléments. */
    readonly list?: T[];
    /** Set contenant les éléments sélectionnés. */
    selectedItems: Set<T>;
    /** Etat de la sélection (aucune, partielle, totale). */
    selectionStatus: SelectionStatus;
    /**
     * Sélectionne ou déselectionne un item.
     * @param item L'item.
     */
    toggle(item: T): void;
    /** Sélectionne ou déselectionne tous les éléments du store. */
    toggleAll(): void;
    /** Nombre d'éléments au total (y compris non chargés). */
    readonly totalCount: number;
}
