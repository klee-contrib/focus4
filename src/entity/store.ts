import {isArray, isObject, mapValues} from "lodash";
import {observable, isObservableArray, IObservableArray} from "mobx";

import {Entity, EntityValue} from "./types";

export interface EntitySetter {
    set: (config: {}) => void;
}

export type EntityArray<T> = IObservableArray<T> & {$entity: Entity};
export function isEntityArray(data: EntityStoreEntry): data is EntityArray<any> & EntitySetter {
    return isObservableArray(data);
}

export type StoreTypes = undefined | null | number | boolean | string | EntityStoreEntry;

export type EntityStoreData = {[key: string]: EntityStoreValue} & EntitySetter;
export type EntityStoreEntry = EntityStoreData | EntityArray<EntityStoreData>;
export type EntityStoreValue = EntityValue<StoreTypes>;

export type EntityStoreConfig = {[key: string]: EntityStoreEntry}
export type EntityConfig = {[key: string]: {[field: string]: EntityValue<{}>} | [{[field: string]: EntityStoreValue}, string] | [{[field: string]: EntityStoreValue}[], string]};
export type EntityStore = EntityStoreConfig & EntitySetter;

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config L'objet constituant du store, dont chaque propriété doit correspondre à une entité. Les valeurs possibles sont "{}", [{}, "entityName"] ou [[], "entityName"] (pour une liste).
 * @param entityList La liste des toutes les entités utilisées par les propriétés du store (y compris les composées).
 */
export function makeEntityStore<T extends EntityStoreConfig>(config: EntityConfig, entityList: Entity[]) {
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

    const entityStore: EntityStore = {} as any;

    for (const ref in config) {
        entityStore[ref] = buildEntityEntry(config, entityMap, ref);
    }

    entityStore.set = (setConfig: {[key: string]: any}) => {
        for (const ref in setConfig) {
            const entity = entityStore[ref];
            if (!entity) {
                throw new Error(`"${ref}" n'existe pas dans ce store.`);
            }
            setEntityEntry(entity, setConfig[ref], ref);
        }
    };

    return observable(entityStore) as T & EntitySetter;
}

function buildEntityEntry(config: EntityConfig, entityMap: {[name: string]: Entity}, ref: string): EntityStoreEntry {
    const entity = config[ref];
    if (isArray(entity) && isArray(entity[0])) {
        const output: EntityArray<EntityStoreData> & EntitySetter = [] as any;
        output.$entity = entityMap[entity[1]];
        output.set = (entityValue: any[]) => setEntityEntry(output, entityValue, ref);
        return output;
    }

    const trueRef = isArray(entity) ? entity[1] : ref;
    const output: EntityStoreData & EntitySetter = mapValues(entityMap[trueRef].fields, (v, key) => {
        if (v.entityName && !entityMap[v.entityName]) {
            throw new Error(`L'entité "${trueRef}"" dépend de l'entité "${v.entityName}"" qui n'a pas été trouvée dans la liste.`);
        }
        return {
            $entity: entityMap[trueRef].fields[key!],
            value: v.entityName ? buildEntityEntry({value: [v.type === "list" ? [] : {}, v.entityName!]}, entityMap, "value") : undefined,
        };
    }) as any;
    output.set = (entityValue: any) => setEntityEntry(output, entityValue, ref);
    return output;
}

function setEntityEntry(entity: EntityStoreEntry, entityValue: any, ref: string) {
    if (isArray(entityValue) && isEntityArray(entity)) {
        entity.replace(entityValue.map((item: {}) => buildEntityEntry({[ref]: [{}, ref]}, {[ref]: entity.$entity}, ref)));
        for (let i = 0; i < entityValue.length; i++) {
            setSubEntityEntry(entity[i], entityValue[i], entity.$entity.name, ref);
        }
    } else {
        const entity2 = entity as EntityStoreData;
        for (const item in entityValue) {
            if (!entity2[item]) {
                throw new Error(`"${ref}" n'a pas de propriété "${item}".`);
            }
            entity2[item].value = isObject(entityValue[item]) ? setSubEntityEntry(entity2[item].value as EntityStoreEntry, entityValue[item], item, ref) : entityValue[item];
        }
    }
}

function setSubEntityEntry(subEntity: {[key: string]: any}, value: {[key: string]: any}, item: string, ref: string) {
    if (!isObject(subEntity)) {
        throw new Error(`La propriété "${item}" de "${ref}" n'est pas un objet.`);
    }

    for (const key in value) {
        if (!subEntity[key]) {
            throw new Error(`La propriété "${key}" de "${item}" n'existe pas.`);
        }
        subEntity[key].value = isObject(value[key]) ? setSubEntityEntry(subEntity[key].value, value[key], item, ref) : value[key];
    }
    return subEntity;
}

/** Met à plat une entité / liste d'entité pour récupèrer sa valeur "brute". */
export function toFlatValues(entityStoreItem: EntityStoreEntry): {} {
    if (isEntityArray(entityStoreItem)) {
        return entityStoreItem.map(toFlatValues);
    } else {
        return mapValues(entityStoreItem, item => {
            if (isObject(item)) {
                return toFlatValues(item.value);
            }
            if (isEntityArray(item)) {
                return item.map(toFlatValues);
            }

            return item.value;
        });
    }
}
