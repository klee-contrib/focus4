import {isFunction} from "lodash";
import {autorun, extendObservable, runInAction} from "mobx";

import {isAnyFormNode, isStoreListNode, isStoreNode, NodeToType, StoreListNode, StoreNode} from "../types";

import {defaultLoad} from "./store";

/**
 * Enregistre un service de chargement sur un noeud.
 * @param node Le noeud.
 * @param loadBuilder Builder pour le service de chargement.
 * @returns disposer.
 */
export function registerLoad<SN extends StoreNode | StoreListNode, A extends readonly any[]>(
    node: SN,
    loadBuilder: (builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN, A>
): {isLoading: boolean; dispose: () => void};
export function registerLoad<SN extends StoreNode | StoreListNode, A extends readonly any[]>(
    node: SN,
    loadBuilder: NodeLoadBuilder<SN, A>
): {isLoading: boolean; dispose: () => void};
export function registerLoad<SN extends StoreNode | StoreListNode, A extends readonly any[]>(
    node: SN,
    loadBuilder: NodeLoadBuilder<SN, A> | ((builder: NodeLoadBuilder<SN>) => NodeLoadBuilder<SN, A>)
) {
    if (isAnyFormNode(node)) {
        throw new Error("Impossible d'enregistrer 'load' sur un `FormNode`");
    }

    const {getLoadParams, handlers, loadService} = isFunction(loadBuilder)
        ? loadBuilder(new NodeLoadBuilder())
        : loadBuilder;
    const state = extendObservable(
        {
            dispose: () => {
                /** */
            }
        },
        {isLoading: false}
    );

    if (getLoadParams && loadService) {
        // eslint-disable-next-line func-style
        const load = async function load() {
            let params = getLoadParams();
            if (params || params === 0) {
                state.isLoading = true;
                if (!Array.isArray(params)) {
                    params = [params];
                }
                const data = await loadService(...params);
                runInAction(() => {
                    if (data) {
                        if (isStoreNode(node)) {
                            node.replace(data as any);
                        } else if (isStoreListNode(node)) {
                            node.replaceNodes(data as any);
                        }
                    }

                    state.isLoading = false;
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

export class NodeLoadBuilder<SN extends StoreNode | StoreListNode, A extends readonly any[] = never> {
    /** @internal */
    readonly handlers = {} as Record<"load", ((event: "load") => void)[]>;

    /** @internal */
    getLoadParams?: () => any | undefined;
    /** @internal */
    loadService?: (...args: A) => Promise<NodeToType<SN> | undefined>;

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    params<NA extends readonly any[]>(get: () => NA | undefined): NodeLoadBuilder<SN, NonNullable<NA>>;
    params<NA>(get: () => NA): NodeLoadBuilder<SN, [NonNullable<NA>]>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */
    params<NA extends any[]>(...params: NA): NodeLoadBuilder<SN, NonNullable<NA>>;
    params<NA extends any[]>(...params: NA): NodeLoadBuilder<SN, NonNullable<NA>> {
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
    on(event: "load" | "load"[], handler: (event: "load") => void): NodeLoadBuilder<SN, A> {
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
}
