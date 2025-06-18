import {HashHistory, Search} from "history";

import {match, MatchResultParams} from "./match";
import {parseSearchString} from "./query";

export interface RouteEnterEvent {
    oldPath: string;
    newPath: string;
    params: MatchResultParams;
    search: {[key: string]: string};
}

export interface RouteConfig {
    /**
     * The pattern to match against
     */
    $: string;

    /**
     * Called before entering a route. This is your chance to redirect if you want.
     *
     */
    enter: (evt: RouteEnterEvent) => string | undefined;
}

export async function startHistory(history: HashHistory, routes: RouteConfig[]) {
    let oldPath = "/";

    async function trigger({newPath, search}: {newPath: string; search: Search}) {
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
                params = enterPreMatch.params;
            }
        }

        // Route non matchée => on revient là où on était avant (ou à la racine si premier appel).
        if (!enterMatch || !params) {
            history.replace(oldPath);
            return;
        }

        /** Entering */
        const redirect = enterMatch.enter({oldPath, newPath, params, search: parsedSearch});
        if (!redirect) {
            oldPath = newPath;
        } else {
            history.replace(redirect);
            oldPath = redirect;
        }
    }

    history.listen(({location}) => {
        trigger({newPath: location.pathname, search: location.search});
    });

    await trigger({newPath: history.location.pathname, search: history.location.search});
}
