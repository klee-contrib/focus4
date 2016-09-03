import {ApplicationStore} from "./application";
import {MessageStore} from "./message";
import {UserStore} from "./user";

export {t as translate} from "i18next";
export {observable, action} from "mobx";
export {observer} from "mobx-react";

export {back, navigate} from "./history";
export {ListSelection, ListStore, ListTable, MemoryList} from "./list";
export {Domain, Entity, EntityField} from "./metadata";
export {httpDelete, httpGet, httpPost, httpPut, requestStore} from "./network";
export {makeReferenceStore} from "./reference";
export {validate} from "./validation";

export { default as dispatcher } from "./dispatcher";
import * as search from "./search"; export {search};
import * as store from "./store"; export {store};

/** Instance principale de l'ApplicationStore. */
export const applicationStore = new ApplicationStore();

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();

/** Instance principale du UserStore. */
export const userStore = new UserStore();
