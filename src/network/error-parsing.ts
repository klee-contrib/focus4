import {isArray} from "lodash";

import {messageStore} from "../message";

export interface ErrorResponse {
    [key: string]: string[] | string | number | Record<string, string> | undefined;
    status: number;
    type?: string;
    fieldErrors?: Record<string, string>;
    globalErrors?: string[];
    globalSuccess?: string[];
    globalWarnings?: string[];
    globalInfos?: string[];
    globalErrorMessages?: string[];
    globalSuccessMessages?: string[];
    globalWarningMessages?: string[];
    globalInfoMessages?: string[];
    errors?: string[];
}

export interface ManagedErrorResponse {
    globals: string[];
    fields?: Record<string, string>;
}

type ErrorType = "error" | "warning" | "success";

const globalErrorTypes: {[key: string]: ErrorType} = {
    errors: "error",
    globalErrorMessages: "error",
    globalErrors: "error",
    globalInfoMessages: "error",
    globalInfos: "error",
    globalSuccess: "success",
    globalSuccessMessages: "success",
    globalWarningMessages: "warning",
    globalWarnings: "warning"
};

const errorTypes = {
    collection: "collection",
    composite: "composite",
    entity: "entity"
};

function dispatchMessages(messages: string[], type: ErrorType) {
    messages.forEach(content => messageStore.addMessage({type, content}));
}

function treatFieldErrors(response: ErrorResponse) {
    if ([400, 401, 422].find(x => x === response.status) && response.type || errorTypes.entity === errorTypes.entity) {
        return response.fieldErrors || {};
    } else {
        return undefined;
    }
}

function treatGlobalErrors(response: ErrorResponse) {
    let globals: string[] = [];
    Object.keys(globalErrorTypes).forEach(errorName => {
        const messages = response[errorName];
        if (isArray(messages)) {
            globals = [...globals, ...messages];
            dispatchMessages(messages, globalErrorTypes[errorName]);
        }
    });
    return globals;
}

export function manageResponseErrors(response: ErrorResponse): ManagedErrorResponse {
    return {
        fields: treatFieldErrors(response),
        globals: treatGlobalErrors(response)
    };
}
