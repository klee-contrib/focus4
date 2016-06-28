import {Map, fromJS} from "immutable";

export type ReferenceService = (query?: string) => Promise<{}[]>;
export type ReferenceConfig = {[key: string]: ReferenceService};

let config = Map<ReferenceService>({});

/**
 * Get a configuration copy.
 */
export function get() {
    return config.toObject();
}

/**
 * Get an element from the configuration using its name.
 * @param name The key identifier of the configuration
 */
export function getConfigElement(name: string) {
    if (config.has(name)) {
        return config.get(name);
    }
    return undefined;
}

/**
 * Set the reference configuration.
 * @param newConf           The new configuration to set.
 * @param isClearPrevious   Does the config should be reset.
 */
export function set(newConf: ReferenceConfig, isClearPrevious?: boolean) {
    config = isClearPrevious ? fromJS(newConf) : config.merge(newConf);
}
