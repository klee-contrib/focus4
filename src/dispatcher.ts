import {Dispatcher} from "flux";

export interface Action {
    identifier?: string;
    data?: {[key: string]: any};
    status?: {[key: string]: {name?: string, isLoading: boolean}};
    type: string;
    callerId?: string;
}

export class FocusDispatcher extends Dispatcher<{source: "SERVER_ACTION" | "VIEW_ACTION", action: Action}> {

    /**
     * Dispatche une action en provenance du serveur.
     * @param action L'action à dispatcher.
     */
    handleServerAction(action: Action) {
        this.dispatch({
            source: "SERVER_ACTION",
            action
        });
    }

    /**
     * Dispatche une action en provenance de la vue.
     * @param action L'action à dispatcher.
     */
    handleViewAction(action: Action) {
        this.dispatch({
            source: "VIEW_ACTION",
            action
        });
    }
}

export default new FocusDispatcher();
