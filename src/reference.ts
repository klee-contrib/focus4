import {action, computed, IObservableArray, observable} from "mobx";

export type ServiceFactory = (refName: string) => () => Promise<{}[]>;

const CACHE_DURATION = 1000 * 60 * 60;
const cache: {[key: string]: {timeStamp: number, value: {}[]}} = {};

function getTimeStamp() {
    return new Date().getTime();
}

function cacheData(key: string, value: {}[]) {
    cache[key] = {timeStamp: getTimeStamp(), value};
}

export type AsList<T> = {
    [P in keyof T]: IObservableArray<T[P]>
};

/**
 * Construit un store de référence à partir de la config donnée.
 * (Les valeurs données aux différentes listes de références de la config n'importent peu et ne servent que pour le typage)
 * @param serviceFactory Une fonction qui pour un nom de référence donné renvoie une fonction sans paramètre qui effectue la requête serveur.
 * @param config Un objet dont les propriétés représentent les noms des listes de référence.
 */
export function makeReferenceStore<T extends Record<string, {}>>(serviceFactory: ServiceFactory, config: T): AsList<T> {
    const referenceStore: any = {};
    for (const ref in config) {
        referenceStore[`_${ref}`] = observable.shallowArray();
        referenceStore[ref] = computed(() => {
            if (!referenceStore[`_${ref}_loading`] && !(cache[ref] && (getTimeStamp() - cache[ref].timeStamp) < CACHE_DURATION)) {
                referenceStore[`_${ref}_loading`] = true;
                setTimeout(() => serviceFactory(ref)().then(action((refList: {}[]) => {
                    cacheData(ref, refList);
                    referenceStore[`_${ref}`].replace(refList);
                    delete referenceStore[`_${ref}_loading`];
                })), 0);
            }

            return referenceStore[`_${ref}`];
        });
    }

    return observable(referenceStore) as any;
}
