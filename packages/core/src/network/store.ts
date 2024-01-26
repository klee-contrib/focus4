import {uniq} from "lodash";
import {action, computed, makeObservable, observable} from "mobx";
import {computedFn} from "mobx-utils";
import {v4} from "uuid";

export type HttpMethod = "CONNECT" | "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT" | "TRACE";

/** Définition d'une requête. */
export interface Request {
    /** Id autogénéré pour la requête. */
    id: string;
    /** Méthode HTTP de la requête. */
    method: HttpMethod;
    /** URL complète (avec query string) de la requête. */
    url: string;
}

/** Store de requête contenant les requêtes en cours dans l'application. */
export class RequestStore {
    /** @internal */
    /** Requêtes en cours. */
    private readonly pendingRequests = observable.map<string, Omit<Request, "id">>({}, {deep: false});
    /** @internal */
    /** Requêtes suivies en cours. */
    private readonly trackedRequests = observable.map<string, string[]>({}, {deep: false});

    constructor() {
        makeObservable(this);
    }

    /** Indique s'il y a au moins une requête en cours. */
    @computed
    get loading() {
        return this.pendingRequests.size > 0;
    }

    /** Récupère les requêtes en cours. */
    @computed.struct
    get pending(): Request[] {
        return Array.from(this.pendingRequests).map(([id, {method, url}]) => ({id, method, url}));
    }

    /**
     * Vérifie s'il existe une requête suivie en cours pour un id donné.
     * @param trackingId Id de suivi.
     * @returns true/false
     */
    readonly isLoading = computedFn((trackingId: string) =>
        Array.from(this.trackedRequests.values()).some(trackingIds => trackingIds.includes(trackingId))
    );

    /**
     * Récupère le nombre de requêtes suivies en cours pour un id donné.
     * @param trackingId Id de suivi.
     * @returns Nombre de requêtes en cours.
     */
    readonly getPendingCount = computedFn(
        (trackingId: string) =>
            Array.from(this.trackedRequests.values()).filter(trackingIds => trackingIds.includes(trackingId)).length
    );

    /**
     * Enregistre une requête pour suivi par un ou plusieurs id(s).
     *
     * La méthode `requestStore.isLoading(trackingId)` permettra de savoir s'il y a au moins une requête suivie avec cet id qui est en cours.
     * @param trackingId Id(s) de suivi.
     * @param fetch Service à suivre.
     * @returns La Promise de `fetch`.
     */
    async track<T>(trackingId: string[] | string, fetch: () => Promise<T>) {
        const id = v4();
        await setTimeout0(() =>
            this.trackedRequests.set(id, uniq(Array.isArray(trackingId) ? trackingId : [trackingId]))
        );
        try {
            return await fetch();
        } finally {
            this.trackedRequests.delete(id);
        }
    }

    /**
     * @internal
     * Ajoute une nouvelle requête en cours dans le store.
     * @returns Id de la requête.
     */
    async startRequest(method: HttpMethod, url: string) {
        const id = v4();
        await setTimeout0(() => this.pendingRequests.set(id, {method, url}));
        return id;
    }

    /**
     * @internal
     * Termine une requête.
     * @param id Id de la requête.
     */
    @action
    endRequest(id: string) {
        this.pendingRequests.delete(id);
    }
}

/**
 * @internal
 * Permet de lancer une mise à jour de state MobX en dehors du contexte d'exécution courant.
 */
function setTimeout0(callback: () => void) {
    return new Promise<void>(resolve => {
        setTimeout(
            action(() => {
                callback();
                resolve();
            }),
            0
        );
    });
}

/** Instance principale du RequestStore. */
export const requestStore = new RequestStore();
