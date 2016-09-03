import {isArray} from "lodash";

import dispatcher from "./dispatcher";
import {ManagedErrorResponse, FieldErrors} from "./network/error-parsing";

export interface Service {
    (...args: any[]): Promise<string | {}>;
}

export interface ActionBuilderSpec<S extends Service> {
    node: string | string[];
    preStatus?: string;
    service: S;
    status: string;
    shouldDumpStoreOnActionCall?: boolean;
}

type ActionBuilderSpecExt<S extends Service> = ActionBuilderSpec<S> & {type: string, callerId?: string};

function preServiceCall({node, preStatus, callerId, shouldDumpStoreOnActionCall}: ActionBuilderSpecExt<any>, payload: any) {
    const STATUS = {name: preStatus, isLoading: true};
    const type = shouldDumpStoreOnActionCall ? "update" : "updateStatus";

    let data: {[key: string]: any} = {};
    let status: {[key: string]: typeof STATUS} = {};

    if (isArray(node)) {
        node.forEach(nd => {
            data[nd] = shouldDumpStoreOnActionCall ? null : (payload && payload[nd]) || null;
            status[nd] = STATUS;
        });
    } else {
        data[node] = shouldDumpStoreOnActionCall ? null : (payload || null);
        status[node] = STATUS;
    }

    dispatcher.handleViewAction({data, type, status, callerId});
}

function dispatchServiceResponse({node, type, status, callerId}: ActionBuilderSpecExt<any>, response: string | {}) {
    const data = isArray(node) ? response as {} : {[node]: response};
    const postStatus = {name: status, isLoading: false};
    let newStatus: {[key: string]: typeof postStatus} = {};
    if (isArray(node)) {
        node.forEach(nd => newStatus[nd] = postStatus);
    } else {
        newStatus[node] = postStatus;
    }
    dispatcher.handleServerAction({
        data,
        type,
        status: newStatus,
        callerId
    });
}

function dispatchFieldErrors({node, callerId}: ActionBuilderSpecExt<any>, errorResult: FieldErrors | undefined) {
    const data: {[key: string]: {[key: string]: string[]}} = isArray(node) ? errorResult as any : {[node]: errorResult} as any;
    const errorStatus = {name: "error", isLoading: false};
    let newStatus: {[key: string]: typeof errorStatus} = {};
    if (isArray(node)) {
        node.forEach(nd => newStatus[nd] = errorStatus);
    } else {
        newStatus[node] = errorStatus;
    }
    dispatcher.handleServerAction({
        data,
        type: "updateError",
        status: newStatus,
        callerId
    });
}

function errorOnCall(config: ActionBuilderSpecExt<any>, err: ManagedErrorResponse) {
    dispatchFieldErrors(config, err.fields);
    return Promise.reject<ManagedErrorResponse>(err);
}

export default function actionBuilder<S extends Service>(config: ActionBuilderSpec<S>): S {
    return (async (...payload: any[]) => {
        const conf = Object.assign({}, {
            callerId: this._identifier,
            type: "update",
            preStatus: "loading",
            shouldDumpStoreOnActionCall: false
        }, config);
        preServiceCall(conf, payload[0]);
        try {
            const data = await conf.service(...payload);
            return dispatchServiceResponse(conf, data);
        } catch (err) {
            return errorOnCall(conf, err) as any;
        }
    }) as any;
}
