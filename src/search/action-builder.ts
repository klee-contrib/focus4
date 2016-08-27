import dispatcher from "dispatcher";

import searchAction, {SearchActionBuilderSpec} from "./action";
import {AdvancedSearch} from "./store/advanced-search";

export interface SearchAction {
    search: (isScroll?: boolean) => Promise<void>;
    updateProperties: (data: AdvancedSearch) => void;
}

export default function searchActionBuilder(config: SearchActionBuilderSpec) {
    config.nbSearchElement = config.nbSearchElement || 50;
    return {
        search: searchAction(config),
        updateProperties(data: AdvancedSearch) {
            return dispatcher.handleViewAction({
                data,
                type: "update",
                identifier: config.identifier
            });
        }
    };
}
