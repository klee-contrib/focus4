// Cet index cherche à réexporter tous les éléments courants pour les écrans issus des différents modules internes ou externes.
// Le but est d'essayer de limiter le nombre d'imports à 1 pour un écran simple.
// Il n'a pas du tout vocation a être exhaustif.

import "core-js/stable";
import "material-design-icons-iconfont/dist/material-design-icons.css";

import "./focus.css";

export {default as i18n} from "i18next";
export {action, autorun, computed, observable} from "mobx";
export {disposeOnUnmount, observer, useLocalStore, useObserver} from "mobx-react";
export {Component, useEffect, useRef, useState} from "react";

export {advancedSearchFor, listFor, tableFor, timelineFor} from "@focus4/collections";
export {classAutorun, messageStore} from "@focus4/core";
export {
    autocompleteFor,
    Form,
    fieldFor,
    makeFormActions,
    makeFormNode,
    Panel,
    selectFor,
    useFormActions,
    useFormNode
} from "@focus4/forms";
export {Content, Popin} from "@focus4/layout";
export {makeField, makeReferenceStore, stringFor} from "@focus4/stores";
