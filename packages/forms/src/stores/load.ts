import {autorun} from "mobx";
import {useEffect, useId, useRef, useState} from "react";

import {
    NodeLoadBuilder,
    ReferenceDefinition,
    ReferenceStore,
    registerLoad,
    StoreListNode,
    StoreNode
} from "@focus4/stores";

/**
 * Enregistre un service de chargement sur un StoreNode.
 * @param node StoreNode.
 * @param loadBuilder Service de chargement et paramètres.
 * @param deps Array de dépendances.
 * @returns Etat de chargement.
 */
export function useLoad<SN extends StoreListNode | StoreNode>(
    node: SN,
    loadBuilder: (builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN>,
    deps: any[] = []
) {
    const [isLoading, setIsLoading] = useState(false);
    const trackingId = useId();
    useEffect(() => {
        const res = registerLoad(node, loadBuilder, trackingId);
        const disposer = autorun(() => setIsLoading(res.isLoading));
        return () => {
            disposer();
            res.dispose();
        };
    }, deps);
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
