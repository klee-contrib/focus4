import {isArray} from "lodash";

import {messageStore} from "../message";

export interface ErrorResponse {
    [key: string]: any;
    status: number;
    type?: string;
    fieldErrors?: Record<string, string>;
}

export interface ManagedErrorResponse {
    [key: string]: any;
    $parsedErrors: {
        globals: string[];
        fields?: Record<string, string>;
    };
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
        const messages: string[] = response[errorName];
        if (isArray(messages)) {
            globals = [...globals, ...messages];
            messages.forEach(content => messageStore.addMessage({type: globalErrorTypes[errorName], content}));
        }
    });
    return globals;
}

export function manageResponseErrors($status: number, response: ErrorResponse): ManagedErrorResponse {
    return {
        ...response,
        $status,
        $parsedErrors: {
            fields: treatFieldErrors(response),
            globals: treatGlobalErrors(response)
        }
    };
}
