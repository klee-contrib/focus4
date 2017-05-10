import {isEmpty} from "lodash";
import {action, observable, reaction, runInAction} from "mobx";
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
export function makeRouter<Store extends ViewStore<any, any>, E = "error">(stores: Store[], config: RouterConfig<E> = {}) {
    const {routerMode = "hash", errorPageName = "error", notfoundCode = "notfound"} = config;

    if (stores.length === 0) {
        throw new Error("Au moins un store doit avoir été spécifié.");
    }

    /** Code d'erreur en cours. */
    const errorCode = observable<string>(undefined);

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
     * Enregistre le store i comme actif (et les autres comme inactifs.)
     *
     * Si i est plus grand que le nombre de stores, alors ils sont tous inactifs et on se retrouve sur la page d'erreur.
     * @param i L'index du store.
     */
    function updateActivity(i: number) {
        runInAction(() => stores.forEach((s, j) => s.isActiveInRouter = i === j));
    }

    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    // On construit le router.
    const router = new Router([

        // On construit une route par store.
        ...stores.map((store, i) => ({
            // Route sur laquelle matcher, construite à partir du préfixe et des paramètres.
            $: `/${store.prefix ? `${store.prefix}` : ""}${store.paramNames.map(param => `(/:${param})`).join("")}`,
            // Appelé à chaque navigation vers la route.
            beforeEnter: (({params}) => {

                // On applique le `beforeEnter` du store s'il y en a un.
                if (store.beforeEnter) {
                    const {errorCode: err, redirect} = store.beforeEnter(params) || {errorCode: undefined, redirect: undefined};
                    if (err) { // Cas de l'erreur : on redirige vers la page d'erreur avec le code.
                        return {redirect: `/${errorPageName}/${err}`, replace: true};
                    } else if (redirect) { // Cas de la redirection : on récupère la nouvelle URL et on redirige dessus, si on n'y est pas déjà.
                        const url = store.getUrl({...params, ...redirect});
                        if (url !== getUrl()) {
                            return {redirect: url, replace: true};
                        }
                    }
                }

                runInAction(() => {
                    store.setView(params, true); // On met à jour la vue avec les paramètres d'URL.
                    updateActivity(i); // On met à jour l'activité.
                });

                return undefined;
            }),

        } as RouteConfig)),

        // On ajoute la route d'erreur.
        {
            $: `/${errorPageName}/:code`,
            beforeEnter: action(({params}) => {
                errorCode.set(params.code);
                updateActivity(stores.length);
            })
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
    ], {type: routerMode});

    stores.forEach(store => {
        // On donne le handler d'erreur à chaque store.
        store.handleError = errCode => router.navigate(`/${errorPageName}/${errCode}`);

        // On met en place les réactions sur le currentPath de chaque ViewStore.
        reaction(() => store.currentPath, currentPath => {
            // Si le chemin à effectivement changé, alors on met à jour l'URL.
            if (!isEmpty(store.currentView) && currentPath !== getUrl()) {
                updateUrl(currentPath);
            }
        });
    });

    /** L'objet de retour. */
    return observable({
        get currentStore() {
            const store = stores.find(s => s.isActive);
            if (store) {
                return store;
            } else {
                return {prefix: errorPageName, errorCode: errorCode.get()};
            }
        },
        start: router.init.bind(router),
        stores: observable.ref(stores),
        to(prefix: Store["prefix"]) {
            if (prefix) {
                updateUrl(`/${prefix}`);
            }
        }
    }) as {
        /** Store actif dans le routeur. */
        readonly currentStore: Store | {prefix: E, errorCode: string};

        /** Lance le routeur. */
        start(): Promise<void>;

        /** La liste des ViewStores enregistrés dans le routeur. */
        stores: Store[];

        /**
         * Navigue vers la racine du store du préfixe donné.
         * @param prefix Le préfixe.
         */
        to(prefix: Store["prefix"]): void;
    };
}
