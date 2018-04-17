import {isUndefined, mapValues, omitBy} from "lodash";
import {isComputedProp, isObservableArray} from "mobx";

import {isEntityField, isStoreListNode, isStoreNode, NodeToType} from "../types";

/**
 * Met à plat un noeud de store pour récupèrer sa valeur "brute".
 * @param entityStoreItem Le noeud de store à mettre à plat.
 */
export function toFlatValues<T>(storeNode: T): NodeToType<T> {
    // Cas entrée liste : on appelle `toFlatValues` sur chaque élément.
    if (isStoreListNode(storeNode)) {
        return storeNode.map(toFlatValues) as any;
    } else {
        // Cas entrée simple : on parcourt chaque champ et on enlève les valeurs `undefined`.
        return omitBy(mapValues(storeNode, (item, entry) => {
            if (entry === "sourceNode") { // On ne récupère pas le `sourceNode` d'un FormNode.
                return undefined;
            } else if (isStoreListNode(item)) { // Cas entrée liste -> `toFlatValues` sur chaque élément.
                return item.map(toFlatValues);
            } else if (isStoreNode(item)) { // Cas entrée simple -> `toFlatValues`.
                return toFlatValues(item);
            } else if (isObservableArray(item.value)) { // Cas array de primitive -> array simple.
                return item.value.slice();
            } else if (isEntityField(item) && !isComputedProp(item, "value")) { // Cas `EntityField` simple.
                return item.value;
            } else {
                return undefined; // Cas champ calculé : on le retire.
            }
        }), isUndefined) as any;
    }
}
