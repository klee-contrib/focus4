import {observable, computed, action} from "mobx";

/**
 * Le ViewStore est une classe servant d'intermédiaire entre le routeur et le reste de l'application.
 * La propriété `currentView` est une observable en bijection avec l'URL. Son type est à spécifier en tant que paramètre de type de la classe.
 */
export class ViewStore<V> {

    /** Représente l'état courant de l'URL. */
    @observable currentView: V;

    readonly paramNames: string[];
    readonly prefix?: string;

    /**
     * Construit un nouveau ViewStore.
     * @param paramNames Le nom des paramètres de l'URL, dans l'ordre. Ils doivent correspondre avec les clés de `currentView`.
     * @param prefix Le préfixe éventuel des URLs de ce ViewStore (obligatoire pour avoir plusieurs stores).
     */
    constructor(paramNames: string[], prefix?: string) {
        this.paramNames = paramNames;
        this.prefix = prefix;
        this.currentView = paramNames.reduce((view, param) => { (view as any)[param] = undefined; return view; }, {} as V);
    }

    /** Calcule l'URL en fonction de l'état courant. */
    @computed
    get currentPath() {
        const url = `/${this.prefix ? `${this.prefix}/` : ""}${this.paramNames.map(p => (this.currentView as any)[p]).join("/")}`.replace(/\/+$/, "");
        if (url.includes("//")) {
            throw new Error("La vue courante n'est pas convertible en une URL car des paramètres sont manquants. Par exemple, pour l'URL '/:param1/:param2', si 'param2' est spécifié alors 'param1' doit l'être aussi.");
        }
        return url;
    }

    /**
     * Calcule l'état en fonction de l'URL courante.
     * @param prefix Le préfixe de l'URL courante.
     * @param params Les paramètres de l'URL.
     */
    @action
    updateView(prefix?: string, params: string[] = []) {
        if (prefix === this.prefix) {
            for (let i = 0; i < this.paramNames.length; i++) {
                (this.currentView as any)[this.paramNames[i]] = params[i];
            }
        }
    }
}
