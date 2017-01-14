import {autobind} from "core-decorators";
import {action, computed, map, ObservableMap} from "mobx";
import {v4} from "uuid";

export {ObservableMap};

export interface Request {
    id?: string;
    status: "error" | "success" | "pending";
    url: string;
}

@autobind
export class RequestStore {
    readonly error = map<Request>({});
    readonly pending = map<Request>({});
    readonly success = map<Request>({});

    @computed.struct
    get count() {
        return {
            error: this.error.size,
            pending: this.pending.size,
            success: this.success.size,
            total: this.pending.size + this.success.size + this.error.size
        };
    }

    @action
    clearRequests() {
        this.success.clear();
        this.error.clear();
        this.pending.clear();
    }

    @action
    updateRequest(request: Request) {
        request.id = request.id || v4();
        switch (request.status) {
            case "success": this.success.set(request.id, request); break;
            case "error": this.error.set(request.id, request); break;
            case "pending": this.pending.set(request.id, request); break;
        }

        if (request.status !== "pending" && this.pending.has(request.id)) {
            this.pending.delete(request.id);
        }
    }
}

/** Instance principale du RequestStore. */
export const requestStore = new RequestStore();
