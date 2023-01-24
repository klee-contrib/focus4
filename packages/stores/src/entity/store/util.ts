import {isUndefined, mapValues, omitBy} from "lodash";

import {
    FormListNode,
    FormNode,
    isEntityField,
    isFormEntityField,
    isStoreListNode,
    isStoreNode,
    NodeToType,
    StoreListNode,
    StoreNode
} from "../types";

/**
 * Met à plat un noeud de store pour récupèrer sa valeur "brute".
 * @param entityStoreItem Le noeud de store à mettre à plat.
 * @param includeAddedFields Inclus les champs ajoutés (pour un FormNode) dans la valeur retournée.
 */
export function toFlatValues<SN extends FormListNode | FormNode | StoreListNode | StoreNode>(
    storeNode: SN,
    includeAddedFields?: boolean
): NodeToType<SN> {
    // Cas entrée liste : on appelle `toFlatValues` sur chaque élément.
    if (isStoreListNode(storeNode)) {
        return storeNode.map(item => toFlatValues(item, includeAddedFields)) as NodeToType<SN>;
    } else {
        // Cas entrée simple : on parcourt chaque champ et on enlève les valeurs `undefined`.
        return omitBy(
            mapValues(storeNode, (item, entry) => {
                if (entry === "sourceNode") {
                    // On ne récupère pas le `sourceNode` d'un FormNode.
                    return undefined;
                } else if (isStoreListNode(item)) {
                    // Cas entrée liste -> `toFlatValues` sur chaque élément.
                    return item.map(i => toFlatValues(i, includeAddedFields));
                } else if (isStoreNode(item)) {
                    // Cas entrée simple -> `toFlatValues`.
                    return toFlatValues(item, includeAddedFields);
                } else if (isEntityField(item) && (includeAddedFields || !isFormEntityField(item) || !item._added)) {
                    /*
                     * Cas du champ : on renvoie la valeur.
                     * Les champs ajoutés (via `add`) dans un FormNode sont ignorés.
                     */
                    return item.value;
                } else {
                    return undefined; // Tout le reste : on en veut pas.
                }
            }),
            isUndefined // On enlève tous les champs vides / ignorés.
        ) as NodeToType<SN>;
    }
}
