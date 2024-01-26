import {upperFirst} from "lodash";
import {action, extendObservable, observable, when} from "mobx";
import {v4} from "uuid";

import {config, requestStore} from "@focus4/core";

import {ReferenceDefinition, ReferenceStore} from "./types";
import {filter, getLabel} from "./util";

/** Id du suivi de requêtes du ReferenceStore. */
export const referenceTrackingId = v4();

/**
 * Construit un store de référence à partir de la config donnée.
 * (Les valeurs données aux différentes listes de références de la config n'importent peu et ne servent que pour le typage)
 * @param referenceLoader Le service de chargement des listes de référence, par nom.
 * @param refConfig Un objet dont les propriétés représentent les noms des listes de référence. Le type de chaque objet ne doit pas contenir la liste.
 */
export function makeReferenceStore<T extends Record<string, ReferenceDefinition>>(
    referenceLoader: (refName: string) => Promise<{}[]>,
    refConfig: T,
    referenceClearer?: (refName?: string) => Promise<void>
): ReferenceStore<T> {
    const referenceStore: any = {};
    for (const ref in refConfig) {
        // On initialise un champ "caché" qui contient la liste de référence, avec une liste vide, ainsi que les clés de valeur et libellé, le résolveur de libellé et la surcharge de filter.
        referenceStore[`_${ref}`] = observable.array([], {deep: false});
        referenceStore[`_${ref}`].$valueKey = refConfig[ref].valueKey || "code";
        referenceStore[`_${ref}`].$labelKey = refConfig[ref].labelKey || "label";
        referenceStore[`_${ref}`].getLabel = (value: any) => getLabel(value, referenceStore[`_${ref}`]);
        referenceStore[`_${ref}`].filter = (callbackFn: any) => filter(referenceStore[`_${ref}`], callbackFn);
        referenceStore[`_${ref}_trackingIds`] = new Map<string, string[]>();

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
                    requestStore
                        .track(
                            [
                                referenceTrackingId,
                                ...Array.from<string[]>(referenceStore[`_${ref}_trackingIds`].values()).flat()
                            ],
                            () => referenceLoader(ref)
                        )
                        .then(
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

    referenceStore.get = async (refName: string & keyof T) => {
        await when(() => referenceStore[refName].length > 0);
        return referenceStore[refName];
    };

    referenceStore.reload = async (refName?: string & keyof T) => {
        if (refName) {
            if (referenceClearer) {
                await referenceClearer(refName);
            }
            referenceStore[`_${refName}_cache`] = undefined;
        } else {
            if (referenceClearer) {
                await referenceClearer();
            }
            for (const ref in refConfig) {
                referenceStore[`_${ref}_cache`] = undefined;
            }
        }
    };

    referenceStore.track = (trackingIds: string | string[], ...refNames: (string & keyof T)[]) => {
        if (!refNames.length) {
            refNames = Object.keys(refConfig);
        }
        if (!Array.isArray(trackingIds)) {
            trackingIds = [trackingIds];
        }
        const id = v4();
        for (const refName of refNames) {
            referenceStore[`_${refName}_trackingIds`].set(id, trackingIds);
        }
        return () => {
            for (const refName of refNames) {
                referenceStore[`_${refName}_trackingIds`].delete(id);
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
