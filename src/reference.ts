import {upperFirst} from "lodash";
import {action, computed, extendObservable, observable} from "mobx";

import {config} from "./config";

/** Description du service de chargement de listes de référence. */
export type ReferenceLoader = (refName: string) => Promise<{}[]>;

/** Définition d'un type de référence. */
export interface ReferenceDefinition<T = {}> {
    /** Propriété représentant le libellé. */
    labelKey?: string;
    /** Le type de la liste. */
    type: T;
    /** Propriété représentant la valeur. */
    valueKey?: string;
}

export interface ReferenceList<T = {}> extends Array<T> {
    /** Propriété représentant le libellé. */
    $labelKey?: string;
    /** Propriété représentant la valeur. */
    $valueKey?: string;
}

/** Mapping de type pour transformer les types d'entrée en liste de ces même types. */
export type AsList<T extends Record<string, ReferenceDefinition>> = {
    [P in keyof T]: ReferenceList<T[P]["type"]>
};

/**
 * Construit un store de référence à partir de la config donnée.
 * (Les valeurs données aux différentes listes de références de la config n'importent peu et ne servent que pour le typage)
 * @param referenceLoader Le service de chargement des listes de référence, par nom.
 * @param refConfig Un objet dont les propriétés représentent les noms des listes de référence. Le type de chaque objet ne doit pas contenir la liste.
 */
export function makeReferenceStore<T extends Record<string, ReferenceDefinition>>(referenceLoader: ReferenceLoader, refConfig: T): AsList<T> & {
    /**
     * Recharge une liste ou le store.
     * @param refName L'éventuelle liste demandée.
     */
    reload(refName?: keyof T): void;
} {
    const referenceStore: any = {};
    for (const ref in refConfig) {

        // On initialise un champ "caché" qui contient la liste de référence, avec une liste vide, ainsi que les clés de valeur et libellé.
        referenceStore[`_${ref}`] = observable.array([], {deep: false});
        referenceStore[`_${ref}`].$labelKey = refConfig[ref].labelKey;
        referenceStore[`_${ref}`].$valueKey = refConfig[ref].valueKey;
        extendObservable(referenceStore, {
            // Le timestamp qui sert au cache est stocké dans le store et est observable. Cela permettra de forcer le rechargement en le vidant.
            [`_${ref}_cache`]: undefined,
            // On définit le getter de la liste de référence par une dérivation MobX.
            [ref]: () => {
                // Si on n'est pas en train de charger et que la donnée n'est pas dans le cache, alors on appelle le service de chargement.
                if (!referenceStore[`_${ref}_loading`] && !(referenceStore[`_${ref}_cache`] && (new Date().getTime() - referenceStore[`_${ref}_cache`]) < config.referenceCacheDuration)) {
                    referenceStore[`_${ref}_loading`] = true;

                    /* Le service de chargement est appelé dans une autre stack parce que l'appel va déclencher une mise à jour d'état (dans le RequestStore),
                        et qu'on ne peut pas changer de l'état dans une dérivation. */
                    setTimeout(() => referenceLoader(ref)
                        .then(action(`set${upperFirst(ref)}List`, (refList: {}[]) => {
                            referenceStore[`_${ref}_cache`] = new Date().getTime();
                            referenceStore[`_${ref}`].replace(refList);
                            delete referenceStore[`_${ref}_loading`];
                        })),
                    0);
                }

                // Dans tous les cas, on renvoie la liste "cachée". Ainsi, sa mise à jour relancera toujours la dérivation.
                return referenceStore[`_${ref}`];
            }
        }, {
            [ref]: computed
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
export function makeReferenceList<T>(list: T[], {labelKey, valueKey}: {labelKey?: string, valueKey?: string}) {
    const newList = [...list] as ReferenceList<T>;
    newList.$valueKey = valueKey || (list as ReferenceList<T>).$valueKey;
    newList.$labelKey = labelKey || (list as ReferenceList<T>).$labelKey;
    return newList;
}
