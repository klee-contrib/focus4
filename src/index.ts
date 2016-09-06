import {ApplicationStore} from "./application";
import {MessageStore} from "./message";
import {UserStore} from "./user";

export {t as translate} from "i18next";
export {observable, action} from "mobx";
export {observer} from "mobx-react";

export {AutoForm, AutoLine, displayFor, fieldFor, listFor, selectFor} from "./component";
export {makeEntityStore} from "./entity";
export {back, navigate} from "./history";
export {ListSelection, ListStore, ListTable, MemoryList} from "./list";
export {httpDelete, httpGet, httpPost, httpPut, requestStore} from "./network";
export {makeReferenceStore} from "./reference";
export {AdvancedSearch, SearchBar, SearchStore} from "./search";
export {validate} from "./validation";

/** Instance principale de l'ApplicationStore. */
export const applicationStore = new ApplicationStore();

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();

/** Instance principale du UserStore. */
export const userStore = new UserStore();
