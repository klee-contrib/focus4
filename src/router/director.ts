import {autobind} from "core-decorators";
import {flatten} from "lodash";

const QUERY_SEPARATOR = /\?.*/;

export type Route = (...args: string[]) => void;
export interface Routes {
    [key: string]: Route | Routes;
}

export interface RouterConfig {
    recurse?: boolean | "forward";
    delimiter?: string;
    strict?: boolean;
    notfound?: () => void;
    resource?: {};
    html5history?: boolean;
    run_handler_in_init?: boolean;
    convert_hash_in_init?: boolean;
    after?: () => void;
    before?: () => void;
    on?: () => void;
}

interface ThisRoutes {
    on?: any;
    after?: any;
    before?: any;
    [key: string]: any;
}

interface ThisArray extends Array<any> {
    after?: any[];
    matched?: boolean;
    captures?: any[];
    source?: any;
}

@autobind
export class Router {
    listeners: Function[] = [];

    private routes: ThisRoutes = {};
    private methods = ["on", "once", "after", "before"];
    private _methods: {[key: string]: boolean} = {};

    private historySupport = (window.history !== null ? window.history.pushState : null) !== null;

    private recurse: boolean | "forward";
    private delimiter: string;
    private strict: boolean;
    private notfound?: () => void;
    private resource?: {[key: string]: any};
    private history: boolean;
    private run_in_init: boolean;
    private convert_hash_in_init: boolean;
    private every: {after?: () => void; before?: () => void; on?: () => void};
    private _invoked: boolean;
    private last: (() => void)[];

    constructor(routes: Routes) {
        this.configure();
        this.mount(routes || {});
    }

    configure(options: RouterConfig = {}) {
        options = options || {};
        for (let i = 0; i < this.methods.length; i++) {
            this._methods[this.methods[i]] = true;
        }
        this.recurse = options.recurse || this.recurse || false;
        this.delimiter = options.delimiter || "/";
        this.strict = typeof options.strict === "undefined" ? true : options.strict;
        this.notfound = options.notfound;
        this.resource = options.resource;
        this.history = options.html5history && this.historySupport || false;
        this.run_in_init = this.history === true && options.run_handler_in_init !== false;
        this.convert_hash_in_init = this.history === true && options.convert_hash_in_init !== false;
        this.every = {
            after: options.after,
            before: options.before,
            on: options.on
        };
        return this;
    }

    private mount(routes: Routes, path?: string[] | string) {
        path = path || [];
        if (!Array.isArray(path)) {
            path = path.split(this.delimiter);
        }

        const insertOrMount = (route: string, local: string[]) => {
            let rename = route;
            const parts = route.split(this.delimiter);
            const isRoute = parts[0] === "" || !this._methods[parts[0]];
            const event = isRoute ? "on" : rename;
            if (isRoute) {
                rename = rename.slice((rename.match(new RegExp("^" + this.delimiter)) || [""])[0].length);
                parts.shift();
            }
            const routeObject = routes[route];
            if (isRoute && typeof routeObject === "object") {
                local = local.concat(parts);
                this.mount(routeObject, local);
                return;
            } else if (isRoute) {
                local = local.concat(rename.split(this.delimiter));
                local = terminator(local, this.delimiter);
            }
            if (typeof routeObject !== "object") {
                this.insert(event as any, local, routeObject);
            }
        };

        for (let route in routes) {
            if (routes.hasOwnProperty(route)) {
                insertOrMount(route, path.slice(0));
            }
        }
    }

    private insert(method: "once" | "on" | "before" | "after", path: string[], route: Route, parent = this.routes): void {
        if (method === "once") {
            method = "on";
            route = ((r: Route) => {
                let once = false;
                return (...args: string[]) => {
                    if (once) {
                        return;
                    }
                    once = true;
                    return r(...args);
                };
            })(route);
        }

        path = path.filter(p => p && p.length > 0);
        let part = path.shift();
        if (/\:|\*/.test(part!) && !/\\d|\\w/.test(part!)) {
            part = regifyString(part!);
        }
        if (path.length > 0) {
            parent[part!] = parent[part!] || {};
            return this.insert(method, path, route, parent[part!] as Routes);
        }
        if (!part && !path.length && parent === this.routes) {
            switch (typeof parent[method]) {
                case "function":
                    parent[method] = [parent[method], route];
                    return;
                case "object":
                    parent[method].push(route);
                    return;
                case "undefined":
                    parent[method] = route;
                    return;
            }
            return;
        }

        const isArray = Array.isArray(parent[part!]);
        if (parent[part!] && !isArray && typeof parent[part!] === "object") {
            switch (typeof parent[part!][method]) {
                case "function":
                    parent[part!][method] = [parent[part!][method], route];
                    return;
                case "object":
                    parent[part!][method].push(route);
                    return;
                case "undefined":
                    parent[part!][method] = route;
                    return;
            }
        } else if (typeof parent[part!] === "undefined") {
            parent[part!] = {[method]: route};
            return;
        }
        throw new Error("Invalid route context: " + typeof parent[part!]);
    }

