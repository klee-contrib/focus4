import {isArray, isObject, isUndefined, mapValues, omitBy} from "lodash";
import {action, IObservableArray, isAction, isObservableArray, observable} from "mobx";

import {Entity, EntityField, EntityList} from "./types";

/** Fonction `set`. */
export interface Setter<T> {
    set(config: Partial<T>): void;
}

/** Fonction `clear`. */
export interface Clearer {
    clear(): void;
}

/**
 * Noeud de store simple, identifié par la présence des méthodes `set` et `clear`.
 *
 * En pratique, tous les autres éléments d'un `StoreNode` doivent être des `EntityValue`.
 */
export interface StoreNode<T> extends Setter<T>, Clearer {}

/**
 * Noeud de store de liste. C'est un array avec les métadonnées de l'entité du noeud.
 *
 * `T` doit être un `StoreNode` et `StoreListNode` est également considéré comme un `StoreNode`.
 */
export interface StoreListNode<T> extends IObservableArray<T> {
    $entity: Entity;
    set(array: {}[]): void;
}

/** `EntityField` ou `EntityList`. */
export type EntityValue<T> = EntityField<T> | EntityList<T>;
/** Types possible pour le `T` de `EntityField<T>`. */
export type StoreType = undefined | number | number[] | boolean | boolean[] | string | string[] | EntityStoreItem | StoreNode<{}> | StoreListNode<StoreNode<{}>>;

/** Noeud de store simple. Véritable définition de `StoreNode`. */
export type EntityStoreNode = {[key: string]: EntityValue<any /* StoreType */>} & StoreNode<{}>;
/** Noeud de store (simple ou liste). */
export type EntityStoreItem = EntityStoreNode | StoreListNode<EntityStoreNode>;

/** Type du mapping noeud <-> nom d'entité. */
export type EntityMapping<T> = {
    [P in keyof T]?: string;
};

/** Mapping pour convertir les noeuds de listes en listes. */
export type AsStoreListNode<T> = {
    [P in keyof T]: StoreListNode<T[P]>;
};

/** Config du store. */
export interface EntityStoreConfig {
    [key: string]: EntityStoreItem;
}

/** Type du store. */
type EntityStore = EntityStoreConfig & StoreNode<{}>;

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param simpleNodes Un objet dont les propriétés décrivent tous les noeuds "simples" du store.
 * @param listNodes Un objet dont les propriétés décrivent tous les noeuds "listes" du store.
 * @param entityList La liste des toutes les entités utilisées par les noeuds du store (y compris les composées).
 * @param entityMapping Un objet contenant les mappings "nom du noeud": "nom de l'entité", pour spécifier les cas ou les noms sont différents.
 */
export function makeEntityStore<T1 extends {[key: string]: any}, T2 extends {[key: string]: any}>(simpleNodes: T1, listNodes: T2, entityList: Entity[], entityMapping: EntityMapping<T1 & T2> = {} as any): T1 & AsStoreListNode<T2> & StoreNode<{}> {

    // On construit une config unique pour les noeuds simples ({}) et les noeuds de listes ([].)
    const config = {...mapValues(simpleNodes, _ => ({})), ...mapValues(listNodes, _ => [] as any[])} as EntityStoreConfig;

    // On construit une map avec les entités à partir de la liste fournie.
    const entityMap = entityList.reduce((entities, entity) => {
        entities[entity.name] = entity;
        return entities;
    }, {} as {[name: string]: Entity});

    // On vérifie qu'il ne manque pas d'entité.
    for (const entry in config) {
        if (!entityMap[entityMapping[entry as keyof T1 & T2] || entry]) {
            throw new Error(`La propriété "${entry}" n'a pas été trouvée dans la liste d'entités. Vous manque-t'il une correspondance ?`);
        }
    }

    const entityStore: EntityStore = {} as any;

    // On construit chaque entrée à partir de la config.
    for (const entry in config) {
        entityStore[entry] = buildEntityEntry(config, entityMap, entityMapping, entry);
    }

    /*
        Les fonctions `set` et `clear` ne sont pas bindées, ce qui permettra de les copier lorsqu'on voudra faire un ViewModel.
        Tant qu'on appelle bien les fonctions depuis les objets (sans déstructuer par exemple), tout marchera comme prévu.
        Typescript empêchera d'appeler la fonction dans le mauvais contexte de toute façon.
    */

    entityStore.set = action(function set(this: typeof entityStore, setConfig: {[key: string]: any}) {
        for (const entry in setConfig) {
            const entity = this[entry];
            if (!entity) {
                throw new Error(`"${entry}" n'existe pas dans ce store.`);
            }
            setEntityEntry(entity, entityMap, entityMapping, setConfig[entry], entry);
        }
    });

    entityStore.clear = action(function clear(this: typeof entityStore) {
        for (const entry in this) {
            clearEntity(this[entry]);
        }
    });

    return observable(entityStore) as any;
}

