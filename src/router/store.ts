import {mapValues} from "lodash";
import {action, computed, observable} from "mobx";

/**
 * Le ViewStore est une classe servant d'intermédiaire entre le routeur et le reste de l'application.
 * La propriété `currentView` est une observable en bijection avec l'URL. Son type est à spécifier en tant que paramètre de type de la classe.
 */
export class ViewStore<V, N extends string> {

    /** Représente l'état courant de l'URL. */
    @observable currentView: V;

    readonly paramNames: (keyof V)[];
    readonly prefix?: N;

    /**
     * Construit un nouveau ViewStore.
     * @param paramNames Le nom des paramètres de l'URL, dans l'ordre. Ils doivent correspondre avec les clés de `currentView`.
     * @param prefix Le préfixe éventuel des URLs de ce ViewStore (obligatoire pour avoir plusieurs stores).
     */
    constructor(paramNames: V, prefix?: N) {
        this.paramNames = Object.keys(paramNames) as (keyof V)[];
        this.prefix = prefix;
        this.currentView = mapValues(paramNames, () => undefined);
    }

    /** Calcule l'URL en fonction de l'état courant. */
    @computed
    get currentPath() {
        const url = this.getUrlFromView(this.currentView);
        if (url.includes("//")) {
            throw new Error("La vue courante n'est pas convertible en une URL car des paramètres sont manquants. Par exemple, pour l'URL '/:param1/:param2', si 'param2' est spécifié alors 'param1' doit l'être aussi.");
        }
        return url;
    }

    /**
     * Récupère l'URL pour la vue donnée.
     * @param view La vue à récupérer.
     */
    getUrl(view: Partial<V>) {
        return this.getUrlFromView(view);
    }

    /**
     * Met à jour la vue courante avec les paramètres donnés.
     * Utile pour mettre à jour plusieurs paramètres à la fois.
     * @param view Les paramètres.
     */
    @action
    setView(view: Partial<V>) {
        for (const param in view) {
            this.currentView[param] = view[param]!;
        }
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
                this.currentView[this.paramNames[i]] = params[i] as any;
            }
        }
    }

    private getUrlFromView(view: Partial<V>) {
        return `${this.prefix ? `${this.prefix}/` : ""}${this.paramNames.map(p => view[p]).join("/")}`.replace(/\/+$/, "");
    }
}
