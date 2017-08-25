import {isEqual, mapValues} from "lodash";
import {action, computed, observable} from "mobx";

/** Crée le type de vue associé à un objet. */
export type View<T> = {
    readonly [P in keyof T]: T[P] | undefined;
};

/** Configuration du ViewStore. */
export interface ViewStoreConfig<V, N> {
    /** Est appelé avant la navigation vers une nouvelle route. */
    beforeEnter?: (view: View<V>) => {redirect?: Partial<V>, errorCode?: string} | undefined;
    /** Le préfixe du store. */
    prefix?: N;
    /** Objet de vue, représenté dans l'URL. L'ordre des paramètres compte. */
    view: View<V>;
}

/**
 * Store de vue, défini par la forme de son objet de vue (`currentView`) et son préfixe. Utilisé pour initialiser le routeur avec lequel il est un bijection (URL <-> vue),
 * ce store sera l'unique source de vérité sur l'état de vue courant de l'application (ou d'un module).
 */
export class ViewStore<V, N extends string> {

    /** @internal */
    /** Est appelé avant la navigation vers une nouvelle route. */
    readonly beforeEnter?: (view: View<V>) => {redirect?: Partial<V>, errorCode?: string} | undefined;

    /** @internal */
    /** Renseigné par le routeur. Est appelé lors d'un retour d'erreur dans le `beforeEnter`.  */
    handleError: (code: string) => void;

    /** @internal */
    /** Renseigné par le routeur. Précise si le store est actuellement actif dans ce dernier. */
    @observable isActiveInRouter = false;

    /** @internal */
    /** Liste des paramètres de l'URL, dans l'ordre. */
    readonly paramNames: (keyof V)[];

    /** Préfixe éventuel du store. */
    readonly prefix?: N;

    /** @internal */
    /** Renseigné par le routeur. Permet de mettre le store actif dans le routeur. */
    updateActivity: () => void;

    /** @internal */
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
        const url = this.getUrl();
        if (url.includes("//")) {
            throw new Error("La vue courante n'est pas convertible en une URL car des paramètres sont manquants. Par exemple, pour l'URL '/:param1/:param2', si 'param2' est spécifié alors 'param1' doit l'être aussi.");
        }
        return url;
    }

    /** Représente l'état courant de l'URL. */
    @computed.struct
    get currentView() {
        return this.isActive && this.view || {} as View<V>;
    }

    /** Précise si le store est actuellement actif dans le router. */
    @computed
    get isActive() {
        return this.isActiveInRouter;
    }

    /**
     * Récupère l'URL pour la vue donnée.
     * @param view La vue à récupérer.
     * @param replace Ne fusionne pas la vue demandée avec la vue courante.
     */
    getUrl(view?: Partial<V>, replace?: boolean) {
        const newView = (replace ? view : {...this.currentView as {}, ...view as {}}) as V;
        return `/${this.prefix ? `${this.prefix}/` : ""}${this.paramNames.map(p => newView[p]).join("/")}`.replace(/\/+$/, "");
    }

    /**
     * Met à jour la vue courante.
     * @param view La vue souhaitée.
     * @param replace Ne fusionne pas la vue souhaitée avec la vue courante.
     */
    @action
    setView(view: Partial<V>, replace?: boolean) {
        // On construit la nouvelle vue.
        const newView = (replace ? view : {...this.currentView as {}, ...view as {}}) as V;

        // Si on a un `beforeEnter`, on l'appelle.
        if (this.beforeEnter) {
            const {errorCode, redirect} = this.beforeEnter(newView) || {errorCode: undefined, redirect: undefined};
            if (errorCode) { // Cas erreur : on appelle le handler du routeur.
                this.handleError(errorCode);
                return;
            } else if (redirect) { // Cas de la redirection : on réappelle `setView` avec la vue ainsi reprécisée.
                const redirectedView = {...newView as {}, ...redirect as {}};
                if (!isEqual(newView, redirectedView)) { // On ne rappelle pas `setView` si on est déjà dans le bon état, bien sûr.
                    this.setView(redirectedView);
                    return;
                }
            }
        }

        // On met à jour l'activité dans le routeur.
        this.updateActivity();

        // Et on affecte.
        this.view = newView;
    }

    /**
     * Effectue l'action fournie à partir de la vue courante et filtre les résultats "faux".
     * @param block L'action à effectuer.
     */
    withView<T>(block: (view: View<V>) => T | undefined | "" | false) {
        const p = block(this.currentView);
        if (p !== undefined && p !== "" && p !== false) {
            return p;
        } else {
            return undefined;
        }
    }
}