/**
 * Construit une entrée de store, potentiellement de façon récursive.
 * @param config La config du store, dans laquelle `entry` se trouve.
 * @param entityMap La map des entités.
 * @param entityMapping Le mapping éventuel entre le nom de l'entrée et l'entité associée.
 * @param entry Le nom de l'entrée.
 */
export function buildEntityEntry<T extends EntityStoreConfig>(config: EntityStoreConfig, entityMap: {[name: string]: Entity}, entityMapping: EntityMapping<T>, entry: string): EntityStoreItem {
    const entity = config[entry]; // {} ou [] selon que l'entrée soit une liste ou pas.
    const trueEntry = entityMapping[entry] || entry; // On récupère le nom de l'entité.

    // Cas d'une entrée de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (isArray(entity)) {
        const outputEntry: StoreListNode<EntityStoreNode> = observable([]) as any;
        outputEntry.$entity = entityMap[trueEntry];
        outputEntry.set = action(function set(this: typeof outputEntry, values: {}[]) { setEntityEntry(this, entityMap, entityMapping, values, trueEntry); });
        return outputEntry;
    }

    // Cas d'une entrée simple : On parcourt tous les champs de l'entité.
    const output: EntityStoreNode & Setter<{}> = mapValues(entityMap[trueEntry].fields, (v, key) => {

        // On vérifie, dans le cas d'un champ composé/liste, que l'entité de ce champ est bien dans la liste.
        if (v.entityName && !entityMap[v.entityName]) {
            throw new Error(`L'entité "${trueEntry}" dépend de l'entité "${v.entityName}" qui n'a pas été trouvée dans la liste.`);
        }
        return {
            // On s'assure que les métadonnées du champ ne soient pas observables.
            $entity: observable.ref(entityMap[trueEntry].fields[key]),

            // On appelle `buildEntityEntry` de façon récursive si c'est un champ composé/liste, sinon on initialise la valeur à undefined.
            value: v.entityName ? buildEntityEntry({[v.entityName]: v.type === "list" ? [] : {}} as EntityStoreConfig, entityMap, entityMapping, v.entityName!) : undefined,
        };
    }) as any;

    // On ajoute les fonctions `set` et `clear` pour terminer.
    output.set = action(function set(this: typeof output, entityValue: any) { setEntityEntry(this, entityMap, entityMapping, entityValue, trueEntry); });
    output.clear = action(function clear(this: typeof output) { clearEntity(this); });

    return output;
}

/**
 * Rempli une entité avec les valeurs fournies, potentiellement de façon récursive.
 * @param entity L'entrée à remplir.
 * @param entityMap La map d'entité.
 * @param entityMapping Le mapping éventuel entre le nom de l'entrée et l'entité associée.
 * @param entityValue La valeur de l'entrée.
 * @param entry Le nom de l'entrée.
 */
