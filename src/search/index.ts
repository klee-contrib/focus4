import {AdvancedSearchStore, QuickSearchStore} from "./store";

export {default as actionBuilder} from "./action-builder";

export const quickSearchStore = new QuickSearchStore();
export const advancedSearchStore = new AdvancedSearchStore();
