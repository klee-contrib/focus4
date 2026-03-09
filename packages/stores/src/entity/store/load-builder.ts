import {isFunction} from "es-toolkit";

import {LocalCollectionStore} from "../../collection";
import {NodeToType, StoreListNode, StoreNode} from "../types";

type LoadData<SN extends StoreNode | StoreListNode | LocalCollectionStore> = SN extends LocalCollectionStore
    ? SN["list"]
    : NodeToType<SN>;

interface LoadRegistrationHandlers<SN extends StoreNode | StoreListNode | LocalCollectionStore> {
    load?: ((event: "load", data: LoadData<SN>) => void)[];
    error?: ((event: "error", data: "load", error: unknown) => void)[];
}

/** Objet de configuration pour un enregistrement de chargement. */
export class NodeLoadBuilder<
    SN extends StoreListNode | StoreNode | LocalCollectionStore,
    P extends readonly any[] = never
> {
    /** @internal */
    readonly handlers: LoadRegistrationHandlers<SN> = {};

    /** @internal */
    getLoadParams?: () => any | undefined;
    /** @internal */
    loadService?: (...args: [...P, RequestInit?]) => Promise<LoadData<SN>>;
    /** @internal */
    trackingIds: string[] = [];

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    params<const NP extends any[]>(get: () => NP | undefined): NodeLoadBuilder<SN, NP>;
    params<NP>(get: () => NP): NodeLoadBuilder<SN, [NonNullable<NP>]>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */
    params<const NP extends any[]>(params: NP): NodeLoadBuilder<SN, NP>;
    params<NP>(params: NP): NodeLoadBuilder<SN, [NonNullable<NP>]>;
    params(): NodeLoadBuilder<SN, []>;
    params<const NP extends any[]>(params?: NP | (() => NP | undefined)): any {
        if (params === undefined) {
            // @ts-ignore
            this.getLoadParams = () => [];
        } else if (isFunction(params)) {
            // @ts-ignore
            this.getLoadParams = params;
        } else {
            // @ts-ignore
            this.getLoadParams = () => params;
        }

        // @ts-ignore
        return this;
    }

    /**
     * Enregistre le service de chargement.
     * @param service Service de chargement.
     */
    load(
        service: P extends never ? never : (...params: [...P, RequestInit?]) => Promise<LoadData<SN>>
    ): NodeLoadBuilder<SN, P> {
        this.loadService = service;
        return this;
    }

    /**
     * Enregistre un handler.
     * @param event Nom de l'évènement.
     * @param handler Handler de l'évènement.
     */
    on<E extends keyof LoadRegistrationHandlers<SN>>(
        event: E | E[],
        handler: (
            event: E,
            data: Parameters<NonNullable<LoadRegistrationHandlers<SN>[E]>[0]>[1],
            error: Parameters<NonNullable<LoadRegistrationHandlers<SN>[E]>[0]>[2]
        ) => void
    ): NodeLoadBuilder<SN, P> {
        if (!Array.isArray(event)) {
            event = [event];
        }

        for (const e of event) {
            if (!this.handlers[e]) {
                this.handlers[e] = [handler as any];
            } else {
                this.handlers[e].push(handler as any);
            }
        }

        return this;
    }

    /**
     * Attache un (ou plusieurs) ids de suivi de requêtes au service de chargement (en plus de l'id par défaut).
     *
     * Cela permettra d'ajouter l'état du service au `isLoading` de cet(ces) id(s).
     * @param trackingIds Id(s) de suivi.
     */
    trackingId(...trackingIds: string[]): NodeLoadBuilder<SN, P> {
        this.trackingIds = trackingIds;
        return this;
    }
}
