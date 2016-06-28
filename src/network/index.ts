import * as fetch from "./fetch"; export {fetch};
import * as errorParsing from "./fetch"; export {errorParsing};
import {RequestStore} from "../store";
export const builtInStore = new RequestStore();
