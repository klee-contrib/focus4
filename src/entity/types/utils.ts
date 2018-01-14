import {isObservableArray} from "mobx";

import {EntityField, FieldEntry, ListEntry, ObjectEntry} from "./entity";
import {StoreListNode, StoreNode} from "./store";

export function isEntityField(data: any): data is EntityField {
    return !!(data as EntityField).$field;
}

export function isFieldEntry(data: FieldEntry | ObjectEntry | ListEntry): data is FieldEntry {
    return !!(data as FieldEntry).name;
}

export function isStoreListNode<T extends StoreNode>(data: any): data is StoreListNode<T>;
export function isStoreListNode<T>(data: any): data is StoreListNode<StoreNode<T>> {
    return isObservableArray(data) && !!(data as StoreListNode).$entity;
}

export function isStoreNode<T>(data: any): data is StoreNode<T> {
    return !!(data as StoreNode).set;
}
