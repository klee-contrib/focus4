import {isObservableArray} from "mobx";

import {EntityToType} from "@focus4/entities";

import {FormEntityField, FormListNode, FormNode} from "./form";
import {EntityField, StoreListNode, StoreNode} from "./store";

/** Génère l'objet JS "normal" équivalent à un noeud de store. */
export type NodeToType<SN> =
    SN extends FormListNode<infer LEF, infer _>
        ? EntityToType<LEF>[]
        : SN extends FormNode<infer OEF, infer __>
          ? EntityToType<OEF>
          : SN extends StoreListNode<infer LE>
            ? EntityToType<LE>[]
            : SN extends StoreNode<infer OE>
              ? EntityToType<OE>
              : never;

/** Génère l'objet JS "normal" équivalent au noeud source d'un FormNode. */
export type SourceNodeType<FN extends FormNode | FormListNode> = NodeToType<FN["sourceNode"]>;

export function isEntityField(data: any): data is EntityField {
    return data && typeof data === "object" && "$field" in data;
}

export function isAnyStoreNode<E = any>(data: any): data is StoreListNode<E> | StoreNode<E> {
    return isStoreNode(data) || isStoreListNode(data);
}

export function isStoreListNode<E = any>(data: any): data is StoreListNode<E> {
    return data && !!(data as StoreListNode).replaceNodes && isObservableArray(data);
}

export function isStoreNode<E = any>(data: any): data is StoreNode<E> {
    return data && !!(data as StoreNode).set && !!(data as StoreNode).clear;
}

export function isAnyFormNode<E = any>(data: any): data is FormListNode<E> | FormNode<E> {
    return data && !!(data as FormNode).form;
}

export function isFormNode<E = any>(data: any): data is FormNode<E> {
    return isStoreNode(data) && isAnyFormNode(data);
}

export function isFormListNode<E = any>(data: any): data is FormListNode<E> {
    return isStoreListNode(data) && isAnyFormNode(data);
}

export function isFormEntityField(data: any): data is FormEntityField {
    return isEntityField(data) && (data as FormEntityField).isEdit !== undefined;
}
