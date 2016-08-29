import loadAction, {ListActionBuilderSpec, ListStoreNodes} from "./action";

import dispatcher from "../dispatcher";

export default function listActionBuilder(config: ListActionBuilderSpec) {
    config.nbElement = config.nbElement || 50;
    return {
        /**
         * Build the search for the identifier scope.
         */
        load: loadAction(config),

        /**
         * Update the query for the identifier scope.
         * @param data The query value
         */
        updateProperties(data: ListStoreNodes) {
            return dispatcher.handleViewAction({
                data,
                type: "update",
                identifier: config.identifier
            });
        }
    };
};
