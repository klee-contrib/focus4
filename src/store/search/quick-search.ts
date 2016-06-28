import SearchStore from "./search";

export const definition = {
    query: "query",
    scope: "scope",
    results: [] as {}[],
    facets: [] as {}[],
    totalCount: 0
};

export default class QuickSearchStore extends SearchStore<typeof definition> {
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
