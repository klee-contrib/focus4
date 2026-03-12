import {useState} from "react";

import {Entity} from "@focus4/entities";
import {makeLocalCollectionStore, makeServerCollectionStore, ServerCollectionStore} from "@focus4/stores";
import {
    LocalCollectionStoreConfig,
    SearchService,
    ServerCollectionStoreInitProperties
} from "@focus4/stores/lib/collection/types";

/**
 * Crée un store de collection local stocké dans un state du component, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes côté client.
 * La liste pourra être renseignée manuellement via une affectation à la propriété `list` du store, ou vient en utilisant `useLoad`.
 * @param config Configuration du store local.
 */
export function useLocalCollectionStore<T extends object>(config?: Partial<LocalCollectionStoreConfig<T>>) {
    const [store] = useState(() => makeLocalCollectionStore(config));
    return store;
}

/**
 * Crée un store de collection serveur stocké dans un state du component, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes via une API dédiée à implémenter sur votre serveur.
 * @param service Le service de recherche.
 * @param criteria La description du critère de recherche personnalisé.
 * @param initialQuery Les paramètres de recherche à l'initilisation.
 */
export function useServerCollectionStore<T extends object, C extends Entity, NC extends Entity = C>(
    service: SearchService<T, C>,
    criteria?: C,
    initialQuery?: ServerCollectionStoreInitProperties<C, NC>
): ServerCollectionStore<T, C, NC>;
/**
 * Crée un store de collection serveur stocké dans un state du component, pour pouvoir gérer de la sélection, ainsi du tri, des filtres et/ou des facettes via une API dédiée à implémenter sur votre serveur.
 * @param initialQuery Les paramètres de recherche à l'initilisation.
 * @param service Le service de recherche.
 * @param criteria La description du critère de recherche personnalisé.
 */
export function useServerCollectionStore<T extends object, C extends Entity, NC extends Entity = C>(
    service: SearchService<T, C>,
    initialQuery?: ServerCollectionStoreInitProperties<C, NC>,
    criteria?: C
): ServerCollectionStore<T, C, NC>;
export function useServerCollectionStore(service: SearchService<any, any>, secondParam?: any, thirdParam?: any) {
    const [store] = useState(() => makeServerCollectionStore(service, secondParam, thirdParam));
    return store;
}
