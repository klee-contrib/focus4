import {autobind} from "core-decorators";
import {action, computed, ObservableMap} from "mobx";
import {v4} from "uuid";

/** Description d'une requête. */
export interface Request {
    id?: string;
    status: "error" | "success" | "pending";
    url: string;
}

/** Store de requête contenant les requêtes effectuées dans l'application. */
@autobind
export class RequestStore {
    /** Requêtes en erreur. */
    readonly error = new ObservableMap<Request>({});
    /** Requêtes en cours. */
    readonly pending = new ObservableMap<Request>({});
    /** Requête en succès. */
    readonly success = new ObservableMap<Request>({});

    /** Nombres de requêtes. */
    @computed.struct
    get count() {
        return {
            error: this.error.size,
            pending: this.pending.size,
            success: this.success.size,
            total: this.pending.size + this.success.size + this.error.size
        };
    }

    /** Vide les requêtes dans le store. */
    @action
    clearRequests() {
        this.success.clear();
        this.error.clear();
        this.pending.clear();
    }

    /**
     * Met à jour une requête.
     * @param request La requête.
     */
    @action
    updateRequest(request: Request) {
        request.id = request.id || v4();
        switch (request.status) {
            case "success":
                this.success.set(request.id, request);
                break;
            case "error":
                this.error.set(request.id, request);
                break;
            case "pending":
                this.pending.set(request.id, request);
                break;
        }

        // Si on met à jour une requête en cours, on la supprime de la map.
        if (request.status !== "pending" && this.pending.has(request.id)) {
            this.pending.delete(request.id);
        }
    }
}

/** Instance principale du RequestStore. */
export const requestStore = new RequestStore();
