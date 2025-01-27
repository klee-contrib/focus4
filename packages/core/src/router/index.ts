import {createHashHistory, HashHistory} from "history";
import {isEqual, uniq} from "lodash";
import {action, extendObservable, intercept, observable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";

import {buildEndpoints, buildParamsMap, ParamObject} from "./builders";
import {RouteConfig, startHistory} from "./history";
import {buildQueryMap, buildQueryString, QueryParamConfig, QueryParams} from "./query";
import {Router, RouterConfirmation, RouterConstraintBuilder, UrlPathDescriptor, UrlRouteDescriptor} from "./types";

export {param} from "./param";
export {startHistory};

export type {Router, RouterConfirmation, RouterConstraintBuilder, UrlPathDescriptor, UrlRouteDescriptor};

/**
 * `makeRouter` permet de construire le routeur de l'application.
 *
 * Il prend en paramètre la définition de toutes les routes possibles dans l'application, définies avec des objets JS et la fonction `param`.
 *
 * Le routeur maintiendra ensuite un état interne qui sera le miroir de l'URL courante (la section après le #), et il pourra être requêté pour
 * connaître la route courante ou les valeurs des paramètres, afin de contrôler les données à charger et afficher dans vos composants.
 *
 * Il pourra aussi être utilisé pour générer des URLs et naviguer entre différents états d'URL.
 *
 * @param config Configuration du routeur.
 * @param constraintConfigurator Constraintes du routeur.
 */
export function makeRouter<C, Q extends QueryParamConfig>(
    config: C,
    constraintConfigurator?: (b: RouterConstraintBuilder<C>) => void,
    queryConfig = {} as Q
): Router<C, Q> {
    /**
     * Construit l'objet de valeurs.
     * @param cIn La config du routeur.
     * @param object L'objet en cours de construction (pour appel récursif).
     */
    function buildParamsObject<Cin>(cIn: Cin, object: ParamObject<C> = {} as any): ParamObject<C> {
        if (Array.isArray(cIn)) {
            extendObservable(object, {[cIn[0]]: undefined});
            intercept(object, cIn[0], change => {
                // Impossible de sauvegarder NaN en toute circonstance.
                if (Number.isNaN(change.newValue)) {
                    return null;
                }

                const isActive = Object.keys(store._activeParams).includes(cIn[0]);
                const isUndefined = change.newValue === undefined;

                /*
                 * On s'assure que l'URL et les paramètres enregistrés sont corrects.
                 * Ceci n'aura aucun effet si on met à jour la valeur après une navigation.
                 * En revanche, si on modifie un paramètre à la main, la mise à jour sera effectuée.
                 * Il se s'agit pas d'une navigation, donc ce ne sera pas enregistré dans l'historique.
                 */
                if (isActive && !isUndefined) {
                    // eslint-disable-next-line
                    store._activeParams[cIn[0]] = `${change.newValue as string}`;
                    if (store._activeUrl !== window.location.hash?.replace("#", "")) {
                        history.replace(store._activeUrl);
                    }
                }

                // Seuls les paramètres dans la route active peuvent être modifiés.
                if ((isActive && !isUndefined) || (!isActive && isUndefined)) {
                    return change;
                }

                return null;
            });
            if (cIn[2]) {
                buildParamsObject(cIn[2], object);
            }
        } else {
            for (const key in cIn) {
                (object as any)[key] = buildParamsObject(cIn[key]);
            }
        }

        return object;
    }

    // Objet de query.
    const queryObject = observable(
        Object.keys(queryConfig).reduce((s, q) => ({...s, [q]: undefined}), {})
    ) as QueryParams<Q>;
    for (const key in queryObject) {
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        intercept(queryObject, key, change => {
            // Impossible de sauvegarder NaN en toute circonstance.
            if (Number.isNaN(change.newValue)) {
                return null;
            }

            if (change.newValue === undefined || change.newValue === "") {
                delete store._activeQuery[key];
            } else {
                // eslint-disable-next-line
                store._activeQuery[key] = `${change.newValue as string}`;
            }

            let route = store._activeRoute + buildQueryString(store._activeQuery);

            for (const param in store._activeParams) {
                route = route.replace(`:${param}`, store._activeParams[param]);
            }

            if (route !== window.location.hash?.replace("#", "")) {
                history.replace(route);
            }

            return change;
        });
    }

    const store = extendObservable(
        {
            state: buildParamsObject(config),
            query: queryObject
        },
        {
            _activeRoute: "/",
            _activeParams: {},
            _activeQuery: {},
            _hasConfirm: false,
            _pending: undefined,

            get _activeUrl() {
                let url = store._activeRoute + buildQueryString(store._activeQuery);

                for (const param in store._activeParams) {
                    url = url.replace(`:${param}`, store._activeParams[param]);
                }

                return url;
            }
        },
        {
            _pending: observable.ref
        }
    ) as Router<C, Q> & {
        _activeRoute: string;
        _activeParams: Record<string, string>;
        _activeQuery: Record<string, string>;
        _activeUrl: string;
        _hasConfirm: boolean;
        _pending?: {
            activeRoute: string;
            activeParams: Record<string, string>;
            activeQuery: Record<string, string>;
            prevUrl: string;
        };
    };

    const paramsMap = buildParamsMap(config, store.state);
    const queryMap = buildQueryMap(queryConfig, store.query);

    const constraints = [] as {route: string; condition: () => boolean; redirect?: () => string}[];
    let history: HashHistory;

    /** Crée le routeur, appelé par "start". */
    async function start() {
        history = createHashHistory();

        const routes = [
            // Spécifie tous les endpoints dans le routeur.
            ...uniq(buildEndpoints(config)).map(
                $ =>
                    ({
                        $,
                        enter: action(({params, oldPath, search}) => {
                            if (store._pending) {
                                return;
                            }

                            const oldPathWithQuery = (oldPath || "/") + buildQueryString(store._activeQuery);

                            // On refuse la navigation si on tombe sur un query param inconnu.
                            if (
                                Object.keys(search)
                                    .filter(x => x)
                                    .some(qp => !Object.keys(queryConfig).includes(qp))
                            ) {
                                return {redirect: oldPathWithQuery, replace: true};
                            }

                            const prevRoute = store._activeRoute;
                            const prevParams = store._activeParams;
                            const prevQuery = store._activeQuery;
                            const prevUrl = store._activeUrl;

                            const activeRoute = $;
                            const activeParams = params;
                            const activeQuery = Object.keys(search)
                                .filter(x => x)
                                .reduce((acc, k) => ({...acc, [k]: decodeURIComponent(search[k])}), {});

                            if (
                                isEqual(
                                    {activeRoute, activeParams, activeQuery},
                                    {activeRoute: prevRoute, activeParams: prevParams, activeQuery: prevQuery}
                                )
                            ) {
                                return;
                            }

                            // On parcourt toutes les constraintes définies sur cette route.
                            for (const constraint of constraints.filter(c => activeRoute.startsWith(c.route))) {
                                // S'il y a une condition de blocage respectée, alors on redirige (et c'est la première déclarée qui est choisie).
                                if (constraint.condition()) {
                                    const redirect =
                                        (constraint.redirect?.() ?? (oldPath || "/")) + buildQueryString(activeQuery);
                                    if (redirect !== window.location.hash?.replace("#", "")) {
                                        store._activeRoute = prevRoute;
                                        store._activeParams = prevParams;
                                        return {redirect, replace: true};
                                    }
                                }
                            }

                            if (store._hasConfirm) {
                                store._pending = {
                                    activeRoute,
                                    activeParams,
                                    activeQuery,
                                    prevUrl
                                };
                                return;
                            } else {
                                store._activeRoute = activeRoute;
                                store._activeParams = activeParams;
                                store._activeQuery = activeQuery;
                            }

                            const newValues: (boolean | number | string | undefined)[] = [];

                            // Chaque paramètre de l'objet de valeur est réinitialisé à partir de sa valeur dans la route courante.
                            for (const key in paramsMap) {
                                if (key in store._activeParams) {
                                    newValues.push(paramsMap[key](store._activeParams[key]));
                                } else {
                                    paramsMap[key](undefined);
                                }
                            }

                            // Chaque paramètre de l'objet de query est réinitialisé à partir de sa valeur dans la query courante.
                            for (const key in queryMap) {
                                if (key in store._activeQuery) {
                                    newValues.push(queryMap[key](store._activeQuery[key]));
                                } else {
                                    queryMap[key](undefined);
                                }
                            }

                            // Si une valeur est invalide (que pour les nombres, et ça sera toujours NaN), on refuse la navigation.
                            if (newValues.some(Number.isNaN)) {
                                store._activeRoute = prevRoute;
                                store._activeParams = prevParams;
                                store._activeQuery = prevQuery;
                                return {redirect: oldPathWithQuery, replace: true};
                            }

                            return undefined;
                        })
                    } as RouteConfig)
            )
        ];

        await startHistory(history, routes);
    }

    /** Récupère le chemin correspondant à un préfixe + un prédicat. */
    function getPath(route: string, predicate: (x: UrlPathDescriptor<C>) => void) {
        const builder = (path: string) => {
            route += `/${path}`;
            return builder;
        };
        predicate(builder as any);
        if (!route) {
            route = "/";
        }
        return route;
    }

    /** Récupère la route correspondant à un préfixe + un prédicat. */
    function getRoute(route: string, predicate: (x: UrlRouteDescriptor<C>) => void) {
        const builder = (path: string) => {
            route += `/${Object.keys(paramsMap).includes(path) ? `:${path}` : path}`;
            return builder;
        };
        predicate(builder as any);
        return route;
    }

    /** Permet de garder le résultat de "get" en "computed" pour éviter de trigger "get" à chaque changement de route. */
    const innerGet = computedFn(
        (route: string) => {
            if (!store._activeRoute.startsWith(route)) {
                return undefined;
            } else {
                return store._activeRoute.replace(route, "").split("/")[1]?.replace(":", "");
            }
        },
        {keepAlive: true}
    );

    /** Fonction "get" de base */
    function get<C2>(route: string, predicate: (x: UrlRouteDescriptor<C>) => void) {
        return innerGet(getRoute(route, predicate)) as keyof C2 | undefined;
    }

    /** Fonction "href" de base */
    function href(route: string, predicate: (x: UrlPathDescriptor<C>) => void, query: QueryParams<Q> = {}) {
        return `#${getPath(route, predicate) + buildQueryString(query)}`;
    }

    /** Permet de garder le résultat de "is" en "computed" pour éviter de trigger "is" à chaque changement de route. */
    const innerIs = computedFn((route: string) => store._activeRoute.startsWith(route), {keepAlive: true});

    /** Fonction "is" de base */
    function is(route: string, predicate: (x: UrlRouteDescriptor<C>) => void) {
        return innerIs(getRoute(route, predicate));
    }

    /** Fonction "to" de base */
    function to(route: string, predicate: (x: UrlPathDescriptor<C>) => void, replace: boolean, query?: QueryParams<Q>) {
        route = getPath(route, predicate) + buildQueryString(query ?? store._activeQuery);
        if (route !== window.location.hash?.replace("#", "")) {
            if (replace) {
                history.replace(route);
            } else {
                history.push(route);
            }
        }
    }

    function blockOutside(e: BeforeUnloadEvent) {
        e.preventDefault();
    }

    const confirmation = observable({
        _activeIds: new Map<string, (() => Promise<void>) | undefined>(),

        get active() {
            return store._hasConfirm;
        },

        toggle(id: string, active: boolean, onCommitSave?: () => Promise<void>) {
            if (this._activeIds.has(id) && !active) {
                this._activeIds.delete(id);
            } else if (active) {
                this._activeIds.set(id, onCommitSave);
            }

            const hasConfirm = this._activeIds.size > 0;
            if (hasConfirm && !store._hasConfirm) {
                window.addEventListener("beforeunload", blockOutside);
            } else if (!hasConfirm && store._hasConfirm) {
                window.removeEventListener("beforeunload", blockOutside);
                this.commit();
            }

            store._hasConfirm = hasConfirm;
            store._pending = undefined;
        },

        get pending() {
            return store._pending !== undefined;
        },

        async commit(save = false) {
            if (store._hasConfirm && store._pending) {
                const {activeRoute, activeParams, activeQuery} = store._pending;

                if (save) {
                    await Promise.all(
                        Array.from(this._activeIds.values())
                            .filter(x => !!x)
                            .map(x => x())
                    );
                }

                runInAction(() => {
                    store._activeRoute = activeRoute;
                    store._activeParams = activeParams;
                    store._activeQuery = activeQuery;
                    store._pending = undefined;

                    // Chaque paramètre de l'objet de valeur est réinitialisé à partir de sa valeur dans la route courante.
                    for (const key in paramsMap) {
                        if (key in store._activeParams) {
                            paramsMap[key](store._activeParams[key]);
                        } else {
                            paramsMap[key](undefined);
                        }
                    }

                    // Chaque paramètre de l'objet de query est réinitialisé à partir de sa valeur dans la query courante.
                    for (const key in queryMap) {
                        if (key in store._activeQuery) {
                            queryMap[key](store._activeQuery[key]);
                        } else {
                            queryMap[key](undefined);
                        }
                    }
                });
            }
        },

        cancel() {
            if (store._hasConfirm && store._pending) {
                history.push(store._pending.prevUrl);
                store._pending = undefined;
            }
        }
    });

    /** Fonction "sub" de base */
    function sub(route: string, state: any, predicate: (x: UrlRouteDescriptor<C>) => void): any {
        const builder = (path: string) => {
            const isParam = Object.keys(paramsMap).includes(path);
            route += `/${isParam ? `:${path}` : path}`;
            if (!isParam) {
                state = state[path];
            }
            return builder;
        };
        predicate(builder as any);

        return {
            state,
            query: store.query,
            get: (p: any) => get(route, p),
            href: (p: any, q: any) => {
                let baseRoute = route;
                for (const param in store._activeParams) {
                    baseRoute = baseRoute.replace(`:${param}`, store._activeParams[param]);
                }
                return href(baseRoute, p, q);
            },
            is: (p: any) => is(route, p),
            to: (p: any, r = false, q: any = undefined) => {
                let baseRoute = route;
                for (const param in store._activeParams) {
                    baseRoute = baseRoute.replace(`:${param}`, store._activeParams[param]);
                }
                to(baseRoute, p, r, q);
            },
            sub: (p: any) => sub(route, state, p),
            start: () => {
                /** */
            },
            navigation: confirmation
        };
    }

    store.get = p => get("", p);
    store.href = (p, q) => href("", p, q);
    store.is = p => is("", p);
    store.to = (p, r = false, q = undefined) => to("", p, r, q);
    store.sub = p => sub("", store.state, p);
    store.start = start;
    store.confirmation = confirmation;

    function getConstraintBuilder(route: string): RouterConstraintBuilder<C> {
        return {
            block(predicate, condition) {
                constraints.push({route: getRoute(route, predicate), condition});
                return this;
            },
            redirect(predicate, condition, redirect) {
                constraints.push({
                    route: getRoute(route, predicate),
                    condition,
                    redirect: () => {
                        let baseRoute = route;
                        if (baseRoute.includes(":")) {
                            for (const param in store._activeParams) {
                                baseRoute = baseRoute.replace(`:${param}`, store._activeParams[param]);
                            }
                        }
                        return getPath(baseRoute, redirect);
                    }
                });
                return this;
            },
            sub(predicate) {
                return getConstraintBuilder(getRoute(route, predicate)) as any;
            }
        };
    }

    constraintConfigurator?.(getConstraintBuilder(""));

    return store;
}
