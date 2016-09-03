import {isArray, mapValues} from "lodash";
import {observable} from "mobx";

import {Entity, EntityField} from "./types";

export interface EntityValue<T> {
    $field?: EntityField;
    value: T;
}

export type EntityConfig = {[key: string]: {[field: string]: EntityValue<{}>} | [{[field: string]: EntityValue<{}>}, string]};

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclus les métadonnées pour tous les champs des entités utilsées.
 * @param config L'objet constituant du store, dont chaque propriété doit correspondre à une entité. Les valeurs possibles sont "{}", [{}, "entityName"] ou [[], "entityName"] (pour une liste).
 * @param entityList La liste des toutes les entités utilisées par les propriétés du store (y compris les composées).
 */
export function makeEntityStore<T extends EntityConfig>(config: EntityConfig, entityList: Entity[]): T {
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
        entityStore[`${ref}`] = buildEntityEntry(config, entityMap, ref);
    }

    return observable(entityStore) as any as T;
}

function buildEntityEntry(config: EntityConfig, entityMap: {[name: string]: Entity}, ref: string): {[key: string]: EntityValue<any>} | any[] {
    if (isArray(config[ref]) && isArray((config[ref] as any[])[0])) {
        return [];
    }

    const trueRef = isArray(config[ref]) ? (config[ref] as any[])[1] : ref;
    return mapValues(entityMap[trueRef].fields, (v, key) => {
        if (v.entityName && !entityMap[v.entityName]) {
            throw new Error(`L'entité "${trueRef}"" dépend de l'entité "${v.entityName}"" qui n'a pas été trouvée dans la liste.`);
        }
        return  {
            $field: entityMap[trueRef].fields[key!],
            value: v.entityName && buildEntityEntry(config, entityMap, v.entityName)
        };
    });
}
