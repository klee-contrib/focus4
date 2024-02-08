import {ReferenceList} from "./types";

/**
 * Construit une liste de référence à partir d'une liste classique.
 *
 * @param list La liste.
 * @param keys Les propriétés à faire correspondre à `valueKey` et `labelKey`, si ce n'est pas `"code"` ou `"label"`.
 */
export function makeReferenceList<T extends {code: any; label: any}>(list: T[]): ReferenceList<T, "code", "label">;
export function makeReferenceList<T extends {label: any}, VK extends keyof T>(
    list: T[],
    {valueKey}: {valueKey: VK}
): ReferenceList<T, VK, "label">;
export function makeReferenceList<T extends {code: any}, LK extends keyof T>(
    list: T[],
    {labelKey}: {labelKey: LK}
): ReferenceList<T, "code", LK>;
export function makeReferenceList<T, VK extends keyof T, LK extends keyof T>(
    list: T[],
    {labelKey, valueKey}: {labelKey: LK; valueKey: VK}
): ReferenceList<T, VK, LK>;
export function makeReferenceList<T, VK extends keyof T, LK extends keyof T>(
    list: T[],
    {labelKey, valueKey}: {labelKey?: LK; valueKey?: VK} = {}
) {
    const newList = list.slice() as ReferenceList<T, VK, LK>;
    newList.$valueKey = valueKey ?? (list as ReferenceList<T>).$valueKey ?? "code";
    newList.$labelKey = labelKey ?? (list as ReferenceList<T>).$labelKey ?? "label";
    newList.getLabel = value => getLabel(value, newList);
    newList.filter = callbackFn => filter(newList, callbackFn);
    return newList;
}

/** Crée une liste de référence vide. */
export function emptyReferenceList<T>(): ReferenceList<T> {
    return makeReferenceList([]);
}

/**
 * Filtre une liste de référence en gardant ses paramètres.
 * @param list La liste de référence.
 * @param callbackfn Le callback.
 */
export function filter<T, VK extends keyof T, LK extends keyof T>(
    list: ReferenceList<T, VK, LK>,
    callbackfn: (value: T, index: number, array: T[]) => unknown
) {
    return makeReferenceList(Array.prototype.filter.call(list, callbackfn), {
        labelKey: list.$labelKey,
        valueKey: list.$valueKey
    });
}

/**
 * Obtient le libellé d'un item d'une liste de référence à partir d'une valeur.
 * @param value Valeur de l'item.
 * @param list Liste des items
 */
export function getLabel<T, VK extends keyof T, LK extends keyof T>(
    value: T[VK] | undefined,
    list: ReferenceList<T, VK, LK>
): T[LK] | undefined {
    if (value === undefined) {
        return undefined;
    }

    /* Cherche l'item. */
    const item = list.find(s => s[list.$valueKey] === value);

    /* Cas où l'item est introuvable. */
    if (!item) {
        return undefined;
    }

    /* Item trouvé : on extrait le libellé. */
    return item[list.$labelKey];
}
