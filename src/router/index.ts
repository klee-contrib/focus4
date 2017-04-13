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
        throw new Error("Au moins un store doit avoir été spécifié.");
    }

    /** Liste contenant l'activité de chaque store. Un seul store peut être actif à la fois. */
    const storeActivity = observable(stores.map(_ => false));

    /** Routing activé ou non. On désactive le routing lorsqu'on change de store pour réinitialiser les autres. */
    let routingEnabled = true;

    /**
     * Rend le store `i` actif.
     * @param i L'index du store à rendre actif.
     */
    function updateActivity(i: number) {
        // On désactive le routing.
        routingEnabled = false;

        // On parcourt tous les stores :
        runInAction(() => stores.forEach((store, j) => {
            storeActivity[j] = i === j; // Seul le store `i` est actif.
            // On met tous les états des autres stores à `undefined`.
            if (i !== j) {
                for (const key in store.currentView) {
                    store.currentView[key] = undefined;
                }
            }
        }));

        // On réactive le routing.
        routingEnabled = true;
    }

    /** Reset le routeur en mettant le premier store actif et son état à `undefined`. */
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

    // On initilialise le router `director` en créant une route par ViewStore, qui contient le prefix + tous les paramètres dans la Regex de route en facultatif.
    new Router(stores.reduce((routes, store, i) => {
        routes[`/?${store.prefix ? `${store.prefix}/?` : ""}${store.paramNames.map(_ => `([^\/]*)?`).join("/?")}`] = (...params: string[]) => {
            // Pour chaque navigation :
            applicationStore.route = store.prefix; // On met à jour le store applicatif.
            updateActivity(i); // On note le store comme actif.
            store.updateView(store.prefix, params); // On met à jour la vue avec les paramètres d'URL.s
        };
        return routes;
    }, {} as {[route: string]: (...params: string[]) => void}))
        .configure({notfound: reset, ...config}) // On appelle `reset()` en cas de route non trouvée.
        .init();

    // On initialise le retour à la page principale (via `reset()`).
    if (config.html5history && !window.location.pathname || !config.html5history && !window.location.hash) {
        reset();
    }

    // On met en place les réactions sur le currentPath de chaque ViewStore
    stores.forEach((store, i) => {
        reaction(() => store.currentPath, currentPath => {
            // On vérifie que le routing est bien activé.
            if (routingEnabled) {
                // Si le chemin à effectivement changé, alors on met à jour l'URL et l'activité du store.
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

    /** L'objet de retour. */
    return observable({
        stores: observable.ref(stores),
        get currentStore() {
            return stores[storeActivity.findIndex(Boolean)];
        },
        to(prefix: Store["prefix"]) {
            if (prefix) {
                if (config.html5history) {
                    window.history.pushState(null, "", prefix);
                } else {
                    window.location.hash = prefix;
                }
            }
        }
    }) as {
        /** Store actif dans le routeur. */
        readonly currentStore: Store;

        /** La liste des ViewStores enregistrés dans le routeur. */
        stores: Store[];

        /**
         * Navigue vers la racine du store du préfixe donné.
         * @param prefix Le préfixe.
         */
        to(prefix: Store["prefix"]): void;
    };
}
