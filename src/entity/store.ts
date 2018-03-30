import {isArray, isEmpty, isUndefined, mapValues, omitBy} from "lodash";
import {action, extendObservable, isComputedProp, isObservableArray, observable} from "mobx";

import {addFormProperties} from "./form/properties";
import {Entity, EntityField, isFieldEntry, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "./types";
import { FromNode } from "./types/store";

export type EntityStoreItem = EntityField | StoreNode | StoreListNode;

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config Un objet dont les propriétés décrivent tous les noeuds du store.
 * @param entityList La liste des toutes les entités utilisées par les noeuds du store (y compris les composées).
 * @param entityMapping Un objet contenant les mappings "nom du noeud": "nom de l'entité", pour spécifier les cas ou les noms sont différents.
 */
export function makeEntityStore<T>(config: T, entityList: Entity[], entityMapping: {[P in keyof T]?: string} = {}): StoreNode<T> & {set(config: FromNode<T>): void} {

    // On construit une map avec les entités à partir de la liste fournie.
    const entityMap = entityList.reduce((entities, entity) => {
        entities[entity.name] = entity;
        return entities;
    }, {} as {[name: string]: Entity});

    // On vérifie qu'il ne manque pas d'entité.
    for (const entry in config) {
        if (isEmpty(config[entry]) && !entityMap[entityMapping[entry]! || entry]) {
            throw new Error(`La propriété "${entry}" n'a pas été trouvée dans la liste d'entités. Vous manque-t'il une correspondance ?`);
        }
    }

    const entityStore: StoreNode<T> = {} as any;

    // On construit chaque entrée à partir de la config.
    for (const entry in config) {
        if (isEmpty(config[entry])) {
            entityStore[entry] = buildEntityEntry(config, entityMap, entityMapping, entry) as any;
        } else { // On fait passer tels quels les éventuels champs additionnels (ex: store composé).
            entityStore[entry] = config[entry] as any;
        }
    }

    /*
        Les fonctions `set` et `clear` ne sont pas bindées, ce qui permettra de les copier lorsqu'on voudra faire un FormNode.
        Tant qu'on appelle bien les fonctions depuis les objets (sans déstructuer par exemple), tout marchera comme prévu.
        Typescript empêchera d'appeler la fonction dans le mauvais contexte de toute façon.
    */

    entityStore.set = action("node.set", function set(this: StoreNode<T>, setConfig: any) {
        for (const entry in setConfig) {
            const entity = (this as any)[entry];
            if (!entity) {
                throw new Error(`"${entry}" n'existe pas dans ce store.`);
            }
            setEntityEntry(entity, entityMap, entityMapping, setConfig[entry], entry);
        }
    });

    entityStore.clear = action("node.clear", function clear(this: StoreNode<T>) {
        for (const entry in this) {
            clearEntity((this as any)[entry]);
        }
    });

    return entityStore as any;
}

/**
 * Construit une entrée de store, potentiellement de façon récursive.
 * @param config La config du store, dans laquelle `entry` se trouve.
 * @param entityMap La map des entités.
 * @param entityMapping Le mapping éventuel entre le nom de l'entrée et l'entité associée.
 * @param entry Le nom de l'entrée.
 */
export function buildEntityEntry<T>(config: T, entityMap: {[name: string]: Entity}, entityMapping: {[P in keyof T]?: string}, entry: keyof T): EntityStoreItem {
    const entity = config[entry]; // {} ou [] selon que l'entrée soit une liste ou pas.
    const trueEntry = (entityMapping[entry] || entry) as string; // On récupère le nom de l'entité.

    // Cas d'une entrée de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (isArray(entity)) {
        const outputEntry: StoreListNode = observable.shallowArray() as any;
        (outputEntry as any).$entity = entityMap[trueEntry];
        outputEntry.pushNode = action("pushNode", function pushNode(this: typeof outputEntry, item: {}) {
            const itemNode = buildEntityEntry({[trueEntry]: {}}, {...entityMap, item: this.$entity}, entityMapping, trueEntry) as StoreNode;
            if (this.$transform) {
                Object.assign(itemNode, this.$transform(itemNode) || {});
            }
            if (this.$isFormNode) {
                addFormProperties(itemNode, outputEntry);
            }
            itemNode.set(item);
            this.push(itemNode);
        });
        outputEntry.set = action("node.set", function set(this: typeof outputEntry, values: {}[]) { setEntityEntry(this, entityMap, entityMapping, values, trueEntry); });
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
                return buildEntityEntry({[v.entityName]: v.type === "list" ? [] : {}}, entityMap, entityMapping, v.entityName);
            }

            // On s'assure que les métadonnées du champ ne soient pas observables.
            return extendObservable({
                $field: entityMap[trueEntry].fields[key]
            }, {
                value: undefined
            }, {
                value: observable.ref
            });
        }),
        set: action("node.set", function set(this: StoreNode, entityValue: any) { setEntityEntry(this, entityMap, entityMapping, entityValue, trueEntry); }),
        clear: action("node.clear", function clear(this: StoreNode) { clearEntity(this); })
    };
}

