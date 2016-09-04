import {isArray, isObject, mapValues} from "lodash";
import {observable, isObservableArray} from "mobx";

import {Entity, EntityField, EntityList} from "./types";

export interface EntityValue<T> {
    $entity: EntityField | EntityList;
    value: T;
}

export type EntityConfig = {[key: string]:
    {[field: string]: EntityValue<{}>}
    | [{[field: string]: EntityValue<{}>}, string]
    | [{[field: string]: EntityValue<{}>}[], string]
};

export interface EntityStore {
    [key: string]: {[key: string]: EntityValue<{}>} | {[key: string]: EntityValue<{}>}[];
}

type TrueEntityStore = EntityStore & {
    $arrayEntities?: {[key: string]: Entity},
    set?: (config: {}) => void
}

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config L'objet constituant du store, dont chaque propriété doit correspondre à une entité. Les valeurs possibles sont "{}", [{}, "entityName"] ou [[], "entityName"] (pour une liste).
 * @param entityList La liste des toutes les entités utilisées par les propriétés du store (y compris les composées).
 */
export function makeEntityStore<T extends EntityStore>(config: EntityConfig, entityList: Entity[]) {
    const entityMap = entityList.reduce((entities, entity) => {
        entities[entity.name] = entity;
        return entities;
    }, {} as {[name: string]: Entity});

    for (const item in config) {
        const entity = config[item];
        if (!entityMap[isArray(entity) ? entity[1] : item]) {
            throw new Error(`La propriété "${item}" n'a pas été trouvée dans la liste d'entités`);
        }
    }

    const entityStore: TrueEntityStore = {};

    for (const ref in config) {
        entityStore[ref] = buildEntityEntry(entityStore, config, entityMap, ref);
    }

    entityStore.set = fillEntityEntry(entityStore);

    return observable(entityStore) as T & {set: (config: {}) => void};
}

function buildEntityEntry(entityStore: TrueEntityStore, config: EntityConfig, entityMap: {[name: string]: Entity}, ref: string): {[key: string]: EntityValue<{}>} | {}[] {
    const entity = config[ref];
    if (isArray(entity) && isArray(entity[0])) {
        entityStore.$arrayEntities = entityStore.$arrayEntities || {};
        entityStore.$arrayEntities[ref] = entityMap[entity[1]];
        return [];
    }

    const trueRef = isArray(entity) ? entity[1] : ref;
    return mapValues(entityMap[trueRef].fields, (v, key) => {
        if (v.entityName && !entityMap[v.entityName]) {
            throw new Error(`L'entité "${trueRef}"" dépend de l'entité "${v.entityName}"" qui n'a pas été trouvée dans la liste.`);
        }
        return {
            $entity: entityMap[trueRef].fields[key!],
            value: v.entityName ? buildEntityEntry(entityStore, config, entityMap, v.entityName) : undefined
        } as EntityValue<{} >;
    });
}

function fillEntityEntry(entityStore: TrueEntityStore) {
    return (setConfig: {[key: string]: any}) => {
        for (const ref in setConfig) {
            const entity = entityStore[ref];
            if (!entity) {
                throw new Error(`"${ref}" n'existe pas dans ce store.`);
            }
            const entityValue = setConfig[ref];
            if (isArray(entityValue) && isObservableArray(entity)) {
               entity.replace(entityValue.map((item: {}) => buildEntityEntry(entityStore, {}, {[ref]: entityStore.$arrayEntities![ref]}, ref)));
               for (let i = 0; i < entityValue.length; i++) {
                    fillSubEntityEntry(ref, entityStore.$arrayEntities![ref].name, entity[i], entityValue[i]);
               }
            } else if (!isArray(entity)) { // Ce check ne sert à rien c'est juste pour le typage
                for (const item in entityValue) {
                    if (!entity[item]) {
                        throw new Error(`"${ref}" n'a pas de propriété "${item}".`);
                    }
                    entity[item].value = isObject(entityValue[item]) ? fillSubEntityEntry(ref, item, entity[item].value, entityValue[item]) : entityValue[item];
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
