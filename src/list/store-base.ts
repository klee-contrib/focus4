import {autobind} from "core-decorators";
import {action, computed, IObservableArray, observable} from "mobx";

/** Socle commun entre le store de liste et de recherche. */
@autobind
export abstract class ListStoreBase<T> {
    @observable groupingKey: string | undefined;
    @observable sortAsc = true;
    @observable sortBy: keyof T | undefined;
    @observable top = 50;

    @observable protected selectedList: IObservableArray<T> = [] as any;
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
    get selectionStatus() {
        if (this.selectedItems.size === this.totalCount) {
            return "selected";
        } else if (this.selectedItems.size === 0) {
            return "none";
        } else {
            return "partial";
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
