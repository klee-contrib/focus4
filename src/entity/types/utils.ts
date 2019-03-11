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

export function isAnyStoreNode<E extends Entity = any>(data: any): data is StoreNode<E> | StoreListNode<E> {
    return data && !!(data as StoreNode).set && !!(data as StoreNode).clear;
}

export function isStoreListNode<E extends Entity = any>(data: any): data is StoreListNode<E> {
    return isAnyStoreNode(data) && isObservableArray(data);
}

export function isStoreNode<E extends Entity = any>(data: any): data is StoreNode<E> {
    return isAnyStoreNode(data) && !isObservableArray(data);
}

export function isAnyFormNode<E extends Entity = any>(data: any): data is FormNode<E> | FormListNode<E> {
    return data && !!(data as FormNode).form;
}

export function isFormNode<E extends Entity = any>(data: any): data is FormNode<E> {
    return isStoreNode(data) && isAnyFormNode(data);
}

export function isFormListNode<E extends Entity = any>(data: any): data is FormListNode<E> {
    return isStoreListNode(data) && isAnyFormNode(data);
}
