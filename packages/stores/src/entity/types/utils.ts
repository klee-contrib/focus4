import {isObservableArray} from "mobx";

import {Entity, EntityToPartialType, EntityToType} from "@focus4/entities";

import {FormEntityField, FormListNode, FormNode} from "./form";
import {EntityField, StoreListNode, StoreNode} from "./store";

/** Récupère le type de l'objet de l'entité contenue dans un noeud, avec les champs obligatoires non optionnels. */
export type NodeType<SN> =
    SN extends FormListNode<infer LEF, infer _>
        ? EntityToType<LEF>[]
        : SN extends FormNode<infer OEF, infer __>
          ? EntityToType<OEF>
          : SN extends StoreListNode<infer LE>
            ? EntityToType<LE>[]
            : SN extends StoreNode<infer OE>
              ? EntityToType<OE>
              : never;

/** Récupère le type de l'objet de l'entité contenue dans un noeud, avec les champs obligatoires optionnels. */
export type NodePartialType<SN> =
    SN extends FormListNode<infer LEF, infer _>
        ? EntityToPartialType<LEF>[]
        : SN extends FormNode<infer OEF, infer __>
          ? EntityToPartialType<OEF>
          : SN extends StoreListNode<infer LE>
            ? EntityToPartialType<LE>[]
            : SN extends StoreNode<infer OE>
              ? EntityToPartialType<OE>
              : never;

/** Récupère le type de l'objet de l'entité contenue dans un noeud source d'un formulaire, avec les champs obligatoires non optionnels. */
export type SourceNodeType<FN extends FormNode | FormListNode> = NodeType<FN["sourceNode"]>;

/** Récupère le type de l'objet de l'entité contenue dans un noeud source d'un formulaire, avec les champs obligatoires optionnels. */
export type SourceNodePartialType<FN extends FormNode | FormListNode> = NodePartialType<FN["sourceNode"]>;

export function isEntityField(data: any): data is EntityField {
    return data && typeof data === "object" && "$field" in data;
}

export function isAnyStoreNode<E extends Entity = any>(data: any): data is StoreListNode<E> | StoreNode<E> {
    return isStoreNode(data) || isStoreListNode(data);
}

export function isStoreListNode<E extends Entity = any>(data: any): data is StoreListNode<E> {
    return data && !!(data as StoreListNode).replaceNodes && isObservableArray(data);
}

export function isStoreNode<E extends Entity = any>(data: any): data is StoreNode<E> {
    return data && !!(data as StoreNode).set && !!(data as StoreNode).clear;
}

export function isAnyFormNode<E extends Entity = any>(data: any): data is FormListNode<E> | FormNode<E> {
    return data && !!(data as FormNode).form;
}

export function isFormNode<E extends Entity = any>(data: any): data is FormNode<E> {
    return isStoreNode(data) && isAnyFormNode(data);
}

export function isFormListNode<E extends Entity = any>(data: any): data is FormListNode<E> {
    return isStoreListNode(data) && isAnyFormNode(data);
}

export function isFormEntityField(data: any): data is FormEntityField {
    return isEntityField(data) && (data as FormEntityField).isEdit !== undefined;
}
