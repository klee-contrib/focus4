import {observable, reaction, runInAction} from "mobx";
import {Router, RouterConfig} from "yester";

import {ViewStore} from "./store";
export {ViewStore};

/**
 * Crée un routeur et le lance.
 * @param stores Des ViewStore précédemment créé. S'il y a plus d'un ViewStore, tous doivent avoir un préfixe.
 * @param config La config du routeur ([yester](https://github.com/basarat/yester)).
 */
export function startRouter<Store extends ViewStore<any, any>>(stores: Store[], config: RouterConfig = {type: "hash"}) {
    if (stores.length === 0) {
        throw new Error("Au moins un store doit avoir été spécifié.");
    }

    /** Liste contenant l'activité de chaque store. Un seul store peut être actif à la fois. */
    const storeActivity = observable(stores.map(_ => false));

    /** Routing activé ou non. On désactive le routing lorsqu'on change de store pour réinitialiser les autres. */
    let routingEnabled = true;

    /** Récupère l'URL courante. */
    function getUrl() {
        if (config.type === "browser") {
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
        if (config.type === "browser") {
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
        runInAction(() => stores.forEach((s, j) => {
            storeActivity[j] = i === j; // Seul le store `i` est actif.
            // On met tous les états des autres stores à `undefined`.
            if (i !== j) {
                for (const key in s.currentView) {
                    s.currentView[key] = undefined;
                }
            }
        }));

        routingEnabled = true;
    }

    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    // On construit le router.
    new Router([
        ...stores.map((store, i) => ({
            /** Route sur laquelle matcher. */
            $: `/${store.prefix ? `${store.prefix}` : ""}${store.paramNames.map(param => `(/:${param})`).join("")}`,
            /** Handler de navigation. */
            enter: ({params}: any) => {
                updateActivity(i); // On met à jour l'activité.
                store.setView(params); // On met à jour la vue avec les paramètres d'URL.
            }
        })),
        // On ajoute un wildcard pour gérer les routes non trouvées, et on les fait pointer à la route principale
        {$: "*", enter: () => updateUrl(`/${stores[0].prefix}`)}
    ], config).init();

    // Le routeur spécifie la route par défaut si on ne fournit pas de route, sans appeler tout de suite le handler `enter`. On doit donc faire cette initialisation en plus.
    if (getUrl() === `/${stores[0].prefix}`) {
        updateActivity(0);
    }

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
            return stores[storeActivity.findIndex(Boolean)];
        },
        to(prefix: Store["prefix"]) {
            if (prefix) {
                updateUrl(`/${prefix}`);
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
