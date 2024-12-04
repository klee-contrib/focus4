import {HashHistory, Search} from "history";

import {match, MatchResultParams} from "./match";
import {parseSearchString} from "./query";

export interface RouteEnterEvent {
    oldPath: string;
    newPath: string;
    params: MatchResultParams;
    search: {[key: string]: string};
}

export type RouteBeforeEnterResult =
    | void
    | null
    | undefined
    | {redirect: string; replace?: boolean}
    | Promise<{redirect: string; replace?: boolean}>;

export interface RouteConfig {
    /**
     * The pattern to match against
     */
    $: string;

    /**
     * Called before entering a route. This is your chance to redirect if you want.
     *
     */
    enter: (evt: RouteEnterEvent) => RouteBeforeEnterResult;
}

export async function startHistory(history: HashHistory, routes: RouteConfig[]) {
    async function trigger({oldPath, newPath, search}: {oldPath: string; newPath: string; search: Search}) {
        const parsedSearch = parseSearchString(search);

        let beforeMatch: RouteConfig | undefined;
        let enterMatch: RouteConfig | undefined;
        let params: MatchResultParams | undefined;

        // Pre-parse out matches to make sure they are hit
        for (const route of routes) {
            const pattern = route.$;
            const beforePreMatch = match({pattern, path: oldPath});
            const enterPreMatch = match({pattern, path: newPath});
            // Only use first match and if no remaining path, i.e. full match
            if (!beforeMatch) {
                if (beforePreMatch && !beforePreMatch.remainingPath) {
                    beforeMatch = route;
                }
            }

            if (!enterMatch) {
                if (!enterPreMatch || enterPreMatch.remainingPath) {
                    continue;
                }

                enterMatch = route;
                // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                params = enterPreMatch.params;
            }
        }

        // Route non matchée => on revient là où on était avant (ou à la racine si premier appel).
        if (!enterMatch || !params) {
            history.push(oldPath || "/");
            return;
        }

        /** Entering */
        const result = await enterMatch.enter({oldPath, newPath, params, search: parsedSearch});
        if (!result) {
            /** Nothing to do */
        } else if (result.redirect) {
            if (result.replace) {
                history.replace(result.redirect);
            } else {
                history.push(result.redirect);
            }
            return;
        }
    }

    let oldPath = history.location.pathname;
    history.listen(({location}) => {
        trigger({
            oldPath,
            newPath: location.pathname,
            search: location.search
        });
        oldPath = location.pathname;
    });

    await trigger({
        oldPath: "",
        newPath: history.location.pathname,
        search: history.location.search
    });
}
