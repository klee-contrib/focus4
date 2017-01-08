import {observable, reaction, runInAction} from "mobx";

import {Router, RouterConfig} from "./director";
import {ViewStore} from "./store";
export {ViewStore};

import {applicationStore} from "../application";

/**
 * Crée un routeur et le lance.
 * @param config La config du routeur ([director](https://github.com/flatiron/director)).
 * @param stores Des ViewStore précédemment créé. S'il y a plus d'un ViewStore, tous doivent avoir un préfixe.
 */
export function startRouter<Store extends ViewStore<any, any>>(config: RouterConfig, stores: Store[]) {
    if (stores.length === 0) {
        throw new Error("Au moins un store doit être spécifié.");
    }

    const storeActivity = observable(stores.map(_ => false));
    let routingEnabled = true;

    function updateActivity(i: number) {
        routingEnabled = false;
        runInAction(() => stores.forEach((store, j) => {
            storeActivity[j] = i === j;
            if (i !== j) {
                for (const key in store.currentView) {
                    store.currentView[key] = undefined;
                }
            }
        }));
        routingEnabled = true;
    }

    function reset() {
        stores[0].updateView();
        if (config.html5history) {
            window.history.pushState(null, "", stores[0].prefix);
        } else {
            window.location.hash = stores[0].prefix;
        }
        updateActivity(0);
    }

    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    new Router(stores.reduce((routes, store, i) => {
        routes[`/?${store.prefix ? `${store.prefix}/?` : ""}${store.paramNames.map(_ => `([^\/]*)?`).join("/?")}`] = (...params: string[]) => {
            applicationStore.route = store.prefix;
            updateActivity(i);
            store.updateView(store.prefix, params);
        };
        return routes;
    }, {} as {[route: string]: (...params: string[]) => void}))
        .configure({notfound: reset, ...config})
        .init();

    if (config.html5history && !window.location.pathname || !config.html5history && !window.location.hash) {
        reset();
    }

    stores.forEach((store, i) => {
        reaction(() => store.currentPath, currentPath => {
            if (routingEnabled) {
                if (config.html5history) {
                    if (currentPath !== window.location.pathname) {
                        window.history.pushState(null, "", currentPath);
                        updateActivity(i);
                    }
                } else {
                    if (currentPath !== window.location.hash) {
                        window.location.hash = currentPath;
                        updateActivity(i);
                    }
                }
            }
        });
    });

    return observable({
        stores: observable.ref(stores),
        get currentStore() {
            return stores[storeActivity.findIndex(Boolean)];
        }
    }) as {
        readonly currentStore: Store;
        stores: Store[];
    };
}
