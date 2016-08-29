
import {ApplicationStore} from "./application";
import {MessageStore} from "./message";
import {UserStore} from "./user";

import * as definition from "./definition"; export {definition};
export { default as dispatcher } from "./dispatcher";
import * as history from "./history"; export {history};
import * as list from "./list"; export {list};
import * as reference from "./reference"; export {reference};
import * as search from "./search"; export {search};
import * as store from "./store"; export {store};
import * as translation from "./translation"; export {translation};

/** Instance principale de l'ApplicationStore. */
export const applicationStore = new ApplicationStore();

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();

/** Instance principale du UserStore. */
export const userStore = new UserStore();
