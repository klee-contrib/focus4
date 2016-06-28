import {getConfigElement} from "./config";

const CACHE_DURATION = 1000 * 60;
let cache: {[key: string]: {timeStamp: number, value: {}[]}} = {};

function getTimeStamp() {
    return new Date().getTime();
}

function cacheData(key: string, value: {}[]) {
    cache[key] = {timeStamp: getTimeStamp(), value};
    return value;
}

/**
 * Load a reference with its list name.
 * It calls the service which must have been registered.
 * @param listName The name of the list to load.
 * @param query An optional parameter to give to the service call.
 */
export async function loadListByName(listName: string, query?: string) {
    const configurationElement = getConfigElement(listName);
    if (configurationElement === undefined) {
        throw new Error(`You are trying to load the reference list: ${listName} which does not have a list configure.`);
    }

    if (query === undefined) {
        let now = getTimeStamp();
        if (cache[listName] && (now - cache[listName].timeStamp) < CACHE_DURATION) {
            return cache[listName].value;
        }
    }

    const data = await configurationElement(query);

    if (query === undefined) {
        cacheData(listName, data);
    }

    return data;
}

/**
 * Load many lists by their names.
 * @param names The list of lists to load
 */
export async function loadMany(names: string[]) {
    return names.map(async (name) => await loadListByName(name));
}

/**
 * Get a function to trigger in autocomplete case.
 * The function will trigger a promise.
 * @param listName Name of the list.
 */
export function getAutoCompleteServiceQuery(listName: string) {
    return async (query: {term: string, callback: (list: {}[]) => void}) =>
        query.callback(await loadListByName(listName, query.term));
}
