import {useState} from "react";

import {Entity, EntityToPartialType} from "@focus4/entities";
import {makeStoreNode, StoreListNode, StoreNode} from "@focus4/stores";

/**
 * Crée un StoreListNode dans un state du composant à partir d'une définition d'entité.
 * @param entity Un tuple une seule entité (pour différencier la création d'un StoreListNode de celle d'un StoreNode).
 * @param initialData Les données initiales du store.
 */
export function useStoreNode<E extends Entity>(entity: [E], initialData?: EntityToPartialType<E>[]): StoreListNode<E>;
/**
 * Crée un StoreNode dans un state du composant à partir d'une définition d'entité.
 * @param entity L'entité.
 * @param initialData Les données initiales du store.
 */
export function useStoreNode<E extends Entity>(entity: E, initialData?: EntityToPartialType<E>): StoreNode<E>;
export function useStoreNode<E extends Entity>(
    entity: E | [E],
    initialData?: EntityToPartialType<E> | EntityToPartialType<E>[]
): StoreListNode<E> | StoreNode<E> {
    const [node] = useState(() => makeStoreNode(entity as E, initialData as EntityToPartialType<E>));
    return node;
}
