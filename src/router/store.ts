import {mapValues} from "lodash";
import {action, computed, observable} from "mobx";

export interface ViewStoreConfig<V, N> {
    /** Est appelé avant la navigation vers une nouvelle route. */
    beforeEnter?: (view: V) => {redirect?: Partial<V> | string, errorCode?: string} | undefined;
    /** Le préfixe du store. */
    prefix?: N;
    /** Objet de vue, représenté dans l'URL. L'ordre des paramètres compte. */
    view: V;
}

/**
 * Le ViewStore est une classe servant d'intermédiaire entre le routeur et le reste de l'application.
 * La propriété `currentView` est une observable en bijection avec l'URL. Son type est à spécifier en tant que paramètre de type de la classe.
 */
export class ViewStore<V, N extends string> {

    /** Est appelé avant la navigation vers une nouvelle route. */
    readonly beforeEnter?: (view: V) => {redirect?: Partial<V> | string, errorCode?: string} | undefined;

    /** Représente l'état courant de l'URL. */
    @observable currentView: V;

    /** Liste des paramètres de l'URL, dans l'ordre. */
    readonly paramNames: (keyof V)[];

    /** Préfixe éventuel du store. */
    readonly prefix?: N;

    /**
     * Construit un nouveau ViewStore.
     * @param config La configuration du store.
     */
    constructor({beforeEnter, view, prefix}: ViewStoreConfig<V, N>) {
        this.beforeEnter = beforeEnter;
        this.paramNames = Object.keys(view) as (keyof V)[];
        this.prefix = prefix;
        this.currentView = mapValues(view, () => undefined);
    }

    /** Calcule l'URL en fonction de l'état courant. */
    @computed
    get currentPath() {
        const url = this.getUrl(this.currentView);
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
        return `/${this.prefix ? `${this.prefix}/` : ""}${this.paramNames.map(p => view[p]).join("/")}`.replace(/\/+$/, "");
    }

    /**
     * Met à jour la vue courante avec les paramètres donnés.
     * Utile pour mettre à jour plusieurs paramètres à la fois.
     * @param view Les paramètres.
     * @param replace Remplace tout.
     */
    @action
    setView(view: Partial<V>, replace?: boolean) {
        if (replace) {
            this.paramNames.forEach(param => this.currentView[param] = undefined as any);
        }

        for (const param in view) {
            this.currentView[param] = view[param]!;
        }
    }
}
