import {isArray, isObject, isUndefined, mapValues, omitBy} from "lodash";
import {action, asReference, IObservableArray, isAction, isObservableArray, observable} from "mobx";

import {Entity, EntityField, EntityList} from "./types";

export interface Setter<T> {
    set(config: T): void;
}

export interface Clearer {
    clear(): void;
}

export interface StoreNode<T> extends Setter<T>, Clearer {}

export interface StoreListNode<T> extends IObservableArray<T> {
    $entity: Entity;
    set(array: {}[]): void;
}

export type EntityValue<T> = EntityField<T> | EntityList<T>;
export type StoreType = undefined | null | number | number[] | boolean | boolean[] | string | string[] | EntityStoreItem;

export type EntityStoreNode = {[key: string]: EntityValue<StoreType>} & StoreNode<{}>;
export type EntityStoreItem = EntityStoreNode | StoreListNode<EntityStoreNode>;

export type EntityMapping<T> = {
    [P in keyof T]?: string;
};

export type AsStoreListNode<T> = {
    [P in keyof T]: StoreListNode<T[P]>;
};

interface EntityStoreConfig {
    [key: string]: EntityStoreItem;
}

type EntityStore = EntityStoreConfig & StoreNode<{}>;

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param simpleNodes Un objet dont les propriétés décrivent tous les noeuds "simples" du store.
 * @param listNodes Un objet dont les propriétés décrivent tous les noeuds "listes" du store.
 * @param entityList La liste des toutes les entités utilisées par les noeuds du store (y compris les composées).
 * @param entityMapping Un objet contenant les mappings "nom du noeud": "nom de l'entité", pour spécifier les cas ou les noms sont différents.
 */
export function makeEntityStore<T1 extends {[key: string]: any}, T2 extends {[key: string]: any}>(simpleNodes: T1, listNodes: T2, entityList: Entity[], entityMapping: EntityMapping<T1 & T2> = {}): T1 & AsStoreListNode<T2> & StoreNode<{}> {
    const config = Object.assign({}, mapValues(simpleNodes, _ => ({})), mapValues(listNodes, _ => [])) as EntityStoreConfig;

    const entityMap = entityList.reduce((entities, entity) => {
        entities[entity.name] = entity;
        return entities;
    }, {} as {[name: string]: Entity});

    for (const entry in config) {
        if (!entityMap[entityMapping[entry] || entry]) {
            throw new Error(`La propriété "${entry}" n'a pas été trouvée dans la liste d'entités. Vous manque-t'il une correspondance ?`);
        }
    }

    const entityStore: EntityStore = {} as any;

    for (const entry in config) {
        entityStore[entry] = buildEntityEntry(config, entityMap, entityMapping, entry);
    }

    entityStore.set = action(function set(this: typeof entityStore, setConfig: {[key: string]: any}) {
        for (const entry in setConfig) {
            const entity = this[entry];
            if (!entity) {
                throw new Error(`"${entry}" n'existe pas dans ce store.`);
            }
            setEntityEntry(entity, entityMap, entityMapping, setConfig[entry], entry);
        }
    });

    entityStore.clear = asReference(function clear(this: typeof entityStore) {
        for (const entry in this) {
            clearEntity(this[entry]);
        }
    });

    return observable(entityStore) as any;
}

function buildEntityEntry<T extends EntityStoreConfig>(config: EntityStoreConfig, entityMap: {[name: string]: Entity}, entityMapping: EntityMapping<T>, entry: string): EntityStoreItem {
    const entity = config[entry];
    const trueEntry = entityMapping[entry] || entry;

    if (isArray(entity)) {
        const output: StoreListNode<EntityStoreNode> = observable([]) as any;
        output.$entity = entityMap[trueEntry];
        output.set = action(function set(this: typeof output, values: {}[]) { setEntityEntry(this, entityMap, entityMapping, values, trueEntry); });
        return output;
    }

    const output: EntityStoreNode & Setter<{}> = mapValues(entityMap[trueEntry].fields, (v, key) => {
        if (v.entityName && !entityMap[v.entityName]) {
            throw new Error(`L'entité "${trueEntry}" dépend de l'entité "${v.entityName}" qui n'a pas été trouvée dans la liste.`);
        }
        return {
            $entity: asReference(entityMap[trueEntry].fields[key!]),
            value: v.entityName ? buildEntityEntry({[v.entityName]: v.type === "list" ? [] : {}} as EntityStoreConfig, entityMap, entityMapping, v.entityName!) : undefined,
        };
    }) as any;
    output.set = action(function set(this: typeof output, entityValue: any) { setEntityEntry(this, entityMap, entityMapping, entityValue, trueEntry); });
    output.clear = asReference(action(function clear(this: typeof output) { clearEntity(this); }));
    return output;
}

function setEntityEntry<T extends EntityStoreConfig>(entity: EntityStoreItem, entityMap: {[name: string]: Entity}, entityMapping: EntityMapping<T>, entityValue: any, entry: string) {
    if (isArray(entityValue) && isStoreListNode(entity)) {
        entity.replace(entityValue.map((_: {}) => buildEntityEntry({[entry]: {}} as EntityStoreConfig, {...entityMap, [entry]: entity.$entity}, entityMapping, entry) as EntityStoreNode));
        for (let i = 0; i < entityValue.length; i++) {
            setEntityEntry(entity[i], entityMap, entityMapping, entityValue[i], entity.$entity.name);
        }
    } else {
        const entity2 = entity as EntityStoreNode;
        for (const item in entityValue) {
            if (!entity2[item]) {
                throw new Error(`"${entry}" n'a pas de propriété "${item}".`);
            }
            entity2[item].value = isObject(entityValue[item]) && !(isArray(entityValue[item]) && entity2[item].$entity.type === "field") ? setEntityEntry(entity2[item].value as EntityStoreItem, entityMap, entityMapping, entityValue[item], item) : entityValue[item];
        }
    }

    return entity;
}

function clearEntity(entity: EntityStoreItem) {
    if (isObservableArray(entity)) {
        entity.replace([]);
    } else {
        for (const entry in entity) {
            const {value} = entity[entry];
            if (isEntityStoreNode(value)) {
                clearEntity(value);
            } else if (isObservableArray(value)) {
                value.replace([]);
            } else if (value !== undefined) {
                entity[entry].value = undefined;
            }
        }
    }
}

/**
 * Met à plat un noeud de store pour récupèrer sa valeur "brute".
 * @param entityStoreItem Le noeud de store à mettre à plat.
 */
export function toFlatValues(entityStoreItem: StoreNode<{}>): {};
export function toFlatValues(entityStoreItem: EntityStoreItem): {} {
    if (isStoreListNode(entityStoreItem)) {
        return entityStoreItem.map(toFlatValues);
    } else {
        return omitBy(mapValues(entityStoreItem, item => {
            const {value} = item;
            if (isStoreListNode(value)) {
                return value.map(toFlatValues);
            } else if (isObservableArray(value)) {
                return value.slice();
            } else if (isEntityStoreNode(value)) {
                return toFlatValues(value);
            }
            return value;
        }), isUndefined);
    }
}

function isStoreListNode(data: StoreType): data is StoreListNode<any> {
    return isObservableArray(data) && !!data.$entity;
}
function isEntityStoreNode(data: StoreType): data is EntityStoreNode {
    return !isObservableArray(data) && isObject(data) && !isAction(data);
}
