import {isArray, isObject, mapValues} from "lodash";
import {action, extendObservable, isComputedProp, isObservableArray, observable} from "mobx";

import {
    BaseStoreNode,
    Entity,
    EntityToType,
    FieldEntry,
    isEntityField,
    isFormListNode,
    isStoreListNode,
    isStoreNode,
    ListEntry,
    NodeToType,
    ObjectEntry,
    StoreListNode,
    StoreNode
} from "../types";
import {nodeToFormNode} from "./form";
import {toFlatValues} from "./util";

/** Récupère les noeuds de store associés aux entités définies dans T. */
export type ExtractEntities<T> = {
    [P in keyof T]: T[P] extends Entity ? StoreNode<T[P]> : T[P] extends Entity[] ? StoreListNode<T[P][0]> : T[P]
};

/** Récupère les types associés aux entités définies dans T. */
export type ExtractTypes<T> = Partial<
    {
        [P in keyof T]: T[P] extends Entity
            ? EntityToType<T[P]>
            : T[P] extends Entity[] ? EntityToType<T[P][0]>[] : NodeToType<T[P]>
    }
>;

/** Définition d'un store d'entité à partir des entités définies dans T. */
export type EntityStore<T> = ExtractEntities<T> & BaseStoreNode<ExtractTypes<T>> & {clear(): void};

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config Un objet dont les propriétés décrivent tous les noeuds du store.
 */
export function makeEntityStore<T extends Record<string, Entity | Entity[] | BaseStoreNode>>(
    config: T
): EntityStore<T> {
    const entityStore: EntityStore<T> = {} as any;

    // On construit chaque entrée à partir de la config.
    for (const entry in config) {
        const item = config[entry] as Entity | Entity[] | BaseStoreNode;
        if (isStoreNode(item)) {
            // On fait passer tels quels les éventuels champs additionnels (ex: store composé).
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

    entityStore.set = action("node.set", function set(this: EntityStore<T>, setConfig: any) {
        for (const entry in setConfig) {
            const entity = (this as any)[entry];
            if (!entity) {
                throw new Error(`"${entry}" n'existe pas dans ce store.`);
            }
            setEntityEntry(entity, setConfig[entry]);
        }
    });

    entityStore.clear = action("node.clear", function clear(this: EntityStore<T>) {
        for (const entry in this) {
            clearEntity((this as any)[entry]);
        }
    });

    return entityStore as any;
}

/**
 * Construit une entrée de store, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildEntityEntry<T extends Entity>(entity: T): StoreNode<T>;
export function buildEntityEntry<T extends Entity>(entity: T[]): StoreListNode<T>;
export function buildEntityEntry<T extends Entity>(entity: T | T[]): StoreNode<T> | StoreListNode<T> {
    // Cas d'une entrée de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (isArray(entity)) {
        const outputEntry = observable.array([] as any[], {deep: false}) as StoreListNode<T>;
        (outputEntry as any).$entity = entity[0];
        outputEntry.pushNode = action("pushNode", function pushNode(this: typeof outputEntry, item: {}) {
            const itemNode = buildEntityEntry(entity[0]);
            if (this.$transform) {
                Object.assign(itemNode, this.$transform(itemNode) || {});
            }
            if (isFormListNode(this)) {
                nodeToFormNode(itemNode, itemNode, outputEntry as any);
            }
            itemNode.set(item);
            this.push(itemNode);
        });
        outputEntry.set = action("node.set", function set(this: typeof outputEntry, values: {}[]) {
            setEntityEntry(this, values);
        });
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
        set: action("node.set", function set(this: StoreNode<T>, entityValue: any) {
            setEntityEntry(this, entityValue);
        }),
        clear: action("node.clear", function clear(this: StoreNode<T>) {
            clearEntity(this);
        })
    } as any;
}

/**
 * Rempli une entité avec les valeurs fournies, potentiellement de façon récursive.
 * @param entity L'entrée à remplir.
 * @param value La valeur de l'entrée.
 */
export function setEntityEntry<T extends Entity>(
    entity: StoreNode<T>,
    value: EntityToType<T> | StoreNode<T>
): StoreNode<T>;
export function setEntityEntry<T extends Entity>(
    entity: StoreListNode<T>,
    value: EntityToType<T>[] | StoreListNode<T>
): StoreListNode<T>;
export function setEntityEntry<T extends Entity>(
    entity: StoreNode<T> | StoreListNode<T>,
    value: EntityToType<T> | EntityToType<T>[] | StoreNode<T> | StoreListNode<T>
): StoreNode<T> | StoreListNode<T> {
    // Cas du noeud liste.
    if (isStoreListNode<T>(entity) && (isArray(value) || isObservableArray(value))) {
        // On vide l'array existant et on construit une entrée par valeur de la liste dans l'entrée.
        entity.replace(
            (value as (EntityToType<T> | StoreNode<T>)[]).map(item => {
                const newNode = buildEntityEntry(entity.$entity);
                if (entity.$transform) {
                    Object.assign(newNode, entity.$transform(newNode) || {});
                }
                if (isFormListNode(entity)) {
                    nodeToFormNode(newNode, isStoreNode(item) ? item : newNode, entity as any);
                }

                if (isStoreNode<T>(item)) {
                    newNode.set(toFlatValues(item));
                } else {
                    newNode.set(item);
                }

                return newNode;
            })
        );

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
            } else if (isEntityField(itemValue)) {
                itemEntry.value = itemValue.value;
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
function clearEntity<T extends Entity>(entity: StoreNode<T>) {
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
            if (isStoreListNode(entryItem)) {
                // Cas noeud de liste -> on vide la liste.
                entryItem.clear();
            } else if (isStoreNode(entryItem)) {
                // Cas noeud de store -> `clearEntity`.
                clearEntity(entryItem as StoreNode);
            } else if (entryItem.value !== undefined && !isComputedProp(entryItem, "value")) {
                // Cas primitive -> on met à `undefined`.
                entryItem.value = undefined;
            }
        }
    }
}
