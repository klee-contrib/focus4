import {isObservableArray} from "mobx";

import {Entity, EntityField} from "./entity";
import {FormListNode, FormNode} from "./form";
import {StoreListNode, StoreNode} from "./store";
import {RegexValidator, Validator} from "./validation";

export function isEntityField(data: any): data is EntityField {
    return data && !!(data as EntityField).$field;
}

export function isRegex(validator: Validator): validator is RegexValidator {
    return validator && !!(validator as RegexValidator).regex;
}

export function isAnyStoreNode<T extends Entity = any>(data: any): data is StoreNode<T> | StoreListNode<T> {
    return data && !!(data as StoreNode).set && !!(data as StoreNode).clear;
}

export function isStoreListNode<T extends Entity = any>(data: any): data is StoreListNode<T> {
    return isAnyStoreNode(data) && isObservableArray(data);
}

export function isStoreNode<T extends Entity = any>(data: any): data is StoreNode<T> {
    return isAnyStoreNode(data) && !isObservableArray(data);
}

export function isAnyFormNode<T extends Entity = any>(data: any): data is FormNode<T> | FormListNode<T> {
    return data && !!(data as FormNode).form;
}

export function isFormNode<T extends Entity = any>(data: any): data is FormNode<T> {
    return isStoreNode(data) && isAnyFormNode(data);
}

export function isFormListNode<T extends Entity = any>(data: any): data is FormListNode<T> {
    return isStoreListNode(data) && isAnyFormNode(data);
}