    init(r?: string) {
        const handler = (onChangeEvent?: PopStateEvent | HashChangeEvent) => {
            let newURL = onChangeEvent && (onChangeEvent as HashChangeEvent).newURL || window.location.hash;
            let url = this.history === true ? this.getPath : newURL.replace(/.*#/, "");
            this.dispatch("on", url.charAt(0) === "/" ? url : "/" + url);
        };

        this.listeners.push(handler);

        const onChange = (onChangeEvent: PopStateEvent | HashChangeEvent) => {
            for (let i = 0, l = this.listeners.length; i < l; i++) {
                this.listeners[i](onChangeEvent);
            }
        };

        if (this.history === true) {
            window.onpopstate = onChange;
        } else {
            window.onhashchange = onChange;
        }

        if (this.history === false) {
            if (dlocHashEmpty() && r) {
                document.location.hash = r;
            } else if (!dlocHashEmpty()) {
                this.dispatch("on", "/" + document.location.hash.replace(/^(#\/|#|\/)/, ""));
            }
        } else {
            let routeTo: string | null;
            if (this.convert_hash_in_init) {
                routeTo = dlocHashEmpty() && r ? r : !dlocHashEmpty() ? document.location.hash.replace(/^#/, "") : null;
                if (routeTo) {
                    window.history.replaceState({}, document.title, routeTo);
                }
            } else {
                routeTo = this.getPath;
            }

            if (routeTo || this.run_in_init === true) {
                handler();
            }
        }

        return this;
    }

    private get getPath() {
        let {pathname} = window.location;
        if (pathname.substr(0, 1) !== "/") {
            pathname = "/" + pathname;
        }
        return pathname;
    }

    private dispatch(method: "on", path: string) {
        let fns = this.traverse(method, path.replace(QUERY_SEPARATOR, ""), this.routes, "");
        let invoked = this._invoked;
        this._invoked = true;
        if (!fns || fns.length === 0) {
            this.last = [];
            if (typeof this.notfound === "function") {
                this.invoke([this.notfound], {
                    method: method,
                    path: path
                });
            }
            return false;
        }
        if (this.recurse === "forward") {
            fns = fns.reverse() as any as ThisArray;
        }
        const updateAndInvoke = () => {
            this.last = (fns as ThisArray).after!;
            this.invoke(this.runlist((fns as ThisArray)), this);
        };
        const after = this.every && this.every.after ? [this.every.after].concat(this.last) : [this.last];
        if (after && after.length > 0 && invoked) {
            this.invoke(after, this);
            updateAndInvoke();
            return true;
        }
        updateAndInvoke();
        return true;
    }

    private traverse(method: "on", path: string, routes: ThisRoutes, regexp: string, filter?: (d: any) => boolean): ThisArray | false {
        function filterRoutes(r: ThisArray) {
            if (!filter) {
                return r;
            }
            function deepCopy(source: any[]) {
                let result: any[] = [];
                for (let i = 0; i < source.length; i++) {
                    result[i] = Array.isArray(source[i]) ? deepCopy(source[i]) : source[i];
                }
                return result as ThisArray;
            }
            function applyFilter(functions: ThisArray) {
                for (let i = functions.length - 1; i >= 0; i--) {
                    if (Array.isArray(functions[i])) {
                        applyFilter(functions[i]);
                        if (functions[i].length === 0) {
                            functions.splice(i, 1);
                        }
                    } else {
                        if (!filter!(functions[i])) {
                            functions.splice(i, 1);
                        }
                    }
                }
            }
            let newRoutes = deepCopy(r);
            newRoutes.matched = r.matched;
            newRoutes.captures = r.captures;
            newRoutes.after = r.after!.filter(filter);
            applyFilter(newRoutes);
            return newRoutes;
        }
        if (path === this.delimiter && routes[method]) {
            const next = [[routes.before, routes[method]].filter(Boolean)] as any as ThisArray;
            next.after = [routes.after].filter(Boolean);
            next.matched = true;
            next.captures = [];
            return filterRoutes(next);
        }
        for (let r in routes) {
            if (routes.hasOwnProperty(r) && (!this._methods[r] || this._methods[r] && typeof routes[r] === "object" && !Array.isArray(routes[r]))) {
                const current = regexp + this.delimiter + r;
                let exact = current;
                if (!this.strict) {
                    exact += "[" + this.delimiter + "]?";
                }
                const match = path.match(new RegExp("^" + exact));
                if (!match) {
                    continue;
                }
                if (match[0] && match[0] === path && routes[r][method]) {
                    const next = [[routes[r].before, routes[r][method]].filter(Boolean)] as any as ThisArray;
                    next.after = [routes[r].after].filter(Boolean);
                    next.matched = true;
                    next.captures = match.slice(1);
                    if (this.recurse && routes === this.routes) {
                        next.push([routes.before, routes.on].filter(Boolean));
                        next.after = next.after.concat([routes.after].filter(Boolean));
                    }
                    return filterRoutes(next);
                }
                const next = this.traverse(method, path, routes[r], current);
                if (next && next.matched) {
                    let fns = [] as any as ThisArray;
                    if (next.length > 0) {
                        fns = fns.concat(next) as any as ThisArray;
                    }
                    if (this.recurse) {
                        fns.push([routes[r].before, routes[r].on].filter(Boolean));
                        next.after = next.after!.concat([routes[r].after].filter(Boolean));
                        if (routes === this.routes) {
                            fns.push([routes["before"], routes["on"]].filter(Boolean));
                            next.after = next.after.concat([routes["after"]].filter(Boolean));
                        }
                    }
                    fns.matched = true;
                    fns.captures = next.captures;
                    fns.after = next.after;
                    return filterRoutes(fns);
                }
            }
        }
        return false;
    }

    private invoke(fns: ThisArray, thisArg: any) {
        let apply: (d: any) => boolean;
        apply = (fn: any) => {
            if (Array.isArray(fn)) {
                return fn.every(apply);
            } else if (typeof fn === "function") {
                return fn.apply(thisArg, fns.captures || []);
            } else if (typeof fn === "string" && this.resource) {
                this.resource[fn].apply(thisArg, fns.captures || []);
            }
        };
        fns.every(apply);
    }

    private runlist(fns: ThisArray) {
        let runlist = (this.every && this.every.before ? [this.every.before].concat(flatten(fns)) : flatten(fns)) as any as ThisArray;
        if (this.every && this.every.on) {
            runlist.push(this.every.on);
        }
        runlist.captures = fns.captures;
        runlist.source = fns.source;
        return runlist;
    }
}

function dlocHashEmpty() {
    return document.location.hash === "" || document.location.hash === "#";
}

function regifyString(str: string) {
    let matches: RegExpMatchArray | null;
    let last = 0;
    let out = "";
    while (matches = str.substr(last).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
        last = matches.index + matches[0].length;
        matches[0] = matches[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
        out += str.substr(0, matches.index) + matches[0];
    }
    str = out += str.substr(last);
    let captures = str.match(/:([^\/]+)/ig);
    if (captures) {
        for (let i = 0; i < captures.length; i++) {
            const capture = captures[i];
            if (capture.slice(0, 2) === "::") {
                str = capture.slice(1);
            } else {
                str = str.replace(capture, "([._a-zA-Z0-9-%()]+)");
            }
        }
    }
    return str;
}

function terminator(routes: string[], delimiter: string, start = "(", stop = ")") {
    let last = 0, left = 0, right = 0;
    for (let i = 0; i < routes.length; i++) {
        let chunk = routes[i];
        if (chunk.indexOf(start, last) > chunk.indexOf(stop, last) || ~chunk.indexOf(start, last) && !~chunk.indexOf(stop, last) || !~chunk.indexOf(start, last) && ~chunk.indexOf(stop, last)) {
            left = chunk.indexOf(start, last);
            right = chunk.indexOf(stop, last);
            if (~left && !~right || !~left && ~right) {
                let tmp = routes.slice(0, (i || 1) + 1).join(delimiter);
                routes = [tmp].concat(routes.slice((i || 1) + 1));
            }
            last = (right > left ? right : left) + 1;
            i = 0;
        } else {
            last = 0;
        }
    }
    return routes;
}
