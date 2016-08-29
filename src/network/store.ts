import {EventEmitter} from "events";
import {Map} from "immutable";
import {v4} from "node-uuid";

import dispatcher from "../dispatcher";

export interface Request {
    id?: string;
    status: "error" | "success" | "pending" | "cancelled" ;
}

export default class RequestStore extends EventEmitter {

    private dispatch: string;
    private pending = Map<Request>({});
    private success = Map<Request>({});
    private error = Map<Request>({});

    getRequests() {
        return {
            pending: this.pending.size,
            success: this.success.size,
            error: this.error.size,
            total: this.pending.size + this.success.size + this.error.size
        };
    }

    updateRequest(request: Request) {
        request.id = request.id || v4();
        switch (request.status) {
            case "success": this.success = this.success.set(request.id, request); break;
            case "error": this.error = this.error.set(request.id, request); break;
            case "pending": this.pending = this.pending.set(request.id, request); break;
        }

        if (request.status !== "pending" && this.pending.has(request.id)) {
            this.pending = this.pending.delete(request.id);
        }

        this.emit("update", request.id);
    }

    clearRequests() {
        this.success = this.success.clear();
        this.error = this.error.clear();
        this.pending = this.pending.clear();
        this.emit("clear");
    }

    addUpdateRequestListener(cb: Function) {
        this.addListener("update", cb);
    }

    removeUpdateRequestListener(cb: Function) {
        this.removeListener("update", cb);
    }

    addClearRequestsListener(cb: Function) {
        this.addListener("clear", cb);
    }

    removeClearRequestsListener(cb: Function) {
        this.removeListener("clear", cb);
    }

    registerDispatcher() {
        this.dispatch = dispatcher.register(transferInfo => {
            const {data, type} = transferInfo.action;
            if (!data || !data["request"]) { return; }
            switch (type) {
                case "update":
                    if (data["request"]) {
                        this.updateRequest(data["request"]);
                    }
                    break;
                case "clear":
                    if (data["request"]) {
                        this.clearRequests();
                    }
                    break;
            }
        });
    }
}
