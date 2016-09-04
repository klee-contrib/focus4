import {isArray, isObject, mapValues} from "lodash";
import {observable} from "mobx";

import {Entity, EntityField} from "./types";

export interface EntityValue<T> {
    $field?: EntityField;
    value: T;
}

export type EntityConfig = {[key: string]:
    {[field: string]: EntityValue<{}>}
    | [{[field: string]: EntityValue<{}>}, string]
    | [{[field: string]: EntityValue<{}>}[], string]
};

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclus les métadonnées pour tous les champs des entités utilsées.
 * @param config L'objet constituant du store, dont chaque propriété doit correspondre à une entité. Les valeurs possibles sont "{}", [{}, "entityName"] ou [[], "entityName"] (pour une liste).
 * @param entityList La liste des toutes les entités utilisées par les propriétés du store (y compris les composées).
 */
export function makeEntityStore<T>(config: EntityConfig, entityList: Entity[]): T & {set: (config: {}) => void} {
    const entityMap = entityList.reduce((entities, entity) => {
        entities[entity.name] = entity;
        return entities;
    }, {} as {[name: string]: Entity});

    for (const item in config) {
        if (!entityMap[isArray(config[item]) ? (config[item] as any[])[1] : item]) {
            throw new Error(`La propriété "${item}" n'a pas été trouvée dans la liste d'entités`);
        }
    }

    const entityStore: {[key: string]: any} = {};

    for (const ref in config) {
        entityStore[ref] = buildEntityEntry(entityStore, config, entityMap, ref);
    }

    entityStore["set"] = fillEntityEntry(entityStore);

    return observable(entityStore) as any;
}

function buildEntityEntry(entityStore: {[key: string]: any}, config: EntityConfig, entityMap: {[name: string]: Entity}, ref: string): {[key: string]: EntityValue<any>} | any[] {
    if (isArray(config[ref]) && isArray((config[ref] as any[])[0])) {
        entityStore["$arrayEntities"] = entityStore["$arrayEntities"] || {};
        entityStore["$arrayEntities"][ref] = entityMap[(config[ref] as any)[1]];
        return [];
    }

    const trueRef = isArray(config[ref]) ? (config[ref] as any[])[1] : ref;
    return mapValues(entityMap[trueRef].fields, (v, key) => {
        if (v.entityName && !entityMap[v.entityName]) {
            throw new Error(`L'entité "${trueRef}"" dépend de l'entité "${v.entityName}"" qui n'a pas été trouvée dans la liste.`);
        }
        return  {
            $field: entityMap[trueRef].fields[key!],
            value: v.entityName && buildEntityEntry(entityStore, config, entityMap, v.entityName)
        };
    });
}

function fillEntityEntry(entityStore: {[key: string]: any}) {
    return (setConfig: {[key: string]: any}) => {
        for (const ref in setConfig) {
            if (!entityStore[ref]) {
                throw new Error(`"${ref}" n'existe pas dans ce store.`);
            }
            if (isArray(setConfig[ref])) {
               entityStore[ref].replace(setConfig[ref].map((item: {}) => buildEntityEntry(entityStore, {}, {[ref]: entityStore["$arrayEntities"][ref]}, ref)));
               for (let i = 0; i < setConfig[ref].length; i++) {
                    fillSubEntityEntry(ref, entityStore["$arrayEntities"][ref].name, entityStore[ref][i], setConfig[ref][i]);
               }
            } else {
                for (const item in setConfig[ref]) {
                    if (!entityStore[ref][item]) {
                        throw new Error(`"${ref}" n'a pas de propriété "${item}".`);
                    }
                    entityStore[ref][item].value = isObject(setConfig[ref][item]) ? fillSubEntityEntry(ref, item, entityStore[ref][item].value, setConfig[ref][item]) : setConfig[ref][item];
                }
            }
        }
    };
}

function fillSubEntityEntry(ref: string, item: string, subEntity: {[key: string]: any}, value: {[key: string]: any}) {
    if (!isObject(subEntity)) {
        throw new Error(`La propriété "${item}" de "${ref}" n'est pas un objet.`);
    }

    for (const key in value) {
        if (!subEntity[key]) {
            throw new Error(`La propriété "${key}" de "${item}" n'existe pas.`);
        }
        subEntity[key].value = isObject(value[key]) ? fillSubEntityEntry(ref, item, subEntity[key].value, value[key]) : value[key];
    }
    return subEntity;
}
