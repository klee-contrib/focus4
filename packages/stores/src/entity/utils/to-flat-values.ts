import {isUndefined, mapValues, omitBy} from "es-toolkit";

import {
    FormListNode,
    FormNode,
    isEntityField,
    isStoreListNode,
    isStoreNode,
    NodePartialType,
    StoreListNode,
    StoreNode
} from "../types";

import {isAdded, isEmpty, isRequired} from "./is-empty";

/**
 * @deprecated Utiliser `getValues` sur le noeud de store à la place.
 * Met à plat un noeud de store pour récupèrer sa valeur "brute".
 * @param storeNode Le noeud de store à mettre à plat.
 * @param includeAddedFields Inclus les champs ajoutés (pour un FormNode) dans la valeur retournée.
 */
export function toFlatValues<SN extends FormListNode | FormNode | StoreListNode | StoreNode>(
    storeNode: SN,
    includeAddedFields?: boolean
): NodePartialType<SN>;
/** @internal */
export function toFlatValues<SN extends FormListNode | FormNode | StoreListNode | StoreNode>(
    storeNode: SN,
    includeAddedFields?: boolean,
    allowUndefined?: boolean,
    fieldPrefix?: string
): NodePartialType<SN>;
export function toFlatValues<SN extends FormListNode | FormNode | StoreListNode | StoreNode>(
    storeNode: SN,
    includeAddedFields = false,
    allowUndefined = false,
    fieldPrefix = ""
): NodePartialType<SN> {
    let result;

    // Cas entrée liste : on appelle `toFlatValues` sur chaque élément.
    if (isStoreListNode(storeNode)) {
        result = storeNode.map((item, i) =>
            toFlatValues(item, includeAddedFields, allowUndefined, `${fieldPrefix}[${i}]`)
        ) as NodePartialType<SN>;
    } else {
        // Cas entrée simple : on parcourt chaque champ et on enlève les valeurs `undefined`.
        result = omitBy(
            mapValues(storeNode, (item, entry: keyof SN & string) => {
                if (entry === "sourceNode") {
                    // On ne récupère pas le `sourceNode` d'un FormNode.
                    return undefined;
                } else if (!includeAddedFields && isAdded(item)) {
                    // On exclue tous les champs ajoutés si on en veut pas.
                    return undefined;
                } else if (isEmpty(item, true)) {
                    if (isRequired(item)) {
                        if (!allowUndefined) {
                            console.error(
                                `getValues() - champ obligatoire manquant : ${fieldPrefix ? `${fieldPrefix}.${entry}` : `${entry}`}`
                            );
                        }
                        if (isStoreListNode(item)) {
                            return [];
                        } else if (isStoreNode(item)) {
                            return {};
                        }
                    }
                    return undefined;
                } else if (isStoreListNode(item)) {
                    // Cas entrée liste -> `toFlatValues` sur chaque élément.
                    return item.map((i, idx) =>
                        toFlatValues(
                            i,
                            includeAddedFields,
                            allowUndefined,
                            `${fieldPrefix ? `${fieldPrefix}.${entry}` : `${entry}`}[${idx}]`
                        )
                    );
                } else if (isStoreNode(item)) {
                    // Cas entrée simple -> `toFlatValues`.
                    return toFlatValues(
                        item,
                        includeAddedFields,
                        allowUndefined,
                        `${fieldPrefix ? `${fieldPrefix}.${entry}` : `${entry}`}`
                    );
                } else if (isEntityField(item)) {
                    // Cas du champ : on renvoie la valeur.
                    return item.value;
                } else {
                    return undefined; // Tout le reste : on en veut pas.
                }
            }),
            isUndefined // On enlève tous les champs vides / ignorés.
        ) as NodePartialType<SN>;
    }

    return result;
}
