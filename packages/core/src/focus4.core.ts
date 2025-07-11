import "i18next";

import {configure} from "mobx";

configure({enforceActions: "never"});

declare module "i18next" {
    interface CustomTypeOptions {
        returnNull: false;
    }
}

export {colorScheme, initColorScheme} from "./color-scheme";
export {coreConfig} from "./config";
export {baseI18nextConfig} from "./i18n";
export {coreFetch, downloadFile, getFileObjectUrl, isAbortError, isHandledError, requestStore} from "./network";
export {makeRouter, param, startHistory} from "./router";
export {MessageStore, messageStore, UserStore} from "./stores";

export type {HandledProblemDetails, HttpMethod, ProblemDetails, Request} from "./network";
export type {
    Router,
    RouterConfirmation,
    RouterConstraintBuilder,
    UrlPathDescriptor,
    UrlRouteDescriptor
} from "./router";
export type {Message, MessageListener} from "./stores";
