import {CoreStore} from "./";
import {isEmpty} from "lodash";
import {get} from "../reference/config";
import {Map} from "immutable";

export default class ReferenceStore extends CoreStore<{}> {

    data: Map<string, {}[]>;

    constructor() {
        const definition = get();
        if (isEmpty(definition)) {
            console.warn("You did not set any reference list in the reference configuration, see 'focus-core/reference/config/set'");
        }
        super({definition});
    }

    getReference(names: string[]) {
        return {references: this.data.toObject()};
    }
}
