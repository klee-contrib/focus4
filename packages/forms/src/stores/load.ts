import {autorun} from "mobx";
import {useEffect, useState} from "react";

import {NodeLoadBuilder, registerLoad, StoreListNode, StoreNode} from "@focus4/stores";

/**
 * Enregistre un service de chargement sur un StoreNode.
 * @param node StoreNode.
 * @param loadBuilder Service de chargement et paramètres.
 * @param deps Array de dépendances.
 * @returns Etat de chargement.
 */
export function useLoad<SN extends StoreNode | StoreListNode>(
    node: SN,
    loadBuilder: (builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN>,
    deps: any[] = []
) {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const res = registerLoad(node, loadBuilder);
        const disposer = autorun(() => setIsLoading(res.isLoading));
        return () => {
            disposer();
            res.dispose();
        };
    }, deps);
    return isLoading;
}
