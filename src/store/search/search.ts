import CoreStore from "../core";

export default class SearchStore<T> extends CoreStore<T> {
    getValue() {
        return this.data.toObject();
    }
}