function setEntityEntry<T extends EntityStoreConfig>(entity: EntityStoreItem, entityMap: {[name: string]: Entity}, entityMapping: EntityMapping<T>, entityValue: any, entry: string) {

    // Cas du noeud liste.
    if (isArray(entityValue) && isStoreListNode(entity)) {

        // On vide l'array existant et on construit une entrée par valeur de la liste dans l'entrée.
        entity.replace(entityValue.map((_: {}) => buildEntityEntry({[entry]: {}} as EntityStoreConfig, {...entityMap, [entry]: entity.$entity}, entityMapping, entry) as EntityStoreNode));

        // Puis on remplit chaque entrée avec la valeur.
        for (let i = 0; i < entityValue.length; i++) {
            setEntityEntry(entity[i], entityMap, entityMapping, entityValue[i], entity.$entity.name);
        }

    // Cas du noeud simple.
    } else {
        const entity2 = entity as EntityStoreNode;

        // On affecte chaque valeur de l'entrée avec la valeur demandée, et on réappelle `setEntityEntry` si la valeur n'est pas primitive.
        for (const item in entityValue) {
            if (!entity2[item]) {
                throw new Error(`"${entry}" n'a pas de propriété "${item}".`);
            }
            entity2[item].value = isObject(entityValue[item]) && !(isArray(entityValue[item]) && entity2[item].$entity.type === "field") ? setEntityEntry(entity2[item].value as EntityStoreItem, entityMap, entityMapping, entityValue[item], item) : entityValue[item];
        }
    }

    return entity;
}

/**
 * Vide une entrée de store.
 * @param entity L'entrée.
 */
function clearEntity(entity: EntityStoreItem) {
    // Cas de l'entrée liste : On vide simplement la liste.
    if (isObservableArray(entity)) {
        entity.replace([]);
    } else {
        // Cas de l'entrée simple, on parcourt chaque champ.
        for (const entry in entity) {
            const {value} = entity[entry];
            if (isEntityStoreNode(value)) { // Cas noeud de store -> `clearEntity`.
                clearEntity(value);
            } else if (isObservableArray(value)) { // Cas array de primitive -> on vide.
                value.replace([]);
            } else if (value !== undefined) { // Cas primitive -> on met à `undefined`.
                entity[entry].value = undefined;
            }
        }
    }
}

/**
 * Met à plat un noeud de store pour récupèrer sa valeur "brute".
 * @param entityStoreItem Le noeud de store à mettre à plat.
 */
export function toFlatValues<T>(entityStoreItem: StoreListNode<StoreNode<T>>): T[];
export function toFlatValues<T>(entityStoreItem: StoreNode<T>): T;
export function toFlatValues(entityStoreItem: StoreNode<{}> | StoreListNode<StoreNode<{}>>): {} | {}[] {
    // Cas entrée liste : on appelle `toFlatValues` sur chaque élément.
    if (isStoreListNode(entityStoreItem)) {
        return entityStoreItem.map(toFlatValues);
    } else {
        // Cas entrée simple : on parcourt chaque champ et on enlève les valeurs `undefined`.
        return omitBy(mapValues(entityStoreItem, item => {
            const {value} = item;
            if (isStoreListNode(value)) { // Cas entrée liste -> `toFlatValues` sur chaque élément.
                return value.map(toFlatValues);
            } else if (isObservableArray(value)) { // Cas array de primitive -> array simple.
                return value.slice();
            } else if (isEntityStoreNode(value)) { // Cas entrée simple -> `toFlatValues`.
                return toFlatValues(value);
            }
            return value; // Sinon, on renvoie la valeur.
        }), isUndefined);
    }
}

function isStoreListNode(data: StoreType): data is StoreListNode<any> {
    return isObservableArray(data) && !!(data as StoreListNode<any>).$entity;
}
function isEntityStoreNode(data: StoreType): data is EntityStoreNode {
    return !isObservableArray(data) && isObject(data) && !isAction(data);
}
