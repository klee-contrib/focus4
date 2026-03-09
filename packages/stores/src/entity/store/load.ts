import {action, computed, observable, reaction} from "mobx";

import {isAbortError, requestStore} from "@focus4/core";
import {EntityToType} from "@focus4/entities";

import {LocalCollectionStore} from "../../collection";
import {isAnyFormNode, isAnyStoreNode, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "../types";

import {NodeLoadBuilder} from "./load-builder";
import {defaultLoad} from "./node";

/** Enregistrement de chargement. */
export class LoadRegistration<A extends readonly any[] = never> {
    /**
     * Id du suivi de requêtes associé à cette enregistrement de chargement.
     *
     * Il pourra être utilisé pour enregistrer d'autres services sur cet id pour combiner leur état de chargement.
     */
    trackingId: string;

    @observable.ref protected accessor builder: NodeLoadBuilder<StoreNode | StoreListNode | LocalCollectionStore, A>;

    @observable.ref private accessor store: StoreNode | StoreListNode | LocalCollectionStore;

    protected abortController?: AbortController;

    /**
     * Enregistre un service de chargement sur un store.
     * @param store Le store.
     * @param builder Builder pour le service de chargement.
     * @param trackingId Id de suivi de requête pour ce load.
     */
    constructor(
        store: StoreNode | StoreListNode | LocalCollectionStore,
        builder: NodeLoadBuilder<StoreNode | StoreListNode | LocalCollectionStore, A>,
        trackingId?: string
    ) {
        if (isAnyFormNode(store) && !!builder.loadService) {
            throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
        }

        this.store = store;
        this.builder = builder;
        this.trackingId =
            trackingId ?? (store instanceof LocalCollectionStore ? store.trackingId : Math.random().toString());
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
        if (params === undefined) {
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

                await requestStore.track(
                    [this.trackingId, ...this.builder.trackingIds],
                    () => this.builder.loadService!(...this.params!, {signal}),
                    data => {
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

                        for (const handler of this.builder.handlers.load ?? []) {
                            handler("load", data);
                        }
                    }
                );

                this.abortController = undefined;
            } catch (error) {
                if (isAbortError(error)) {
                    return;
                }

                this.clear();

                for (const handler of this.builder.handlers.error ?? []) {
                    handler("error", "load", error);
                }

                throw error;
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
        store?: StoreNode | StoreListNode | LocalCollectionStore,
        builder?: NodeLoadBuilder<StoreNode | StoreListNode | LocalCollectionStore, A>
    ) {
        if (store) {
            if (isAnyFormNode(store) && !!builder?.loadService) {
                throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
            }

            this.store = store;

            if (store instanceof LocalCollectionStore) {
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
