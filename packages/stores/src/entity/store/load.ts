import {isFunction} from "lodash";
import {action, autorun, computed, makeObservable, observable, runInAction} from "mobx";
import {v4} from "uuid";

import {requestStore} from "@focus4/core";

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
export class LoadRegistration<SN extends StoreListNode | StoreNode = any, A extends readonly any[] = any[]> {
    /**
     * Id du suivi de requêtes associé à cette enregistrement de chargement.
     *
     * Il pourra être utilisé pour enregistrer d'autres services sur cet id pour combiner leur état de chargement.
     */
    readonly trackingId: string;

    protected builder: NodeLoadBuilder<SN, A>;

    private node: SN;

    /**
     * Enregistre un service de chargement sur un noeud.
     * @param node Le noeud.
     * @param builder Builder pour le service de chargement.
     * @param trackingId Id de suivi de requête pour ce load.
     */
    constructor(node: SN, builder: NodeLoadBuilder<SN, A>, trackingId = v4()) {
        if (isAnyFormNode(node)) {
            throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
        }

        this.node = node;
        this.builder = builder;
        this.trackingId = trackingId;

        makeObservable<this, "builder" | "node">(this, {
            builder: observable.ref,
            isLoading: computed,
            load: action.bound,
            node: observable.ref,
            register: action.bound
        });
    }

    /** Retourne `true` si le service de chargement (ou un autre service avec le même id de suivi) est en cours de chargement. */
    get isLoading() {
        return requestStore.isLoading(this.trackingId);
    }

    /**
     * Appelle le service de chargement avec la valeur courante des paramètres, et insère le résultat dans le store associé.
     *
     * Cette méthode est également accessible depuis le store (via `node.load()`).
     */
    async load() {
        let params = this.builder.getLoadParams?.();
        if (params !== undefined && this.builder.loadService) {
            if (!Array.isArray(params)) {
                params = [params];
            }
            const data = await requestStore.track([this.trackingId, ...this.builder.trackingIds], () =>
                this.builder.loadService!(...params)
            );
            runInAction(() => {
                if (data) {
                    if (isStoreNode(this.node)) {
                        this.node.replace(data as EntityToType<any>);
                    } else if (isStoreListNode(this.node)) {
                        this.node.replaceNodes(data as EntityToType<any>[]);
                    }
                }

                (this.builder.handlers.load || []).forEach(handler => handler("load"));
            });
        }
    }

    /**
     * Enregistre le service de chargement sur le noeud et crée la réaction de chargmement.
     *
     * _Remarque : L'usage de cette méthode est déjà géré par `useLoad`/`useFormActions`._
     *
     * @param node Éventuel nouveau noeud de store, pour remplacer l'ancien.
     * @param builder Éventuel nouveau builder, pour remplace l'ancien.
     */
    register(node?: SN, builder?: NodeLoadBuilder<SN, A>) {
        if (node) {
            if (isAnyFormNode(node)) {
                throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
            }

            this.node = node;
        }
        if (builder) {
            this.builder = builder;
        }

        if (this.builder.getLoadParams && this.builder.loadService) {
            this.node.load = this.load;
            const disposer = autorun(() => this.load());
            return () => {
                disposer?.();
                if (this.node.load === this.load) {
                    this.node.load = defaultLoad;
                }
            };
        } else {
            return () => {
                /* */
            };
        }
    }
}

/** Objet de configuration pour un enregistrement de chargement. */
export class NodeLoadBuilder<SN extends StoreListNode | StoreNode, A extends readonly any[] = never> {
    /** @internal */
    readonly handlers = {} as Record<"load", ((event: "load") => void)[]>;

    /** @internal */
    getLoadParams?: () => any | undefined;
    /** @internal */
    loadService?: (...args: A) => Promise<NodeToType<SN> | undefined>;
    /** @internal */
    trackingIds: string[] = [];

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
}
