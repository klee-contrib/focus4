import {autorun} from "mobx";
import {useEffect, useId, useRef, useState} from "react";

import {
    CollectionStore,
    LoadRegistration,
    NodeLoadBuilder,
    ReferenceDefinition,
    ReferenceStore,
    StoreListNode,
    StoreNode
} from "@focus4/stores";

/**
 * Enregistre un service de chargement sur un store (`storeNode.load()` ou `collectionStore.search()`).
 *
 * Ce service sera rappelé automatiquement à chaque fois que les paramètres définis changent.
 *
 * @param node StoreNode, StoreListNode ou CollectionStore (local uniquement).
 * @param builder Builder pour le service de chargement (permet de définir les paramètres et le service).
 * @param deps Liste de dépendances (React) pour le service. Le builder sera redéfini à tout changement d'une valeur de cette liste, et le service de chargement sera rappelé.
 * @returns Etat de chargement et ID de suivi.
 */
export function useLoad<SN extends StoreListNode | StoreNode | CollectionStore>(
    node: SN,
    builder: (builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN>,
    deps: any[] = []
) {
    const trackingId = useId();
    const [loadRegistration] = useState(() => new LoadRegistration(node, builder(new NodeLoadBuilder()), trackingId));

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => autorun(() => setIsLoading(loadRegistration.isLoading)), []);

    useEffect(() => loadRegistration.register(node, builder(new NodeLoadBuilder())), [node, ...deps]);

    return [isLoading, trackingId] as const;
}

/**
 * Ajoute un (ou plusieurs) id(s) de suivi donné au chargement des listes de référence demandées.
 *
 * Cela permettra d'ajouter l'état de chargement au `isLoading` de cet(ces) id(s).
 * @param trackingIds Id(s) de suivi.
 * @param referenceStore Store de référence.
 * @param refNames Listes de références. Si non renseigné, suit toutes les listes de référence.
 */
export function useReferenceTracking<T extends Record<string, ReferenceDefinition>>(
    trackingIds: string[] | string,
    referenceStore: ReferenceStore<T>,
    ...refNames: (string & keyof T)[]
) {
    const dispose = useRef(referenceStore.track(trackingIds, ...refNames));
    useEffect(() => {
        dispose.current();
        dispose.current = referenceStore.track(trackingIds, ...refNames);
    }, [...(Array.isArray(trackingIds) ? trackingIds : [trackingIds]), ...refNames]);
}
