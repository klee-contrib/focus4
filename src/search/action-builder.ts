import {dispatcher} from "../";
import searchAction, {SearchActionBuilderSpec} from "./search-action";
import {AdvancedSearch} from "../store/search/advanced-search";

/* tslint:disable */
import {InputFacet, OutputFacet} from "./search-action/types";
/* tslint:enable */

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
