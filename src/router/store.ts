import {isEqual, mapValues} from "lodash";
import {action, computed, observable} from "mobx";

export type View<T> = {
    readonly [P in keyof T]: T[P] | undefined;
};

export interface ViewStoreConfig<V, N> {
    /** Est appelé avant la navigation vers une nouvelle route. */
    beforeEnter?: (view: View<V>) => {redirect?: Partial<V>, errorCode?: string} | undefined;
    /** Le préfixe du store. */
    prefix?: N;
    /** Objet de vue, représenté dans l'URL. L'ordre des paramètres compte. */
    view: View<V>;
}

/**
 * Le ViewStore est une classe servant d'intermédiaire entre le routeur et le reste de l'application.
 * La propriété `currentView` est une observable en bijection avec l'URL. Son type est à spécifier en tant que paramètre de type de la classe.
 */
export class ViewStore<V, N extends string> {

    /** Est appelé avant la navigation vers une nouvelle route. */
    readonly beforeEnter?: (view: View<V>) => {redirect?: Partial<V>, errorCode?: string} | undefined;

    handleError: (code: string) => void;
    @observable isActive = false;

    /** Liste des paramètres de l'URL, dans l'ordre. */
    readonly paramNames: (keyof V)[];

    /** Préfixe éventuel du store. */
    readonly prefix?: N;

    /** Représente l'état courant de l'URL. */
    @observable private view: View<V>;

    /**
     * Construit un nouveau ViewStore.
     * @param config La configuration du store.
     */
    constructor({beforeEnter, view, prefix}: ViewStoreConfig<V, N>) {
        this.beforeEnter = beforeEnter;
        this.paramNames = Object.keys(view) as (keyof V)[];
        this.prefix = prefix;
        this.view = mapValues(view, () => undefined);
    }

    /** Calcule l'URL en fonction de l'état courant. */
    @computed
    get currentPath() {
        const url = this.getUrl(this.view);
        if (url.includes("//")) {
            throw new Error("La vue courante n'est pas convertible en une URL car des paramètres sont manquants. Par exemple, pour l'URL '/:param1/:param2', si 'param2' est spécifié alors 'param1' doit l'être aussi.");
        }
        return url;
    }

    /** Représente l'état courant de l'URL. */
    @computed
    get currentView() {
        return this.isActive && this.view || {} as View<V>;
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
     * @param view Les paramètres.
     * @param replace Remplace tout.
     */
    @action
    setView(view: Partial<V>, replace?: boolean) {
        const params = (replace ? view : {...this.currentView as {}, ...view as {}}) as V;

        if (this.beforeEnter) {
            const {errorCode, redirect} = this.beforeEnter(params) || {errorCode: undefined, redirect: undefined};
            if (errorCode) {
                this.handleError(errorCode);
                return;
            } else if (redirect) {
                const newParams = {...params as {}, ...redirect as {}};
                if (!isEqual(params, newParams)) {
                    this.setView(newParams);
                    return;
                }
            }
        }

        this.view = params;
    }
}
