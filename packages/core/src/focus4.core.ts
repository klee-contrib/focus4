import {configure} from "mobx";
configure({enforceActions: "never"});

import "i18next";
declare module "i18next" {
    interface CustomTypeOptions {
        returnNull: false;
    }
}

export {coreFetch, downloadFile, getFileObjectUrl, requestStore} from "./network";
export {makeRouter, param} from "./router";
export {MessageStore, UserStore, messageStore} from "./stores";
export {config, themeable} from "./utils";

export type {HttpMethod, Request} from "./network";
export type {Router, RouterConstraintBuilder} from "./router";
export type {Message, MessageListener} from "./stores";
