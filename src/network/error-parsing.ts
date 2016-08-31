import {isArray} from "lodash";

import {addMessage} from "message";
import {translate} from "translation";

export type FieldErrors = {[key: string]: string[] | {[key: string]: string[]}};

export interface ErrorResponse {
    [key: string]: string[] | string | number | FieldErrors | undefined;
    status: number;
    type?: string;
    fieldErrors?: FieldErrors;
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
    fields?: FieldErrors;
}

type ErrorType = "error" | "warning" | "success";

const globalErrorTypes: {[key: string]: ErrorType} = {
    globalErrors: "error",
    globalSuccess: "success",
    globalWarnings: "warning",
    globalInfos: "error",
    globalErrorMessages: "error",
    globalSuccessMessages: "success",
    globalWarningMessages: "warning",
    globalInfoMessages: "error",
    errors: "error",
};

const errorTypes = {
    entity: "entity",
    collection: "collection",
    composite: "composite"
};

function dispatchMessages(messages: string[], type: ErrorType) {
    messages.forEach(message =>
        addMessage({
            type,
            content: translate(message)
        })
    );
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
        let messages = response[errorName];
        if (isArray(messages)) {
            globals = [...globals, ...messages];
            dispatchMessages(messages, globalErrorTypes[errorName]);
        }
    });
    return globals;
}

export function manageResponseErrors(response: ErrorResponse): ManagedErrorResponse {
    return {
        globals: treatGlobalErrors(response),
        fields: treatFieldErrors(response)
    };
}
