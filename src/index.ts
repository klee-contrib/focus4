// Cet index cherche à réexporter tous les éléments courants pour les écrans issus des différents modules internes ou externes.
// Le but est d'essayer de limiter le nombre d'imports à 1 pour un écran simple.
// Il n'a pas du tout vocation a être exhaustif.

export {autobind} from "core-decorators";
import i18n from "i18next"; export {i18n};
export {action, observable} from "mobx";
export {observer} from "mobx-react";
import * as React from "react"; export {React};

export {applicationStore} from "./application";
export {AutoForm, displayFor, fieldFor, selectFor, stringFor} from "./entity";
export {injectByName, injectByPropName} from "./ioc";
export {LineProps, listFor, renderLineActions, tableFor, timelineFor} from "./list";
export {messageStore} from "./message";
export {httpDelete, httpGet, httpPost, httpPut, requestStore} from "./network";
export {makeReferenceStore} from "./reference";
export {AdvancedSearch, SearchBar} from "./search";
export {userStore} from "./user";
