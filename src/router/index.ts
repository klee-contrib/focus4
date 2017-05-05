import {observable, reaction, runInAction} from "mobx";
import {RouteConfig, Router} from "yester";

import {ViewStore} from "./store";
export {ViewStore};

export interface RouterConfig<E = "error"> {
    /** Mode du routeur. Par défaut: "hash" */
    routerMode?: "hash" | "browser";
    /** Nom du préfixe pour la page d'erreur. Par défaut : "error" */
    errorPageName?: E;
    /** Nom du code pour une page non trouvée. Par défaut : "notfound" */
    notfoundCode?: string;
}

/**
 * Crée un routeur et le lance.
 * @param stores Des ViewStore précédemment créé. S'il y a plus d'un ViewStore, tous doivent avoir un préfixe.
 * @param config La config du routeur ([yester](https://github.com/basarat/yester)).
 */
export function startRouter<Store extends ViewStore<any, any>, E = "error">(stores: Store[], config: RouterConfig<E> = {}) {
    const {routerMode = "hash", errorPageName = "error", notfoundCode = "notfound"} = config;

    if (stores.length === 0) {
        throw new Error("Au moins un store doit avoir été spécifié.");
    }

    /** Liste contenant l'activité de chaque store. Un seul store peut être actif à la fois. */
    const storeActivity = observable([...stores.map(_ => false), false]); // On ajoute la page d'erreur comme activité supplémentaire.

    const errorCode = observable<string>(undefined);

    /** Routing activé ou non. On désactive le routing lorsqu'on change de store pour réinitialiser les autres. */
    let routingEnabled = true;

    /** Récupère l'URL courante. */
    function getUrl() {
        if (routerMode === "browser") {
            return window.location.pathname;
        } else {
            return window.location.hash.substring(1); // On enlève le #.
        }
    }

    /**
     * Met à jour l'URL courante.
     * @param url L'url à renseigner.
     */
    function updateUrl(url: string) {
        if (routerMode === "browser") {
            window.history.pushState(null, "", url);
        } else {
            window.location.hash = url;
        }
    }

    /**
     * Enregistre le store i comme actif.
     * @param i L'index du store.
     */
    function updateActivity(i: number) {
        // Si le store est déjà actif, on ne fait rien.
        if (storeActivity.findIndex(Boolean) === i) {
            return;
        }

        // On désactive le routing pendant la mise à jour pour ne pas déclencher de navigation pendant le reset.
        routingEnabled = false;

        // On parcourt tous les stores :
        runInAction(() => {
            storeActivity[stores.length] = i === stores.length;
            stores.forEach((s, j) => {
                storeActivity[j] = i === j; // Seul le store `i` est actif.
                // On met tous les états des autres stores à `undefined`.
                if (i !== j) {
                    for (const key in s.currentView) {
                        s.currentView[key] = undefined;
                    }
                }
            });
        });

        routingEnabled = true;
    }

    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    // On construit le router.
    new Router([

        // On construit une route par store.
        ...stores.map((store, i) => ({
            /** Route sur laquelle matcher. */
            $: `/${store.prefix ? `${store.prefix}` : ""}${store.paramNames.map(param => `(/:${param})`).join("")}`,
            beforeEnter: store.beforeEnter && (async({params}) => {
                const {errorCode: err, redirect} = await store.beforeEnter!(params) || {errorCode: undefined, redirect: undefined};
                if (err) {
                    return {redirect: `/${errorPageName}/${err}`, replace: true};
                } else if (redirect) {
                    const url = typeof redirect === "string" ? redirect : store.getUrl({...params, ...redirect});
                    if (url !== getUrl()) {
                        return {redirect: url, replace: true};
                    }
                }
                return undefined;
            }),
            /** Handler de navigation. */
            enter: ({params}) => {
                updateActivity(i); // On met à jour l'activité.
                store.setView(params); // On met à jour la vue avec les paramètres d'URL.
            }
        } as RouteConfig)),

        // On ajoute la route d'erreur.
        {
            $: `/${errorPageName}/:code`,
            enter: ({params}) => {
                updateActivity(stores.length);
                errorCode.set(params.code);
            }
        },

        // On ajoute le wildcard pour les URLs non matchées.
        {
            $: "*",
            beforeEnter: ({newPath}) => {
                if (newPath === "/") { // Si on a pas de route initiale, on redirige vers le store principal.
                    return {redirect: `/${stores[0].prefix}`, replace: true};
                } else { // Sinon on redirige vers la page d'erreur.
                    return {redirect: `/${errorPageName}/${notfoundCode}`, replace: true};
                }
            }
        }
    ], {type: routerMode}).init();

    // On met en place les réactions sur le currentPath de chaque ViewStore.
    stores.forEach(store => {
        reaction(() => store.currentPath, currentPath => {
            // On vérifie que le routing est bien activé.
            if (routingEnabled) {
                // Si le chemin à effectivement changé, alors on met à jour l'URL.
                if (currentPath !== getUrl()) {
                    updateUrl(currentPath);
                }
            }
        });
    });

    /** L'objet de retour. */
    return observable({
        stores: observable.ref(stores),
        get currentStore() {
            const i = storeActivity.findIndex(Boolean);
            if (i < stores.length) {
                return stores[storeActivity.findIndex(Boolean)];
            } else {
                return {prefix: errorPageName, errorCode: errorCode.get()};
            }
        },
        to(prefix: Store["prefix"]) {
            if (prefix) {
                updateUrl(`/${prefix}`);
            }
        }
    }) as {
        /** Store actif dans le routeur. */
        readonly currentStore?: Store | {prefix: E, errorCode: string};

        /** La liste des ViewStores enregistrés dans le routeur. */
        stores: Store[];

        /**
         * Navigue vers la racine du store du préfixe donné.
         * @param prefix Le préfixe.
         */
        to(prefix: Store["prefix"]): void;
    };
}
