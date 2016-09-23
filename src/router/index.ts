import {autorun} from "mobx";

import {Router} from "./director";
import {ViewStore} from "./store";
export {ViewStore};

/**
 * Crée un routeur et le lance.
 * @param html5history Utiliser ou non l'History API HTML4.
 * @param stores Des ViewStore précédemment créé. S'il y a plus d'un ViewStore, tous doivent avoir un préfixe.
 */
export function startRouter(html5history: true, ...stores: ViewStore<any>[]) {
    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    new Router(stores.reduce((routes, store) => {
        routes[`/${store.prefix ? `${store.prefix}/` : ""}${store.paramNames.map(p => `([^\/]*)?`).join("/?")}`] = (...params: string[]) => store.updateView(store.prefix, params);
        return routes;
    }, {} as {[route: string]: (...params: string[]) => void})).configure({
        notfound: () => stores.forEach(store => store.updateView()),
        html5history
    }).init();

    for (const store of stores) {
        autorun(() => {
            const {currentPath} = store;
            if (html5history) {
                if (currentPath !== window.location.pathname) {
                    window.history.pushState(null, undefined, currentPath);
                }
            } else {
                if (currentPath !== window.location.hash) {
                    window.location.hash = currentPath;
                }
            }
        });
    }
}
