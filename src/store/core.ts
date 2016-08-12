import {EventEmitter} from "events";
import {defer, isFunction, isArray} from "lodash";
import {List, Map, fromJS} from "immutable";
import dispatcher from "../dispatcher";
import {autobind} from "core-decorators";

export type Status = {name?: string, isLoading: boolean}

@autobind
export default class CoreStore<D> extends EventEmitter {

    readonly identifier?: string;
    readonly definition: D;
    protected dispatch: string;
    protected data = Map({});
    protected status = Map<Status>({});
    protected error = Map({});
    protected pendingEvents: {name: string, data?: {}}[] = [];

    constructor({definition, identifier}: {definition: D, identifier?: string}) {
        super();
        this.definition = definition;
        this.identifier = identifier;
        this.registerDispatcher();
    }

    get value() {
        return this.data ? this.data.toJS() : {};
    }

    addChangeListener<T>(node: string, callback: (data?: T) => void) {
        this.checkNode(node);
        this.addListener(`${node}:change`, callback);
    }

    addErrorListener<T>(node: string, callback: Function) {
        this.checkNode(node);
        this.addListener(`${node}:error`, callback);
    }

    addStatusListener<T>(node: string, callback: Function) {
        this.checkNode(node);
        this.addListener(`${node}:status`, callback);
    }

    get<T>(node: string): T | undefined {
        return this.data.has(node) ? this.data.get(node) as any : undefined;
    }

    getError(node: string): {[key: string]: any} | undefined {
        return this.error.has(node) ? this.error.get(node) : undefined;
    }

    getStatus(node: string) {
        return this.status.has(node) ? this.status.get(node) : undefined;
    }

    removeChangeListener<T>(node: string, callback: (data?: T) => void) {
        this.checkNode(node);
        this.removeListener(`${node}:change`, callback);
    }

    removeErrorListener<T>(node: string, callback: Function) {
        this.checkNode(node);
        this.removeListener(`${node}:error`, callback);
    }

    removeStatusListener<T>(node: string, callback: Function) {
        this.checkNode(node);
        this.removeListener(`${node}:status`, callback);
    }

    update(node: string, dataNode: any, status: Status, informations?: {}) {
        this.data = this.data.set(node, isFunction(dataNode) ? dataNode : fromJS(dataNode));
        this.status = this.status.set(node, status);
        this.willEmit(`${node}:change`, {property: node, status, informations});
    }

    updateError(node: string, dataNode: any, status: Status, informations?: {}) {
        this.error = this.error.set(node, isArray(dataNode) ? List(dataNode) : Map(dataNode));
        this.status = this.status.set(node, status);
        this.willEmit(`${node}:error`, {property: node, status, informations});
    }

    updateStatus(node: string, status: Status, informations?: {}) {
        this.status = this.status.set(node, status);
        this.willEmit(`${node}:status`, {property: node, status, informations});
    }

    protected checkNode(node: string) {
        if (!Object.keys(this.definition).find(x => x === node)) {
            throw new Error(`Error: the node ${node} does not exist in ${this}`);
        }
    }

    protected clearPendingEvents() {
        this.pendingEvents = [];
    }

    protected delayPendingEvents() {
        defer(() => {
            this.emitPendingEvents();
            this.clearPendingEvents();
        });
    }

    protected emitPendingEvents() {
        this.pendingEvents.map(evtToEmit => {
            let {name, data} = evtToEmit;
            this.emit(name, data);
        });
    }

    protected registerDispatcher() {
        this.dispatch = dispatcher.register(transferInfo => {
            if (this.identifier && transferInfo.action.identifier !== this.identifier) {
                return;
            }

            const rawData = transferInfo.action.data;
            const status = transferInfo.action.status || {};
            const type = transferInfo.action.type;
            const otherInformations = {callerId: transferInfo.action.callerId};

            if (rawData) {
                for (let node in rawData) {
                    if (Object.keys(this.definition).find(x => x === node)) {
                        switch (type) {
                            case "update":
                                this.update(node, rawData[node], status[node], otherInformations);
                                break;
                            case "updateStatus":
                                this.updateStatus(node, status[node], otherInformations);
                                break;
                            case "updateError":
                                this.updateError(node, rawData[node], status[node]);
                                break;
                        }
                    }
                }
            }
            this.delayPendingEvents();
        });
    }

    protected willEmit(name: string, data?: {}) {
        this.pendingEvents = this.pendingEvents.reduce((result, current) => {
            if (current.name !== name) {
                result.push(current);
            }
            return result;
        }, [{name, data} as {name: string, data?: {}}]);
    }
}
