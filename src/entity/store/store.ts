import {isArray, isObject, mapValues} from "lodash";
import {action, extendObservable, isComputedProp, isObservableArray, observable} from "mobx";

import {
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
export type EntityStore<T = any> = ExtractEntities<T> & {clear(): void; set(data: ExtractTypes<T>): void};

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config Un objet dont les propriétés décrivent tous les noeuds du store.
 */
export function makeEntityStore<T extends Record<string, Entity | Entity[] | EntityStore>>(config: T): EntityStore<T> {
    const entityStore: EntityStore<T> = {} as any;

    // On construit chaque noeud à partir de la config.
    for (const key in config) {
        const item = config[key] as Entity | Entity[] | EntityStore;
        if (isStoreNode(item)) {
            // On fait passer tels quels les éventuels champs additionnels (ex: store composé).
            entityStore[key] = item as any;
        } else {
            entityStore[key] = buildNode(item as any) as any;
        }
    }

    /*
        Les fonctions `set` et `clear` ne sont pas bindées, ce qui permettra de les copier lorsqu'on voudra faire un FormNode.
        Tant qu'on appelle bien les fonctions depuis les objets (sans déstructurer par exemple), tout marchera comme prévu.
        Typescript empêchera d'appeler la fonction dans le mauvais contexte de toute façon.
    */

    entityStore.set = action("node.set", function set(this: EntityStore<T>, data: {}) {
        setNode(this as StoreNode, data);
    });

    entityStore.clear = action("node.clear", function clear(this: EntityStore<T>) {
        clearNode(this as StoreNode);
    });

    return entityStore as any;
}

/**
 * Construit un noeud à partir d'une entité, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildNode<T extends Entity>(entity: T): StoreNode<T>;
export function buildNode<T extends Entity>(entity: T[]): StoreListNode<T>;
export function buildNode<T extends Entity>(entity: T | T[]): StoreNode<T> | StoreListNode<T> {
    // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (isArray(entity)) {
        const outputEntry = observable.array([] as any[], {deep: false}) as StoreListNode<T>;
        (outputEntry as any).$entity = entity[0];
        outputEntry.pushNode = action("pushNode", function pushNode(this: typeof outputEntry, item: {}) {
            this.push(getNodeForList(this, item));
        });
        outputEntry.set = action("node.set", function set(this: typeof outputEntry, values: {}[]) {
            setNode(this, values);
        });
        return outputEntry;
    }

    // Cas d'un noeud simple : On parcourt tous les champs de l'entité.
    return {
        ...mapValues(entity.fields, (field: FieldEntry | ObjectEntry | ListEntry) => {
            if (field.type === "list") {
                return buildNode([field.entity]);
            } else if (field.type === "object") {
                return buildNode(field.entity);
            } else {
                return extendObservable({$field: field}, {value: undefined}, {value: observable.ref});
            }
        }),
        set: action("node.set", function set(this: StoreNode<T>, entityValue: any) {
            setNode(this, entityValue);
        }),
        clear: action("node.clear", function clear(this: StoreNode<T>) {
            clearNode(this);
        })
    } as any;
}

/**
 * Remplit un noeud avec les valeurs fournies, potentiellement de façon récursive.
 * @param node Le noeud à remplir.
 * @param value La valeur du noeud.
 */
export function setNode<T extends Entity>(node: StoreNode<T>, value: EntityToType<T> | StoreNode<T>): StoreNode<T>;
export function setNode<T extends Entity>(
    entity: StoreListNode<T>,
    value: EntityToType<T>[] | StoreListNode<T>
): StoreListNode<T>;
export function setNode<T extends Entity>(
    entity: StoreNode<T> | StoreListNode<T>,
    value: EntityToType<T> | EntityToType<T>[] | StoreNode<T> | StoreListNode<T>
): StoreNode<T> | StoreListNode<T> {
    if (isStoreListNode<T>(entity) && (isArray(value) || isObservableArray(value))) {
        // On remplace la liste existante par une nouvelle liste de noeuds construit à partir de `value`.
        entity.replace((value as (EntityToType<T> | StoreNode<T>)[]).map(item => getNodeForList(entity, item)));
    } else if (isStoreNode(entity) && isObject(value)) {
        // On affecte chaque valeur du noeud avec la valeur demandée, et on réappelle `setNode` si la valeur n'est pas primitive.
        for (const item in value) {
            const itemEntry = (entity as any)[item];
            const itemValue = (value as any)[item];
            if (!itemEntry) {
                throw new Error(`node.set : propriété "${item}" introuvable.`);
            }
            if (isStoreNode(itemEntry)) {
                setNode(itemEntry, itemValue);
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
 * Vide un noeud de store.
 * @param entity Le noeud.
 */
function clearNode<T extends Entity>(entity: StoreNode<T>) {
    // Cas du noeud de liste : On vide simplement la liste.
    if (isStoreListNode(entity)) {
        entity.replace([]);
    } else {
        // Cas du noeud simple, on parcourt chaque champ.
        for (const key in entity) {
            if (key === "sourceNode") {
                continue; // Pas touche.
            }
            const entryItem = (entity as any)[key];
            if (isStoreListNode(entryItem)) {
                // Cas noeud de liste -> on vide la liste.
                entryItem.clear();
            } else if (isStoreNode(entryItem)) {
                // Cas noeud de store -> `clearEntity`.
                clearNode(entryItem as StoreNode);
            } else if (entryItem.value !== undefined && !isComputedProp(entryItem, "value")) {
                // Cas primitive -> on met à `undefined`.
                entryItem.value = undefined;
            }
        }
    }
}

/**
 * Crée un noeud à ajouter dans un noeud de liste à partir de l'objet à ajouter.
 * @param list Le noeud de liste.
 * @param item L'item à ajouter (classique ou noeud).
 */
function getNodeForList<T extends Entity>(list: StoreListNode<T>, item: EntityToType<T> | StoreNode<T>) {
    const node = buildNode<T>(list.$entity);
    if (list.$transform) {
        Object.assign(node, list.$transform(node) || {});
    }
    if (isFormListNode(list)) {
        nodeToFormNode<T>(node, isStoreNode<T>(item) ? item : node, list);
    }
    if (isStoreNode<T>(item)) {
        node.set(toFlatValues(item));
    } else {
        node.set(item);
    }

    return node;
}
