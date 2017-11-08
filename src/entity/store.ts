import {isArray, isUndefined, mapValues, omitBy} from "lodash";
import {action, IObservableArray, isObservableArray, observable} from "mobx";

import { Entity, EntityField, FieldEntry, ListEntry, ObjectEntry } from "./types";

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
export interface StoreNode<T = {}> extends Setter<T>, Clearer {}

/**
 * Noeud de store de liste. C'est un array avec les métadonnées de l'entité du noeud.
 *
 * `T` doit être un `StoreNode` et `StoreListNode` est également considéré comme un `StoreNode`.
 */
export interface StoreListNode<T extends StoreNode = StoreNode> extends IObservableArray<T> {
    $entity: Entity;
    set(array: {}[]): void;
}

/** Types possible pour le `T` de `EntityField<T>`. */
export type StoreType = number | number[] | boolean | boolean[] | string | string[];

export type EntityStoreNodeItem = EntityField<StoreType> | StoreNode | StoreListNode;
/** Noeud de store simple. Véritable définition de `StoreNode`. */
export type EntityStoreNode = StoreNode & {
    [key: string]: EntityStoreNodeItem;
};

/** Noeud de store (simple ou liste). */
export type EntityStoreItem = EntityStoreNode | StoreListNode<EntityStoreNode>;

/** Type du mapping noeud <-> nom d'entité. */
export type EntityMapping<T> = {
    [P in keyof T]?: string;
};

/** Mapping pour convertir les noeuds de listes en listes. */
export type AsStoreListNode<T extends {[key: string]: StoreNode}> = {
    [P in keyof T]: StoreListNode<T[P]>;
};

/** Config du store. */
export interface EntityStoreConfig {
    [key: string]: EntityStoreItem;
}

/** Type du store. */
type EntityStore = EntityStoreConfig & StoreNode<EntityStoreConfig>;

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param simpleNodes Un objet dont les propriétés décrivent tous les noeuds "simples" du store.
 * @param listNodes Un objet dont les propriétés décrivent tous les noeuds "listes" du store.
 * @param entityList La liste des toutes les entités utilisées par les noeuds du store (y compris les composées).
 * @param entityMapping Un objet contenant les mappings "nom du noeud": "nom de l'entité", pour spécifier les cas ou les noms sont différents.
 */
export function makeEntityStore<T1 extends {[key: string]: StoreNode}, T2 extends {[key: string]: StoreNode}>(simpleNodes: T1, listNodes: T2, entityList: Entity[], entityMapping: EntityMapping<T1 & T2> = {} as any): T1 & AsStoreListNode<T2> & StoreNode {

    // On construit une config unique pour les noeuds simples ({}) et les noeuds de listes ([].)
    const config = {...mapValues(simpleNodes, _ => ({})) as any, ...mapValues(listNodes, _ => [] as any[]) as any} as EntityStoreConfig;

    // On construit une map avec les entités à partir de la liste fournie.
    const entityMap = entityList.reduce((entities, entity) => {
        entities[entity.name] = entity;
        return entities;
    }, {} as {[name: string]: Entity});

    // On vérifie qu'il ne manque pas d'entité.
    for (const entry in config) {
        if (!entityMap[entityMapping[entry as keyof T1 & T2] as string || entry]) {
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
    return {
        ...mapValues(entityMap[trueEntry].fields, (v, key) => {
            // Cas d'un champ composé ou liste.
            if (!isFieldEntry(v)) {
                // On vérifie que l'entité de ce champ est bien dans la liste.
                if (v.entityName && !entityMap[v.entityName]) {
                    throw new Error(`L'entité "${trueEntry}" dépend de l'entité "${v.entityName}" qui n'a pas été trouvée dans la liste.`);
                }
                // Et on construit le champ de manière récursive.
                return buildEntityEntry({[v.entityName]: v.type === "list" ? [] : {}} as EntityStoreConfig, entityMap, entityMapping, v.entityName);
            }

            // On s'assure que les métadonnées du champ ne soient pas observables.
            return {
                $entity: observable.ref(entityMap[trueEntry].fields[key]),
                value: undefined
            };
        }),
        set: action(function set(this: EntityStoreNode, entityValue: any) { setEntityEntry(this, entityMap, entityMapping, entityValue, trueEntry); }),
        clear: action(function clear(this: EntityStoreNode) { clearEntity(this); })
    } as any as EntityStoreNode;
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
    if (isStoreListNode(entity)) {
        if (isArray(entityValue)) {
            // On vide l'array existant et on construit une entrée par valeur de la liste dans l'entrée.
            entity.replace(entityValue.map((_: {}) => buildEntityEntry({[entry]: {}} as EntityStoreConfig, {...entityMap, [entry]: entity.$entity}, entityMapping, entry) as EntityStoreNode));

            // Puis on remplit chaque entrée avec la valeur.
            for (let i = 0; i < entityValue.length; i++) {
                setEntityEntry(entity[i], entityMap, entityMapping, entityValue[i], entity.$entity.name);
            }
        }

    // Cas du noeud simple.
    } else {
        // On affecte chaque valeur de l'entrée avec la valeur demandée, et on réappelle `setEntityEntry` si la valeur n'est pas primitive.
        for (const item in entityValue) {
            const itemEntry = entity[item];
            if (!itemEntry) {
                throw new Error(`"${entry}" n'a pas de propriété "${item}".`);
            }
            if (isStoreNode(itemEntry)) {
                setEntityEntry(itemEntry as EntityStoreItem, entityMap, entityMapping, entityValue[item], item);
            } else {
                itemEntry.value = entityValue[item];
            }
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
    if (isStoreListNode(entity)) {
        entity.replace([]);
    } else {
        // Cas de l'entrée simple, on parcourt chaque champ.
        for (const entry in entity) {
            const entryItem = entity[entry];
            if (isStoreListNode(entryItem)) { // Cas noeud de liste -> on vide la liste.
                entryItem.clear();
            } else if (isStoreNode(entryItem)) { // Cas noeud de store -> `clearEntity`.
                clearEntity(entryItem as EntityStoreNode);
            } else if (entryItem.value !== undefined) { // Cas primitive -> on met à `undefined`.
                entryItem.value = undefined;
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
export function toFlatValues(entityStoreItem: StoreNode | StoreListNode): {} | {}[] {
    // Cas entrée liste : on appelle `toFlatValues` sur chaque élément.
    if (isStoreListNode(entityStoreItem)) {
        return entityStoreItem.map(toFlatValues);
    } else {
        // Cas entrée simple : on parcourt chaque champ et on enlève les valeurs `undefined`.
        return omitBy(mapValues(entityStoreItem, (item: EntityStoreNodeItem) => {
            if (isStoreListNode(item)) { // Cas entrée liste -> `toFlatValues` sur chaque élément.
                return item.map(toFlatValues);
            } else if (isStoreNode(item)) { // Cas entrée simple -> `toFlatValues`.
                return toFlatValues(item);
            } else if (isObservableArray(item.value)) { // Cas array de primitive -> array simple.
                return item.value.slice();
            } else {
                return item.value; // Sinon, on renvoie la valeur.
            }
        }), isUndefined);
    }
}

function isStoreListNode(data: EntityStoreNodeItem): data is StoreListNode {
    return isObservableArray(data) && !!(data as StoreListNode).$entity;
}
function isStoreNode(data: EntityStoreNodeItem): data is StoreNode {
    return !!(data as StoreNode).set;
}
function isFieldEntry(data: FieldEntry | ObjectEntry | ListEntry): data is FieldEntry {
    return !!(data as FieldEntry).name;
}
