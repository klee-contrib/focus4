import {ParamObject} from "./builders";
import {Param, ParamDef} from "./param";
import {QueryParamConfig, QueryParams} from "./query";

/** Callback permettant de décrire une définition de route. */
export type UrlRouteDescriptor<C, _K = unknown, _T = unknown> = (C extends ParamDef<infer K0, Param<infer T>, infer V>
    ? (param: K0) => UrlRouteDescriptor<V, K0, T>
    : <K extends keyof C>(
          x: K
      ) => C[K] extends ParamDef<infer _1, infer _2, infer _3>
          ? UrlRouteDescriptor<C[K]>
          : C[K] extends ParamDef<infer _4, infer _5>
          ? void
          : UrlRouteDescriptor<C[K]>) & {spec: C};

/** Callback permettant de décrire une URL. */
export type UrlPathDescriptor<C> = C extends ParamDef<infer _0, Param<infer T>, infer V>
    ? (param: T) => UrlPathDescriptor<V>
    : <K extends keyof C>(
          x: K
      ) => C[K] extends ParamDef<infer _1, infer _2, infer _3>
          ? UrlPathDescriptor<C[K]>
          : C[K] extends ParamDef<infer _4, infer _5>
          ? void
          : UrlPathDescriptor<C[K]>;

/** Router correspondant à la config donnée. */
export interface Router<C = any, Q extends QueryParamConfig = {}> {
    /** Valeurs des paramètres de query. */
    readonly query: QueryParams<Q>;

    /** Etat du routeur. */
    readonly state: ParamObject<C>;

    /**
     * Permet d'activer un mode de "confirmation" du routeur,
     * qui bloque la prochaine navigation et demandera une confirmation (ou une annulation) à l'utilisateur pour continuer.
     */
    confirmation: {
        /** Si la mode "confirmation" est activé. */
        active: boolean;
        /** S'il y a une navigation en attente. */
        readonly pending: boolean;
        /**
         * Confirme la navigation demandée.
         * @param beforeCommit Callback à appeler avant le commit (par exemple pour une sauvegarde de formulaire).
         */
        commit(beforeCommit: () => Promise<void>): Promise<void>;
        /** Annule la navigation demandée. */
        cancel(): void;
    };

    /**
     * Si la route demandée est active, retourne le morceau de route suivant.
     * @param predicate Callback décrivant la route.
     */
    get<C2>(predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>): (keyof C2 & string) | undefined;

    /**
     * Récupère l'URL correspondante à la route demandée.
     * @param predicate Callback décrivant la route.
     * @param query Query params à ajouter.
     */
    href(predicate: (x: UrlPathDescriptor<C>) => void, query?: QueryParams<Q>): string;
    /**
     * Vérifie si la section de route demandée est active dans le routeur.
     * @param predicate Callback décrivant la route.
     */
    is(predicate: (x: UrlRouteDescriptor<C>) => void): boolean;
    /**
     * Navigue vers l'URL demandée.
     * @param predicate Callback décrivant l'URL.
     * @param replace Remplace la route précédente dans l'historique.
     * @param query Remplace les query params courants avec ceux donnés.
     */
    to(predicate: (x: UrlPathDescriptor<C>) => void, replace?: boolean, query?: QueryParams<Q>): void;
    /**
     * Construit une vue du routeur à partir d'une route donnée, permettant de manipuler une
     * sous section du routeur.
     * @param predicate Callback décrivant la route de base de la vue.
     */
    sub<C2, K, T>(
        predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2, K, T>
    ): Router<C2, Q> & {state: {[P in K & string]: T}};
    /** Lance le routeur. */
    start(): Promise<void>;
}

/** Builder pour construire des contraintes sur les routes d'un routeur. */
export interface RouterConstraintBuilder<C> {
    /**
     * Bloque l'accès à une route si une condition est remplie.
     * @param predicate Callback décrivant la route.
     * @param condition Condition.
     */
    block(predicate: (x: UrlRouteDescriptor<C>) => void, condition: () => boolean): RouterConstraintBuilder<C>;
    /**
     * Redirige une route vers une autre si une condition est remplie.
     * @param predicate Callback décrivant la route.
     * @param condition Condition.
     * @param to Callback décrivant l'URL cible.
     */
    redirect(
        predicate: (x: UrlRouteDescriptor<C>) => void,
        condition: () => boolean,
        to: (x: UrlPathDescriptor<C>) => void
    ): RouterConstraintBuilder<C>;
    /**
     * Construit une vue du ConstraintBuilder à partir d'une route donnée, permettant de manipuler une
     * sous section du ConstraintBuilder.
     * @param predicate Callback décrivant la route de base de la vue.
     */
    sub<C2>(predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>): RouterConstraintBuilder<C2>;
}