/**
 * Rempli une entité avec les valeurs fournies, potentiellement de façon récursive.
 * @param entity L'entrée à remplir.
 * @param entityMap La map d'entité.
 * @param entityMapping Le mapping éventuel entre le nom de l'entrée et l'entité associée.
 * @param entityValue La valeur de l'entrée.
 * @param entry Le nom de l'entrée.
 */
function setEntityEntry<T>(entity: StoreNode, entityMap: {[name: string]: Entity}, entityMapping: {[P in keyof T]?: string}, entityValue: any, entry: string) {

    // Cas du noeud liste.
    if (isStoreListNode(entity)) {
        if (isArray(entityValue)) {
            // On vide l'array existant et on construit une entrée par valeur de la liste dans l'entrée.
            entity.replace(entityValue.map((_: {}) => {
                const newNode = buildEntityEntry({[entry]: {}}, {...entityMap, [entry]: entity.$entity}, entityMapping, entry) as StoreNode;
                if (entity.$transform) {
                    Object.assign(newNode, entity.$transform(newNode) || {});
                }
                if (entity.$isFormNode) {
                    addFormProperties(newNode, entity);
                }
                return newNode;
            }));

            // Puis on remplit chaque entrée avec la valeur.
            for (let i = 0; i < entityValue.length; i++) {
                setEntityEntry(entity[i], entityMap, entityMapping, entityValue[i], entity.$entity.name);
            }
        }

    // Cas du noeud simple.
    } else {
        // On affecte chaque valeur de l'entrée avec la valeur demandée, et on réappelle `setEntityEntry` si la valeur n'est pas primitive.
        for (const item in entityValue) {
            const itemEntry = (entity as any)[item];
            if (!itemEntry) {
                throw new Error(`"${entry}" n'a pas de propriété "${item}".`);
            }
            if (isStoreNode(itemEntry)) {
                setEntityEntry(itemEntry, entityMap, entityMapping, entityValue[item], item);
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
function clearEntity(entity: StoreNode) {
    // Cas de l'entrée liste : On vide simplement la liste.
    if (isStoreListNode(entity)) {
        entity.replace([]);
    } else {
        // Cas de l'entrée simple, on parcourt chaque champ.
        for (const entry in entity) {
            if (entry === "sourceNode") {
                continue; // Pas touche.
            }
            const entryItem = (entity as any)[entry];
            if (isStoreListNode(entryItem)) { // Cas noeud de liste -> on vide la liste.
                entryItem.clear();
            } else if (isStoreNode(entryItem)) { // Cas noeud de store -> `clearEntity`.
                clearEntity(entryItem as StoreNode);
            } else if (entryItem.value !== undefined && !isComputedProp(entryItem, "value")) { // Cas primitive -> on met à `undefined`.
                entryItem.value = undefined;
            }
        }
    }
}

/**
 * Met à plat un noeud de store pour récupèrer sa valeur "brute".
 * @param entityStoreItem Le noeud de store à mettre à plat.
 */
export function toFlatValues<T>(storeNode: T): FromNode<T> {
    // Cas entrée liste : on appelle `toFlatValues` sur chaque élément.
    if (isStoreListNode(storeNode)) {
        return storeNode.map(toFlatValues) as any;
    } else {
        // Cas entrée simple : on parcourt chaque champ et on enlève les valeurs `undefined`.
        return omitBy(mapValues(storeNode, (item, entry) => {
            if (entry === "sourceNode") { // On ne récupère pas le `sourceNode` d'un FormNode.
                return undefined;
            } else if (isStoreListNode(item)) { // Cas entrée liste -> `toFlatValues` sur chaque élément.
                return item.map(toFlatValues);
            } else if (isStoreNode(item)) { // Cas entrée simple -> `toFlatValues`.
                return toFlatValues(item);
            } else if (isObservableArray(item.value)) { // Cas array de primitive -> array simple.
                return item.value.slice();
            } else if (!isComputedProp(item, "value")) { // Cas `EntityField` simple.
                return item.value;
            } else {
                return undefined; // Cas champ calculé : on le retire.
            }
        }), isUndefined) as any;
    }
}
