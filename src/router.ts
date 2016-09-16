import {Router} from "director";
import {observable, computed, action, autorun} from "mobx";

/**
 * Crée un routeur et le lance.
 * @param store Un ViewStore précédemment créé.
 */
export function startRouter(store: ViewStore<any>) {
    new Router({
        [`/${store.paramNames.map(p => `:${p}`).join("/")}`]: (...params: string[]) => store.updateView(params),
    }).configure({
        notfound: () => store.updateView(),
        html5history: true
    }).init();

    autorun(() => {
        const {currentPath} = store;
        if (currentPath !== window.location.pathname) {
            window.history.pushState(null, undefined, currentPath);
        }
    });
}

/**
 * Le ViewStore est une classe servant d'intermédiaire entre le routeur et le reste de l'application.
 * La propriété `currentView` est une observable en bijection avec l'URL. Son type est à spécifier en tant que paramètre de type de la classe.
 */
export class ViewStore<V extends {[key: string]: string}> {

    /** Représente l'état courant de l'URL. */
    @observable currentView: V;

    paramNames: string[];

    /**
     * Construit un nouveau ViewStore.
     * @param paramNames Le nom des paramètres de l'URL, dans l'ordre. Ils doivent correspondre avec les clés de `currentView`.
     */
    constructor(paramNames: string[]) {
        this.paramNames = paramNames;
    }

    /** Calcule l'URL en fonction de l'état courant. */
    @computed
    get currentPath() {
        return `/${this.paramNames.map(view => this.currentView[view]).join("/")}`;
    }

    /** Calcule l'état en fonction de l'URL courante. */
    @action
    updateView(params: string[] = []) {
        this.currentView = {} as V;
        for (let i = 0; i < params.length; i++) {
            this.currentView[this.paramNames[i]] = params[i];
        }
    }
}
