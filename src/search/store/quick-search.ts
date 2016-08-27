import {Results, StoreFacet} from "../types";
import {SearchStore} from "./search";

export const definition: QuickSearch = {
    query: "query",
    scope: "scope",
    results: {},
    facets: [],
    totalCount: 0
};

export interface QuickSearch {
    query?: string;
    scope?: string;
    results?: Results<{}>;
    facets?: StoreFacet[];
    totalCount?: number;
}

export default class QuickSearchStore extends SearchStore<QuickSearch> {
    constructor(identifier?: string) {
        super({definition, identifier: identifier || "QUICK_SEARCH"});
    }

    emitPendingEvents() {
        if (this.pendingEvents.find(ev => !!["query", "scope"].find(x => x === ev.name.split(":change")[0]))) {
            this.emit("quick-search-criterias:change", {status: "update"});
        }
        this.pendingEvents.map((evtToEmit) => {
            let {name, data} = evtToEmit;
            this.emit(name, data);
        });
    }
}
