import {isObservableArray} from "mobx";

import {Entity, EntityField} from "./entity";
import {FormListNode, FormNode} from "./form";
import {StoreListNode, StoreNode} from "./store";
import {RegexValidator, Validator} from "./validation";

export function isEntityField(data: any): data is EntityField {
    return !!(data as EntityField).$field;
}

export function isRegex(validator: Validator): validator is RegexValidator {
    return !!(validator as RegexValidator).regex;
}

export function isStoreListNode<T extends Entity = any>(data: any): data is StoreListNode<T> {
    return isObservableArray(data) && !!(data as StoreListNode).$entity;
}

export function isStoreNode<T extends Entity = any>(data: any): data is StoreNode<T> {
    return !!(data as StoreNode).set;
}

export function isAnyFormNode<T extends Entity = any>(data: any): data is FormNode<T> | FormListNode<T> {
    return !!(data as FormNode).form;
}

export function isFormNode<T extends Entity = any>(data: any): data is FormNode<T> {
    return isStoreNode(data) && isAnyFormNode(data);
}

export function isFormListNode<T extends Entity = any>(data: any): data is FormListNode<T> {
    return isStoreListNode(data) && isAnyFormNode(data);
}
