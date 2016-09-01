import {computed, map, action, ObservableMap} from "mobx";
import {v4} from "node-uuid";

export {ObservableMap};

export interface Request {
    id?: string;
    status: "error" | "success" | "pending";
    url: string;
}

export class RequestStore {
    error = map<Request>({});
    pending = map<Request>({});
    success = map<Request>({});

    @computed
    get count() {
        return {
            pending: this.pending.size,
            success: this.success.size,
            error: this.error.size,
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
