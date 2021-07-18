// Cet index cherche à réexporter tous les éléments courants pour les écrans issus des différents modules internes ou externes.
// Le but est d'essayer de limiter le nombre d'imports à 1 pour un écran simple.
// Il n'a pas du tout vocation a être exhaustif.

import "material-design-icons-iconfont/dist/material-design-icons.css";

import "./focus.css";

import i18next from "i18next";
export {i18next as i18n};
export {action, autorun, computed, observable} from "mobx";
export {disposeOnUnmount, observer, useLocalObservable, useObserver} from "mobx-react";
export {Component, useEffect, useState, useRef} from "react";

export {advancedSearchFor, listFor, tableFor, timelineFor} from "./collections";
export {Panel} from "./components";
export {
    autocompleteFor,
    Form,
    fieldFor,
    makeField,
    makeFormActions,
    makeFormNode,
    selectFor,
    stringFor,
    useFormActions,
    useFormNode
} from "./entity";
export {Content, Popin} from "./layout";
export {messageStore} from "./message";
export {makeReferenceStore} from "./reference";
export {classAutorun} from "./util";
