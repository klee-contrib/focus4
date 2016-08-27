import CoreStore from "store";

export abstract class SearchStore<T> extends CoreStore<T> {
    getValue() {
        return this.data.toObject();
    }
}
