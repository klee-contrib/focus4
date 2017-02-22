import {isObject} from "lodash";
import {v4} from "uuid";
import "whatwg-fetch";

import {ManagedErrorResponse, manageResponseErrors} from "./error-parsing";
import {requestStore} from "./store";

export async function coreFetch<RQ, RS>(method: "GET" | "POST" | "PUT" | "DELETE", url: string, data?: RQ): Promise<any> {
    const body = data ? JSON.stringify(data) : undefined;
    const headers = data ? {"Content-Type": isObject(data) ? "application/json" : "text/plain"} : undefined;
    const id = v4();
    requestStore.updateRequest({id, url, status: "pending"});
    try {
        const response = await window.fetch(url, {method, body, headers, credentials: "include"});
        if (response.status >= 200 && response.status < 300) {
            requestStore.updateRequest({id, url, status: "success"});
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json() as RS;
            } else {
                return await response.text();
            }
        } else {
            requestStore.updateRequest({id, url, status: "error"});
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                return Promise.reject<ManagedErrorResponse>(manageResponseErrors(await response.json()));
            } else {
                console.error(`${response.status} error when calling ${url}`);
                return Promise.reject<string>(await response.text());
            }
        }
    } catch (error) {
        requestStore.updateRequest({id, url, status: "error"});
        console.error(`"${error.message}" error when calling ${url}`);
        return Promise.reject(error);
    }
}

export async function httpDelete<RS>(url: string): Promise<RS> {
    return coreFetch("DELETE", url);
}

export async function httpGet<RS>(url: string): Promise<RS> {
    return coreFetch("GET", url);
}

export async function httpPost<RQ, RS>(url: string, data: RQ): Promise<RS> {
    return coreFetch("POST", url, data);
}

export async function httpPut<RQ, RS>(url: string, data: RQ): Promise<RS> {
    return coreFetch("PUT", url, data);
}
