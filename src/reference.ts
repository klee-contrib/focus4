import {action, computed, IObservableArray, observable} from "mobx";

/** Description de la factory de services de chargement de listes de référence. */
export type ServiceFactory = (refName: string) => () => Promise<{}[]>;

const CACHE_DURATION = 1000 * 60 * 60;

/** Cache des listes de références */
const cache: {[key: string]: {timeStamp: number, value: {}[]}} = {};

function cacheData(key: string, value: {}[]) {
    cache[key] = {timeStamp: new Date().getTime(), value};
}

/** Mapping de type pour transformer les types d'entrée en liste de ces même types. */
export type AsList<T> = {
    [P in keyof T]: IObservableArray<T[P]>
};

/**
 * Construit un store de référence à partir de la config donnée.
 * (Les valeurs données aux différentes listes de références de la config n'importent peu et ne servent que pour le typage)
 * @param serviceFactory Une fonction qui pour un nom de référence donné renvoie une fonction sans paramètre qui effectue la requête serveur.
 * @param config Un objet dont les propriétés représentent les noms des listes de référence. Le type de chaque objet ne doit pas contenir la liste.
 */
export function makeReferenceStore<T extends Record<string, {}>>(serviceFactory: ServiceFactory, config: T): AsList<T> {
    const referenceStore: any = {};
    for (const ref in config) {

        // On initialise un champ "caché" qui contient la liste de référence, avec une liste vide.
        referenceStore[`_${ref}`] = observable.shallowArray();

        // On définit le getter de la liste de référence par une dérivation MobX.
        referenceStore[ref] = computed(() => {

            // Si on n'est pas en train de charger et que la donnée n'est pas dans le cache, alors on appelle le service de chargement.
            if (!referenceStore[`_${ref}_loading`] && !(cache[ref] && (new Date().getTime() - cache[ref].timeStamp) < CACHE_DURATION)) {

                referenceStore[`_${ref}_loading`] = true;

                /* Le service de chargement est appelé dans une autre stack parce que l'appel va déclencher une mise à jour d'état (dans le RequestStore),
                   et qu'on ne peut pas changer de l'état dans une dérivation. */
                setTimeout(() => serviceFactory(ref)().then(action((refList: {}[]) => {
                    cacheData(ref, refList);
                    referenceStore[`_${ref}`].replace(refList);
                    delete referenceStore[`_${ref}_loading`];
                })), 0);
            }

            // Dans tous les cas, on renvoie la liste "cachée". Ainsi, sa mise à jour relancera toujours la dérivation.
            return referenceStore[`_${ref}`];
        });
    }

    return observable(referenceStore);
}
