import {dispatcher} from "../";
import {ReferenceStore} from "../store";

import * as builder from "./builder"; export {builder};
import * as config from "./config"; export {config};

export const builtInStore = new ReferenceStore();

export type ReferenceContainer = {[key: string]: {}[]};

/**
 * Focus reference action.
 * @param referenceNames An array which contains the name of all the references to load.
 * @returns The promise of loading all the references.
 */
export function builtInReferenceAction(referenceNames: string[]) {
    return async () => {
        try {
            const data = await Promise.all(await builder.loadMany(referenceNames));
            let reconstructedData: ReferenceContainer = {};
            referenceNames.map((name, index) => {
                reconstructedData[name] = data[index];
            });
            dispatcher.handleViewAction({data: reconstructedData, type: "update"});
        } catch (err) {
            dispatcher.handleViewAction({data: err, type: "error"});
        }
    };
}
