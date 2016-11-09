import {autorun} from "mobx";

import {Router, RouterConfig} from "./director";
import {ViewStore} from "./store";
export {ViewStore};

/**
 * Crée un routeur et le lance.
 * @param config La config du routeur ([director](https://github.com/flatiron/director)).
 * @param stores Des ViewStore précédemment créé. S'il y a plus d'un ViewStore, tous doivent avoir un préfixe.
 */
export function startRouter(config: RouterConfig, ...stores: ViewStore<any>[]) {
    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    // Le premier store est le store par défaut, il est donc actif à l'initialisation.
    stores[0].isActive = true;

    new Router(stores.reduce((routes, store) => {
        routes[`/${store.prefix ? `${store.prefix}/` : ""}${store.paramNames.map(p => `([^\/]*)?`).join("/?")}`] = (...params: string[]) => store.updateView(store.prefix, params);
        return routes;
    }, {} as {[route: string]: (...params: string[]) => void})).configure(
        Object.assign({}, {
        notfound: () => stores[0].updateView(),
    }, config)).init();

    for (const store of stores) {
        autorun(() => {
            const {currentPath, prefix} = store;
            if (config.html5history) {
                if (currentPath !== window.location.pathname) {
                    window.history.pushState(null, "", (prefix ? `${prefix}/` : "") + currentPath);
                    store.isActive = true;
                } else {
                    store.isActive = false;
                }
            } else {
                if (currentPath !== window.location.hash) {
                    window.location.hash = (prefix ? `${prefix}/` : "") + currentPath;
                    store.isActive = true;
                } else {
                    store.isActive = false;
                }
            }
        });
    }
}
