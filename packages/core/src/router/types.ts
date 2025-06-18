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
export type UrlPathDescriptor<C> =
    C extends ParamDef<infer _0, Param<infer T>, infer V>
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
    confirmation: RouterConfirmation;

    /**
     * Si la route demandée est active, retourne le morceau de route suivant.
     * @param predicate Callback décrivant la route.
     */
    get<C2 = C>(
        predicate?: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>
    ): (C2 extends ParamDef<infer P, infer _1, infer _2> ? P : keyof C2 & string) | undefined;

    /**
     * Récupère l'URL correspondante à la route demandée.
     * @param predicate Callback décrivant la route.
     * @param query Query params à ajouter.
     */
    href(predicate?: (x: UrlPathDescriptor<C>) => void, query?: QueryParams<Q>): string;
    /**
     * Vérifie si la section de route demandée est active dans le routeur.
     * @param predicate Callback décrivant la route.
     */
    is(predicate?: (x: UrlRouteDescriptor<C>) => void): boolean;
    /**
     * Navigue vers l'URL demandée.
     * @param predicate Callback décrivant l'URL.
     * @param replace Remplace la route précédente dans l'historique.
     * @param query Remplace les query params courants avec ceux donnés.
     */
    to(predicate?: (x: UrlPathDescriptor<C>) => void, replace?: boolean, query?: QueryParams<Q>): void;
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

/**
 * Permet d'activer un mode de "confirmation" du routeur,
 * qui bloque la prochaine navigation et demandera une confirmation (ou une annulation) à l'utilisateur pour continuer.
 */
export interface RouterConfirmation {
    /** Si la mode "confirmation" est activé. */
    readonly active: boolean;
    /** S'il y a une navigation en attente. */
    readonly pending: boolean;
    /**
     * Confirme la navigation demandée.
     * @param save Si oui, appelle tous les callbacks enregistrés pour la sauvegarde au commit.
     */
    commit(save?: boolean): Promise<void>;
    /** Annule la navigation demandée. */
    cancel(): void;
    /**
     * Active ou désactive le mode "confirmation", pour un identifiant donné. La mode sera activé sur le routeur s'il l'est au moins pour un identifiant.
     * @param id Identifiant unique, à générer au préable.
     * @param active Activation/Désactivation.
     * @param onCommitSave Callback à appeler si la confirmation est appelée avec sauvegarde.
     */
    toggle(id: string, active: boolean, onCommitSave?: () => Promise<void>): void;
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
