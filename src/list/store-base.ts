import {autobind} from "core-decorators";
import {action, computed, IObservableArray, observable} from "mobx";

export type SelectionStatus = "none" | "partial" | "selected";

/** Socle commun entre le store de liste et de recherche. */
@autobind
export abstract class ListStoreBase<T> {
    @observable query = "";
    @observable sortAsc = true;
    @observable sortBy: keyof T | undefined;
    @observable top = 50;

    @observable readonly selectedList: IObservableArray<T> = [] as any;

    @observable protected serverCount = 0;
    @observable protected pendingCount = 0;

    @computed
    get isLoading() {
        return this.pendingCount > 0;
    }

    @computed
    get selectedItems() {
        return new Set(this.selectedList);
    }

    @computed
    get selectionStatus(): SelectionStatus {
        switch (this.selectedItems.size) {
            case 0: return "none";
            case this.totalCount: return "selected";
            default: return "partial";
        }
    }

    abstract get currentCount(): number;
    abstract get totalCount(): number;

    @action
    toggle(item: T) {
        if (this.selectedItems.has(item)) {
            this.selectedList.remove(item);
        } else {
            this.selectedList.push(item);
        }
    }

    abstract toggleAll(): void;
}

export interface MiniListStore<T> {
    readonly currentCount: number;
    readonly list?: T[];
    selectedItems: Set<T>;
    selectionStatus: SelectionStatus;
    toggle(item: T): void;
    toggleAll(): void;
    readonly totalCount: number;
}
