import {extendObservable, observable, when} from "mobx";

import {coreConfig, requestStore} from "@focus4/core";

import {ReferenceDefinition, ReferenceList, ReferenceStore} from "./types";
import {filter, getLabel} from "./util";

/** Id du suivi de requêtes du ReferenceStore. */
export const referenceTrackingId = Math.random().toString();

/**
 * Construit un store de référence à partir d'un service de chargement et de définitions de listes de référence à charger.
 *
 * Le store de référence pourra être utilisé pour accéder aux listes de référence dans toute l'application sans avoir à se préoccuper de leur chargement.
 *
 * @param referenceLoader Le service de chargement des listes de référence, par nom.
 * @param refConfig Un objet dont les propriétés correspondent aux définitions de toutes les listes de référence souhaitées.
 * @param referenceClearer Un service pour réinitialiser une (ou toutes) les listes de référence sur le serveur.
 */
export function makeReferenceStore<C extends Record<string, ReferenceDefinition>>(
    referenceLoader: (refName: string) => Promise<object[]>,
    refConfig: C,
    referenceClearer?: (refName?: string) => Promise<void>
): ReferenceStore<C> {
    const referenceStore: any = {};
    for (const ref in refConfig) {
        // Si on passe une liste, on garde la liste, sinon on crée une liste observable pour stocker la liste qu'on va charger.
        const list = (
            "list" in refConfig[ref] ? refConfig[ref].list : observable.array([], {deep: false})
        ) as ReferenceList;

        // On renseigne les éléments de la liste de référence sur la liste.
        list.$valueKey = refConfig[ref].valueKey ?? "code";
        list.$labelKey = refConfig[ref].labelKey ?? "label";
        list.getLabel = (value: any) => getLabel(value, list);
        list.filter = (callbackFn: any) => filter(list, callbackFn);

        if ("type" in refConfig[ref]) {
            // Si on renseigne `type`, alors c'est une list qu'il faudra charger automatiquement du serveur.
            referenceStore[`_${ref}`] = list;
            referenceStore[getTrackingIdsKey(ref)] = new Map<string, string[]>();

            extendObservable(referenceStore, {
                // Le timestamp qui sert au cache est stocké dans le store et est observable. Cela permettra de forcer le rechargement en le vidant.
                [getCacheKey(ref)]: undefined,
                // On définit le getter de la liste de référence par une dérivation MobX.
                get [ref]() {
                    // Si on n'est pas en train de charger et que la donnée n'est pas dans le cache, alors on appelle le service de chargement.
                    if (
                        !referenceStore[getLoadingKey(ref)] &&
                        !(
                            referenceStore[getCacheKey(ref)] &&
                            Date.now() - referenceStore[getCacheKey(ref)] < coreConfig.referenceCacheDuration
                        )
                    ) {
                        referenceStore[getLoadingKey(ref)] = true;

                        // On effectue l'appel et on met à jour la liste.
                        requestStore.track(
                            [referenceTrackingId, ...[...referenceStore[getTrackingIdsKey(ref)].values()].flat()],
                            () => referenceLoader(ref),
                            refList => {
                                referenceStore[getCacheKey(ref)] = Date.now();
                                referenceStore[`_${ref}`].replace(refList);
                                delete referenceStore[getLoadingKey(ref)];
                            }
                        );
                    }

                    // Dans tous les cas, on renvoie la liste "cachée". Ainsi, sa mise à jour relancera toujours la dérivation.
                    return referenceStore[`_${ref}`];
                }
            });
        } else {
            // Sinon, on affecte simplement la liste de référence dans le store.
            referenceStore[ref] = list;
        }
    }

    referenceStore.get = async (refName: string & keyof C) => {
        await when(() => referenceStore[refName].length > 0);
        return referenceStore[refName];
    };

    referenceStore.reload = async (refName?: string & keyof C) => {
        if (refName) {
            if (getCacheKey(refName) in referenceStore) {
                if (referenceClearer) {
                    await referenceClearer(refName);
                }
                referenceStore[getCacheKey(refName)] = undefined;
            }
        } else {
            if (referenceClearer) {
                await referenceClearer();
            }
            for (const ref in refConfig) {
                if (getCacheKey(ref) in referenceStore) {
                    referenceStore[getCacheKey(ref)] = undefined;
                }
            }
        }
    };

    referenceStore.track = (trackingIds: string[] | string, ...refNames: (string & keyof C)[]) => {
        if (!refNames.length) {
            refNames = Object.keys(refConfig);
        }
        if (!Array.isArray(trackingIds)) {
            trackingIds = [trackingIds];
        }
        const id = Math.random().toString();
        for (const refName of refNames) {
            if (getTrackingIdsKey(refName) in referenceStore) {
                referenceStore[getTrackingIdsKey(refName)].set(id, trackingIds);
            }
        }
        return () => {
            for (const refName of refNames) {
                if (getTrackingIdsKey(refName) in referenceStore) {
                    referenceStore[getTrackingIdsKey(refName)].delete(id);
                }
            }
        };
    };

    extendObservable(referenceStore, {
        get isLoading() {
            return requestStore.isLoading(referenceTrackingId);
        }
    });

    return referenceStore;
}

function getCacheKey(ref: string) {
    return `_${ref}_cache`;
}

function getLoadingKey(ref: string) {
    return `_${ref}_loading`;
}

function getTrackingIdsKey(ref: string) {
    return `_${ref}_trackingIds`;
}
