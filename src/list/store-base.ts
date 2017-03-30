import {autobind} from "core-decorators";
import {action, computed, IObservableArray, observable} from "mobx";

/** Socle commun entre le store de liste et de recherche. */
@autobind
export abstract class ListStoreBase<T> {
    @observable groupingKey: string | undefined;
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
    get groupingLabel() {
        return this.groupingKey;
    }

    @computed
    get selectedItems() {
        return new Set(this.selectedList);
    }

    @computed
    get selectionStatus() {
        if (this.selectedItems.size === 0) {
            return "none";
        } else if (this.selectedItems.size === this.totalCount) {
            return "selected";
        } else {
            return "partial";
        }
    }

    abstract get currentCount(): number;
    abstract get totalCount(): number;

    abstract getListByGroupCode(groupCode: string): T[];

    @action
    toggle(item: T) {
        if (this.selectedItems.has(item)) {
            this.selectedList.remove(item);
        } else {
            this.selectedList.push(item);
        }
    }

    @action
    toggleMany(items: T[]) {
        const areAllItemsIn = items.every(item => this.selectedItems.has(item));

        items.forEach(item => {
            if (this.selectedItems.has(item)) {
                this.selectedList.remove(item);
            }
        });

        if (!areAllItemsIn) {
            this.selectedList.push(...items);
        }
    }

    abstract toggleAll(): void;
}
