import {upperFirst} from "lodash";
import {action, extendObservable, observable} from "mobx";

import {config} from "./config";

/** Description du service de chargement de listes de référence. */
export type ReferenceLoader = (refName: string) => Promise<{}[]>;

/** Définition d'un type de référence. */
export interface ReferenceDefinition<T = any, VK extends keyof T = any, LK extends keyof T = any> {
    /** Propriété représentant le libellé. */
    labelKey: LK;
    /** Le type de la liste. */
    type: T;
    /** Propriété représentant la valeur. */
    valueKey: VK;
}

export interface ReferenceList<T = any, VK extends keyof T = any, LK extends keyof T = any> extends Array<T> {
    /** Propriété représentant le libellé. */
    $labelKey: LK;
    /** Propriété représentant la valeur. */
    $valueKey: VK;
    /**
     * Obtient le libellé d'un item à partir de la valeur.
     * @param value Valeur de l'item.
     */
    getLabel(value: T[VK] | undefined): T[LK] | undefined;
}

/** Mapping de type pour transformer les types d'entrée en liste de ces même types. */
export type AsList<T extends Record<string, ReferenceDefinition>> = {
    [P in keyof T]: ReferenceList<T[P]["type"], T[P]["valueKey"], T[P]["labelKey"]>
};

/**
 * Construit un store de référence à partir de la config donnée.
 * (Les valeurs données aux différentes listes de références de la config n'importent peu et ne servent que pour le typage)
 * @param referenceLoader Le service de chargement des listes de référence, par nom.
 * @param refConfig Un objet dont les propriétés représentent les noms des listes de référence. Le type de chaque objet ne doit pas contenir la liste.
 */
export function makeReferenceStore<T extends Record<string, ReferenceDefinition>>(
    referenceLoader: ReferenceLoader,
    refConfig: T
): AsList<T> & {
    /**
     * Recharge une liste ou le store.
     * @param refName L'éventuelle liste demandée.
     */
    reload(refName?: keyof T): void;
} {
    const referenceStore: any = {};
    for (const ref in refConfig) {
        // On initialise un champ "caché" qui contient la liste de référence, avec une liste vide, ainsi que les clés de valeur et libellé et le résolveur de libellé.
        referenceStore[`_${ref}`] = observable.array([], {deep: false});
        referenceStore[`_${ref}`].$valueKey = refConfig[ref].valueKey || "code";
        referenceStore[`_${ref}`].$labelKey = refConfig[ref].labelKey || "label";
        referenceStore[`_${ref}`].getLabel = (value: any) => getLabel(value, referenceStore[`_${ref}`]);

        extendObservable(referenceStore, {
            // Le timestamp qui sert au cache est stocké dans le store et est observable. Cela permettra de forcer le rechargement en le vidant.
            [`_${ref}_cache`]: undefined,
            // On définit le getter de la liste de référence par une dérivation MobX.
            get [ref]() {
                // Si on n'est pas en train de charger et que la donnée n'est pas dans le cache, alors on appelle le service de chargement.
                if (
                    !referenceStore[`_${ref}_loading`] &&
                    !(
                        referenceStore[`_${ref}_cache`] &&
                        new Date().getTime() - referenceStore[`_${ref}_cache`] < config.referenceCacheDuration
                    )
                ) {
                    referenceStore[`_${ref}_loading`] = true;

                    // On effectue l'appel et on met à jour la liste.
                    referenceLoader(ref).then(
                        action(`set${upperFirst(ref)}List`, (refList: {}[]) => {
                            referenceStore[`_${ref}_cache`] = new Date().getTime();
                            referenceStore[`_${ref}`].replace(refList);
                            delete referenceStore[`_${ref}_loading`];
                        })
                    );
                }

                // Dans tous les cas, on renvoie la liste "cachée". Ainsi, sa mise à jour relancera toujours la dérivation.
                return referenceStore[`_${ref}`];
            }
        });
    }

    referenceStore.reload = (refName?: keyof T) => {
        if (refName) {
            referenceStore[`_${refName}_cache`] = undefined;
        } else {
            for (const ref in refConfig) {
                referenceStore[`_${ref}_cache`] = undefined;
            }
        }
    };

    return referenceStore;
}

/**
 * Ajoute les clés pour faire une liste de référence.
 * @param list La liste.
 * @param keys Les clés pour la liste.
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
    const newList = [...list] as ReferenceList<T, VK, LK>;
    newList.$valueKey = valueKey || (list as ReferenceList<T>).$valueKey || "code";
    newList.$labelKey = labelKey || (list as ReferenceList<T>).$labelKey || "label";
    newList.getLabel = value => getLabel(value, newList);
    return newList;
}

/**
 * Obtient le libellé d'un item d'une liste de référence à partir d'une valeur.
 * @param value Valeur de l'item.
 * @param list Liste des items
 */
function getLabel<T, VK extends keyof T, LK extends keyof T>(
    value: T[VK] | undefined,
    list: ReferenceList<T, VK, LK>
): T[LK] | undefined {
    if (!value) {
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
