import {configure} from "mobx";
configure({enforceActions: "never"});

import "i18next";
declare module "i18next" {
    interface CustomTypeOptions {
        returnNull: false;
    }
}

export {coreFetch, downloadFile, getFileObjectUrl, requestStore} from "./network";
export {Router, RouterConstraintBuilder, makeRouter, param} from "./router";
export {Message, MessageListener, MessageStore, UserStore, messageStore} from "./stores";
export {config, themeable} from "./utils";
