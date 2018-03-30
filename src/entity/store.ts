import {isArray, isObject, isUndefined, mapValues, omitBy} from "lodash";
import {action, extendObservable, isComputedProp, isObservableArray, observable} from "mobx";

import {addFormProperties} from "./form/properties";
import {Entity, FieldEntry, FromNode, isStoreListNode, isStoreNode, ListEntry, ObjectEntry, StoreListNode, StoreNode} from "./types";

export type ExtractEntities<T> = {
    [P in keyof T]:
        T[P] extends Entity<infer Q> ? Q
        : T[P] extends Entity<infer Q>[] ? Q[]
        : T[P]
};

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config Un objet dont les propriétés décrivent tous les noeuds du store.
 * @param entityList La liste des toutes les entités utilisées par les noeuds du store (y compris les composées).
 * @param entityMapping Un objet contenant les mappings "nom du noeud": "nom de l'entité", pour spécifier les cas ou les noms sont différents.
 */
export function makeEntityStore<T extends Record<string, Entity | Entity[] | StoreNode>>(config: T): StoreNode<ExtractEntities<T>> & {set(config: FromNode<ExtractEntities<T>>): void} {

    const entityStore: StoreNode<ExtractEntities<T>> & {set(config: FromNode<ExtractEntities<T>>): void} = {} as any;

    // On construit chaque entrée à partir de la config.
    for (const entry in config) {
        const item = config[entry] as Entity | Entity[] | StoreNode;
        if (isStoreNode(item)) {  // On fait passer tels quels les éventuels champs additionnels (ex: store composé).
            entityStore[entry] = item as any;
        } else {
            entityStore[entry] = buildEntityEntry(item as any) as any;
        }
    }

    /*
        Les fonctions `set` et `clear` ne sont pas bindées, ce qui permettra de les copier lorsqu'on voudra faire un FormNode.
        Tant qu'on appelle bien les fonctions depuis les objets (sans déstructurer par exemple), tout marchera comme prévu.
        Typescript empêchera d'appeler la fonction dans le mauvais contexte de toute façon.
    */

    entityStore.set = action("node.set", function set(this: StoreNode<ExtractEntities<T>>, setConfig: any) {
        for (const entry in setConfig) {
            const entity = (this as any)[entry];
            if (!entity) {
                throw new Error(`"${entry}" n'existe pas dans ce store.`);
            }
            setEntityEntry(entity, setConfig[entry]);
        }
    });

    entityStore.clear = action("node.clear", function clear(this: StoreNode<ExtractEntities<T>>) {
        for (const entry in this) {
            clearEntity((this as any)[entry]);
        }
    });

    return entityStore;
}

/**
 * Construit une entrée de store, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildEntityEntry<T>(entity: Entity<T>): StoreNode;
export function buildEntityEntry<T>(entity: Entity<T>[]): StoreListNode;
export function buildEntityEntry<T>(entity: Entity<T> | Entity<T>[]): StoreNode | StoreListNode {

    // Cas d'une entrée de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (isArray(entity)) {
        const outputEntry = observable.shallowArray() as StoreListNode;
        (outputEntry as any).$entity = entity[0];
        outputEntry.pushNode = action("pushNode", function pushNode(this: typeof outputEntry, item: {}) {
            const itemNode = buildEntityEntry(entity[0]);
            if (this.$transform) {
                Object.assign(itemNode, this.$transform(itemNode) || {});
            }
            if (this.$isFormNode) {
                addFormProperties(itemNode, outputEntry);
            }
            itemNode.set(item);
            this.push(itemNode);
        });
        outputEntry.set = action("node.set", function set(this: typeof outputEntry, values: {}[]) { setEntityEntry(this, values); });
        return outputEntry;
    }

    // Cas d'une entrée simple : On parcourt tous les champs de l'entité.
    return {
        ...mapValues(entity.fields, (field: FieldEntry | ObjectEntry | ListEntry) => {
            if (field.type === "list") {
                return buildEntityEntry([field.entity]);
            } else if (field.type === "object") {
                return buildEntityEntry(field.entity);
            } else {
                return extendObservable({$field: field}, {value: undefined}, {value: observable.ref});
            }
        }),
        set: action("node.set", function set(this: StoreNode, entityValue: any) { setEntityEntry(this, entityValue); }),
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
function setEntityEntry<T>(entity: StoreListNode<T>, value: T[]): StoreListNode<T>;
function setEntityEntry<T>(entity: StoreNode<T>, value: T): StoreNode<T>;
function setEntityEntry<T>(entity: StoreNode<T> | StoreListNode<T>, value: T[] | T) {

    // Cas du noeud liste.
    if (isStoreListNode(entity) && isArray(value)) {
        // On vide l'array existant et on construit une entrée par valeur de la liste dans l'entrée.
        entity.replace(value.map((_: {}) => {
            const newNode = buildEntityEntry(entity.$entity);
            if (entity.$transform) {
                Object.assign(newNode, entity.$transform(newNode) || {});
            }
            if (entity.$isFormNode) {
                addFormProperties(newNode, entity);
            }
            return newNode;
        }));

        // Puis on remplit chaque entrée avec la valeur.
        for (let i = 0; i < value.length; i++) {
            setEntityEntry(entity[i], value[i]);
        }

    // Cas du noeud simple.
    } else if (isStoreNode(entity) && isObject(value)) {
        // On affecte chaque valeur de l'entrée avec la valeur demandée, et on réappelle `setEntityEntry` si la valeur n'est pas primitive.
        for (const item in value as any) {
            const itemEntry = (entity as any)[item];
            const itemValue = (value as any)[item];
            if (!itemEntry) {
                throw new Error(`node.set : propriété "${item}" introuvable.`);
            }
            if (isStoreNode(itemEntry)) {
                setEntityEntry(itemEntry, itemValue);
            } else {
                itemEntry.value = itemValue;
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
