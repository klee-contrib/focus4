import {observable} from "mobx";
import {Router as YesterRouter} from "yester";

import {buildEndpoints} from "./endpoints";
import {buildObject, ParamObject} from "./object";
import {Param, ParamDef} from "./params";

/** Callback permettant de décrire une définition de route. */
export type UrlRouteDescriptor<C> = (C extends ParamDef<infer K0, infer _0, infer V>
    ? (param: K0) => UrlRouteDescriptor<V>
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
export type Router<C> = ParamObject<C> & {
    /**
     * Vérifie si la section de route demandée est active dans le routeur.
     * @param predicate Callback décrivant la route.
     */
    is(predicate: (x: UrlRouteDescriptor<C>) => void): boolean;
    /**
     * Navigue vers l'URL demandée.
     * @param predicate Callback décrivant l'URL.
     */
    to(predicate: (x: UrlPathDescriptor<C>) => void): void;
    /**
     * Construit une vue du routeur à partir d'une route donnée, permettant de manipuler une
     * sous section du routeur.
     * @param predicate Callback décrivant la route de base de la vue.
     */
    sub<C2>(predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>): Router<C2>;
    /**
     * Effectue une action à partir de la valeur d'un paramètre du routeur.
     * @param predicate Callback décrivant la route.
     * @param switcher Callback qui sera appelé avec le paramètre suivant de la route du prédicat.
     */
    switch<C2, T>(
        predicate: (x: UrlRouteDescriptor<C>) => UrlRouteDescriptor<C2>,
        switcher: (x: keyof C2 | undefined) => T
    ): T;
    /** Lance le routeur. */
    start(): Promise<void>;
};

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

/**
 * Construit un routeur.
 * @param config Configufration du routeur.
 * @param _builder Constraintes du routeur.
 */
export function makeRouter<C>(config: C, _builder?: (b: RouterConstraintBuilder<C>) => void): Router<C> {
    const store = (observable({
        _activeRoute: "/",
        ...buildObject(config)
    }) as any) as Router<C> & {_activeRoute: string};

    const router = new YesterRouter(
        buildEndpoints(config).map($ => ({
            $,
            beforeEnter: params => {
                store._activeRoute = $;
                /** ??? Profit. */
            }
        })),
        {type: "hash"}
    );

    store.is = () => true;
    store.to = () => {
        /** */
    };
    store.switch = () => undefined as any;
    store.sub = () => store as any;
    store.start = router.init.bind(router) as () => Promise<void>;

    return store;
}
