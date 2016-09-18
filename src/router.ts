import {Router} from "director";
import {observable, computed, action, autorun} from "mobx";

/**
 * Crée un routeur et le lance.
 * @param stores Des ViewStore précédemment créé. S'il y a plus d'un ViewStore, tous doivent avoir un préfixe.
 */
export function startRouter(...stores: ViewStore<any>[]) {
    if (stores.length > 1 && stores.some(store => !store.prefix)) {
        throw new Error("Tous les stores doivent avoir un préfixe.");
    }

    new Router(stores.reduce((routes, store) => {
        routes[`/${store.prefix ? `${store.prefix}/` : ""}${store.paramNames.map(p => `:${p}`).join("/")}`] = (...params: string[]) => store.updateView(store.prefix, params);
        return routes;
    }, {} as {[route: string]: (...params: string[]) => void})).configure({
        notfound: () => stores.forEach(store => store.updateView()),
        html5history: true
    }).init();

    for (const store of stores) {
        autorun(() => {
            const {currentPath} = store;
            if (currentPath !== window.location.pathname) {
                window.history.pushState(null, undefined, currentPath);
            }
        });
    }
}

/**
 * Le ViewStore est une classe servant d'intermédiaire entre le routeur et le reste de l'application.
 * La propriété `currentView` est une observable en bijection avec l'URL. Son type est à spécifier en tant que paramètre de type de la classe.
 */
export class ViewStore<V extends {[key: string]: string}> {

    /** Représente l'état courant de l'URL. */
    @observable currentView: V;

    paramNames: string[];
    prefix?: string;

    /**
     * Construit un nouveau ViewStore.
     * @param paramNames Le nom des paramètres de l'URL, dans l'ordre. Ils doivent correspondre avec les clés de `currentView`.
     * @param prefix Le préfixe éventuel des URLs de ce ViewStore (obligatoire pour avoir plusieurs stores).
     */
    constructor(paramNames: string[], prefix?: string) {
        this.paramNames = paramNames;
        this.prefix = prefix;
    }

    /** Calcule l'URL en fonction de l'état courant. */
    @computed
    get currentPath() {
        return `/${this.prefix ? `${this.prefix}/` : ""}${this.paramNames.map(p => this.currentView[p]).join("/")}`;
    }

    /**
     * Calcule l'état en fonction de l'URL courante.
     * @param prefix Le préfixe de l'URL courante.
     * @param params Les paramètres de l'URL.
     */
    @action
    updateView(prefix?: string, params: string[] = []) {
        this.currentView = {} as V;
        if (prefix === this.prefix) {
            for (let i = 0; i < params.length; i++) {
                this.currentView[this.paramNames[i]] = params[i];
            }
        }
    }
}
