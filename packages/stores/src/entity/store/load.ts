import {isFunction} from "lodash";
import {autorun, extendObservable, Lambda, runInAction} from "mobx";
import {v4} from "uuid";

import {config, requestStore} from "@focus4/core";

import {referenceTrackingId} from "../../reference";
import {
    EntityToType,
    isAnyFormNode,
    isStoreListNode,
    isStoreNode,
    NodeToType,
    StoreListNode,
    StoreNode
} from "../types";

import {defaultLoad} from "./store";

/** Enregistrement de chargement. */
export interface LoadRegistration {
    /**
     * Id du suivi de requêtes associé à cette enregistrement de chargement.
     *
     * Il pourra être utilisé pour enregistrer d'autres services sur cet id pour combiner leur état de chargement.
     */
    readonly trackingId: string;
    /** Retourne `true` si le service de chargement (ou un autre service avec le même id de suivi) est en cours de chargement. */
    readonly isLoading: boolean;
    /** Permet de désactiver l'enregistrement de chargement. */
    readonly dispose: Lambda;
}

/**
 * Enregistre un service de chargement sur un noeud.
 * @param node Le noeud.
 * @param loadBuilder Builder pour le service de chargement.
 * @param trackingId Id de suivi de requête pour ce load.
 * @returns disposer.
 */
export function registerLoad<SN extends StoreListNode | StoreNode, A extends readonly any[]>(
    node: SN,
    loadBuilder: (builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN, A>,
    trackingId?: string
): LoadRegistration;
export function registerLoad<SN extends StoreListNode | StoreNode, A extends readonly any[]>(
    node: SN,
    loadBuilder: NodeLoadBuilder<SN, A>,
    trackingId?: string
): LoadRegistration;
export function registerLoad<SN extends StoreListNode | StoreNode, A extends readonly any[]>(
    node: SN,
    loadBuilder: NodeLoadBuilder<SN, A> | ((builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN, A>),
    trackingId?: string
) {
    const {getLoadParams, trackingIds, handlers, loadService, trackReferenceLoading} = isFunction(loadBuilder)
        ? loadBuilder(new NodeLoadBuilder())
        : loadBuilder;
    trackingId ??= v4();
    const state = extendObservable(
        {
            trackingId,
            dispose: () => {
                /** */
            }
        },
        {
            get isLoading() {
                return (
                    requestStore.isLoading(trackingId!) ||
                    (trackReferenceLoading && requestStore.isLoading(referenceTrackingId))
                );
            }
        }
    );

    if (getLoadParams && loadService) {
        if (isAnyFormNode(node)) {
            throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
        }

        // eslint-disable-next-line func-style
        const load = async function load() {
            let params = getLoadParams();
            if (params !== undefined) {
                if (!Array.isArray(params)) {
                    params = [params];
                }
                const data = await requestStore.track([trackingId!, ...trackingIds], () => loadService(...params));
                runInAction(() => {
                    if (data) {
                        if (isStoreNode(node)) {
                            node.replace(data as EntityToType<any>);
                        } else if (isStoreListNode(node)) {
                            node.replaceNodes(data as EntityToType<any>[]);
                        }
                    }

                    (handlers.load || []).forEach(handler => handler("load"));
                });
            }
        };

        node.load = load;
        const disposer = autorun(() => node.load());
        state.dispose = () => {
            disposer();
            if (node.load === load) {
                node.load = defaultLoad;
            }
        };
    }

    return state;
}

export class NodeLoadBuilder<SN extends StoreListNode | StoreNode, A extends readonly any[] = never> {
    /** @internal */
    readonly handlers = {} as Record<"load", ((event: "load") => void)[]>;

    /** @internal */
    getLoadParams?: () => any | undefined;
    /** @internal */
    loadService?: (...args: A) => Promise<NodeToType<SN> | undefined>;
    /** @internal */
    trackingIds: string[] = [];
    /** @internal */
    trackReferenceLoading = config.trackReferenceLoading;

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    params<const NA extends any[]>(get: () => NA | undefined): NodeLoadBuilder<SN, NonNullable<NA>>;
    params<NA>(get: () => NA): NodeLoadBuilder<SN, [NonNullable<NA>]>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */
    params<const NA extends any[]>(...params: NA): NodeLoadBuilder<SN, NonNullable<NA>>;
    params<const NA extends any[]>(...params: NA): NodeLoadBuilder<SN, NonNullable<NA>> {
        if (!params.length) {
            // @ts-ignore
            this.getLoadParams = () => [];
        } else if (!isFunction(params[0])) {
            // @ts-ignore
            this.getLoadParams = () => (params.length === 1 ? params[0] : params);
        } else {
            this.getLoadParams = params[0];
        }

        // @ts-ignore
        return this;
    }

    /**
     * Enregistre le service de chargement.
     * @param service Service de chargement.
     */
    load(
        service: A extends never ? never : (...params: A) => Promise<NodeToType<SN> | undefined>
    ): NodeLoadBuilder<SN, A> {
        this.loadService = service;
        return this;
    }

    /**
     * Enregistre un handler.
     * @param event Nom de l'évènement.
     * @param handler Handler de l'évènement.
     */
    on(event: "load"[] | "load", handler: (event: "load") => void): NodeLoadBuilder<SN, A> {
        if (!Array.isArray(event)) {
            event = [event];
        }

        event.forEach(e => {
            if (!this.handlers[e]) {
                this.handlers[e] = [handler];
            } else {
                this.handlers[e].push(handler);
            }
        });

        return this;
    }

    /**
     * Attache un (ou plusieurs) ids de suivi de requêtes au service de chargement (en plus de l'id par défaut).
     *
     * Cela permettra d'ajouter l'état du service au `isLoading` de cet(ces) id(s).
     * @param trackingIds Id(s) de suivi.
     */
    trackingId(...trackingIds: string[]): NodeLoadBuilder<SN, A> {
        this.trackingIds = trackingIds;
        return this;
    }

    /**
     * Active ou désactive la prise en compte de l'état de chargement des listes de référence dans l'état de chargement du service.
     *
     * Le comportement par défaut se pilote via `config.trackReferenceLoading` (qui est lui-même `true` par défaut).
     */
    withReferenceTracking(active: boolean): NodeLoadBuilder<SN, A> {
        this.trackReferenceLoading = active;
        return this;
    }
}
