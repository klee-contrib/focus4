import {isFunction} from "es-toolkit";
import {action, computed, observable, reaction, runInAction} from "mobx";

import {isAbortError, requestStore} from "@focus4/core";

import {CollectionStore} from "../../collection";
import {
    EntityToType,
    isAnyFormNode,
    isAnyStoreNode,
    isStoreListNode,
    isStoreNode,
    NodeToType,
    StoreListNode,
    StoreNode
} from "../types";

import {defaultLoad} from "./store";

type LoadData<SN extends StoreNode | StoreListNode | CollectionStore> = SN extends CollectionStore
    ? SN["list"]
    : NodeToType<SN>;

interface LoadRegistrationHandlers<SN extends StoreNode | StoreListNode | CollectionStore> {
    load?: ((event: "load", data: LoadData<SN>) => void)[];
    error?: ((event: "error", data: "load", error: unknown) => void)[];
}

/** Enregistrement de chargement. */
export class LoadRegistration<A extends readonly any[] = never> {
    /**
     * Id du suivi de requêtes associé à cette enregistrement de chargement.
     *
     * Il pourra être utilisé pour enregistrer d'autres services sur cet id pour combiner leur état de chargement.
     */
    trackingId: string;

    @observable.ref protected accessor builder: NodeLoadBuilder<StoreNode | StoreListNode | CollectionStore, A>;

    @observable.ref private accessor store: StoreNode | StoreListNode | CollectionStore;

    protected abortController?: AbortController;

    /**
     * Enregistre un service de chargement sur un store.
     * @param store Le store.
     * @param builder Builder pour le service de chargement.
     * @param trackingId Id de suivi de requête pour ce load.
     */
    constructor(
        store: StoreNode | StoreListNode | CollectionStore,
        builder: NodeLoadBuilder<StoreNode | StoreListNode | CollectionStore, A>,
        trackingId?: string
    ) {
        if (isAnyFormNode(store) && !!builder.loadService) {
            throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
        }

        if (store instanceof CollectionStore && store.type !== "local") {
            throw new Error("Impossible d'enregistrer un `load` sur un `CollectionStore` défini avec un service.");
        }

        this.store = store;
        this.builder = builder;
        this.trackingId =
            trackingId ?? (store instanceof CollectionStore ? store.trackingId : Math.random().toString());
    }

    /** Retourne `true` si le service de chargement (ou un autre service avec le même id de suivi) est en cours de chargement. */
    @computed
    get isLoading() {
        return requestStore.isLoading(this.trackingId);
    }

    /** La valeur courante des paramètres de chargement. */
    @computed.struct
    get params(): A | undefined {
        const params = this.builder.getLoadParams?.();
        if (!params) {
            return undefined;
        }

        if (!Array.isArray(params)) {
            // @ts-ignore
            return [params];
        }

        // @ts-ignore
        return params;
    }

    /**
     * Appelle le service de chargement avec la valeur courante des paramètres, et insère le résultat dans le store associé.
     *
     * Cette méthode est également accessible depuis le store (via `storeNode.load()` ou `collectionStore.search()`).
     */
    @action.bound
    async load() {
        if (this.params !== undefined && this.builder.loadService) {
            try {
                this.abortController?.abort();
                this.abortController = new AbortController();
                const {signal} = this.abortController;

                const data = await requestStore.track([this.trackingId, ...this.builder.trackingIds], () =>
                    this.builder.loadService!(...this.params!, {signal})
                );
                runInAction(() => {
                    if (data) {
                        if (isStoreNode(this.store)) {
                            this.store.replace(data as EntityToType<any>);
                        } else if (isStoreListNode(this.store)) {
                            this.store.replaceNodes(data as EntityToType<any>[]);
                        } else {
                            this.store.selectedItems.clear();
                            this.store.list = data as EntityToType<any>[];
                        }
                    }

                    (this.builder.handlers.load ?? []).forEach(handler => handler("load", data));

                    this.abortController = undefined;
                });
            } catch (e: unknown) {
                if (isAbortError(e)) {
                    return;
                }

                this.clear();
                (this.builder.handlers.error ?? []).forEach(handler => handler("error", "load", e));
                throw e;
            }
        }
    }

    /** Vide le noeud de store associé au service de chargement. */
    @action.bound
    clear() {
        this.store.clear();
    }

    /**
     * Enregistre le service de chargement sur le noeud et crée la réaction de chargmement.
     *
     * _Remarque : L'usage de cette méthode est déjà géré par `useLoad`/`useFormActions`._
     *
     * @param store Éventuel nouveau store, pour remplacer l'ancien.
     * @param builder Éventuel nouveau builder, pour remplace l'ancien.
     */
    @action.bound
    register(
        store?: StoreNode | StoreListNode | CollectionStore,
        builder?: NodeLoadBuilder<StoreNode | StoreListNode | CollectionStore, A>
    ) {
        if (store) {
            if (isAnyFormNode(store) && !!builder?.loadService) {
                throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
            }

            if (store instanceof CollectionStore && store.type !== "local") {
                throw new Error("Impossible d'enregistrer un `load` sur un `CollectionStore` défini avec un service.");
            }

            this.store = store;

            if (store instanceof CollectionStore) {
                this.trackingId = store.trackingId;
            }
        }
        if (builder) {
            this.builder = builder;
        }

        if (this.builder.getLoadParams && this.builder.loadService) {
            if (isAnyStoreNode(this.store)) {
                this.store.load = this.load;
            } else {
                this.store.localLoadService = this.load;
            }
            const disposer = reaction(() => this.params, this.load, {fireImmediately: true});
            return () => {
                disposer?.();
                this.abortController?.abort();
                if (isAnyStoreNode(this.store) && this.store.load === this.load) {
                    this.store.load = defaultLoad;
                } else if (!isAnyStoreNode(this.store) && this.store.localLoadService === this.load) {
                    this.store.localLoadService = undefined;
                }
            };
        } else {
            return () => {
                this.abortController?.abort();
            };
        }
    }
}

/** Objet de configuration pour un enregistrement de chargement. */
export class NodeLoadBuilder<SN extends StoreListNode | StoreNode | CollectionStore, P extends readonly any[] = never> {
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

        event.forEach(e => {
            if (!this.handlers[e]) {
                this.handlers[e] = [handler as any];
            } else {
                this.handlers[e].push(handler as any);
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
    trackingId(...trackingIds: string[]): NodeLoadBuilder<SN, P> {
        this.trackingIds = trackingIds;
        return this;
    }
}
