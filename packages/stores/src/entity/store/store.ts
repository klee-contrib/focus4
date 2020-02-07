import {isArray, isObject, mapValues} from "lodash";
import {action, extendObservable, isComputedProp, isObservableArray, observable} from "mobx";

import {
    Entity,
    EntityToType,
    FieldEntry,
    isAnyStoreNode,
    isEntityField,
    isFormListNode,
    isStoreListNode,
    isStoreNode,
    ListEntry,
    ObjectEntry,
    RecursiveListEntry,
    StoreListNode,
    StoreNode
} from "../types";
import {nodeToFormNode} from "./form";

export type ConfigToEntities<T> = {
    readonly [P in keyof T]: T[P] extends Entity
        ? ObjectEntry<T[P]>
        : T[P] extends Entity[]
        ? ListEntry<T[P][0]>
        : T[P] extends StoreNode<infer E>
        ? ObjectEntry<E>
        : never;
};

/**
 * Construit un store d'entité à partir de la config et les entités données.
 * Le store d'entité inclut les métadonnées pour tous les champs des entités utilsées.
 * @param config Un objet dont les propriétés décrivent tous les noeuds du store.
 */
export function makeEntityStore<C extends Record<string, Entity | Entity[] | StoreNode>>(
    config: C
): StoreNode<ConfigToEntities<C>> {
    const entityStore: StoreNode<ConfigToEntities<C>> = {} as any;

    // On construit chaque noeud à partir de la config.
    for (const key in config) {
        const item = config[key] as Entity | Entity[] | StoreNode;
        if (isStoreNode(item)) {
            entityStore[key] = item as any;
        } else {
            entityStore[key] = buildNode(item as any) as any;
        }
    }

    /*
        Les fonctions `replace`, `set` et `clear` ne sont pas bindées, ce qui permettra de les copier lorsqu'on voudra faire un FormNode.
        Tant qu'on appelle bien les fonctions depuis les objets (sans déstructurer par exemple), tout marchera comme prévu.
        Typescript empêchera d'appeler la fonction dans le mauvais contexte de toute façon.
    */

    entityStore.clear = action("node.clear", function clear(this: StoreNode<ConfigToEntities<C>>) {
        return clearNode(this as any) as any;
    });

    entityStore.replace = action("node.replace", function replace(this: StoreNode<ConfigToEntities<C>>, data: {}) {
        return replaceNode(this as any, data) as any;
    });

    entityStore.set = action("node.set", function set(this: StoreNode<ConfigToEntities<C>>, data: {}) {
        return setNode(this as any, data) as any;
    });

    return entityStore as any;
}

/**
 * Construit un noeud à partir d'une entité, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildNode<E extends Entity>(entity: E): StoreNode<E>;
export function buildNode<E extends Entity>(entity: E[]): StoreListNode<E>;
export function buildNode<E extends Entity>(entity: E | E[]): StoreNode<E> | StoreListNode<E> {
    // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (isArray(entity)) {
        const outputEntry = observable.array([] as any[], {deep: false}) as StoreListNode<E>;

        (outputEntry as any).$entity = entity[0];

        outputEntry.pushNode = action("pushNode", function pushNode(this: typeof outputEntry, ...items: {}[]) {
            return this.push(...items.map(item => getNodeForList(this, item)));
        });

        outputEntry.replaceNodes = action("replaceNodes", function replaceNodes(
            this: typeof outputEntry,
            values: {}[]
        ) {
            return replaceNode(this, values);
        });

        outputEntry.setNodes = action("setNodes", function set(this: typeof outputEntry, values: {}[]) {
            return setNode(this, values);
        });

        return outputEntry;
    }

    // Cas d'un noeud simple : On parcourt tous les champs de l'entité.
    return {
        ...mapValues(entity, (field: FieldEntry | ObjectEntry | ListEntry | RecursiveListEntry) => {
            switch (field.type) {
                case "list":
                    return buildNode([field.entity]);
                case "recursive-list":
                    return buildNode([entity]);
                case "object":
                    return buildNode(field.entity);
                default:
                    return extendObservable({$field: field}, {value: undefined}, {value: observable.ref});
            }
        }),

        clear: action("node.clear", function clear(this: StoreNode<E>) {
            return clearNode(this);
        }),

        replace: action("node.replace", function replace(this: StoreNode<E>, entityValue: any) {
            return replaceNode(this, entityValue);
        }),

        set: action("node.set", function set(this: StoreNode<E>, entityValue: any) {
            return setNode(this, entityValue);
        })
    } as any;
}

/**
 * Vide un noeud de store.
 * @param node Le noeud.
 */
function clearNode<E extends Entity>(node: StoreNode<E>): StoreNode<E>;
function clearNode<E extends Entity>(node: StoreListNode<E>): StoreListNode<E>;
function clearNode<E extends Entity>(node: StoreNode<E> | StoreListNode<E>) {
    // Cas du noeud de liste : On vide simplement la liste.
    if (isStoreListNode(node)) {
        node.clear();
    } else {
        // Cas du noeud simple, on parcourt chaque champ.
        for (const key in node) {
            if (key === "sourceNode") {
                continue; // Pas touche.
            }
            const entryItem = (node as any)[key];
            if (isStoreListNode(entryItem)) {
                // Cas noeud de liste -> on vide la liste.
                entryItem.clear();
            } else if (isStoreNode(entryItem)) {
                // Cas noeud de store -> `clearEntity`.
                clearNode(entryItem);
            } else if (entryItem.value !== undefined && !isComputedProp(entryItem, "value")) {
                // Cas primitive -> on met à `undefined`.
                entryItem.value = undefined;
            }
        }
    }

    return node;
}

/**
 * Remplace le noeud par les valeurs fournies, potentiellement de façon récursive.
 * @param node Le noeud à remplacer.
 * @param value La valeur du noeud.
 */
export function replaceNode<E extends Entity>(node: StoreNode<E>, value: EntityToType<E> | StoreNode<E>): StoreNode<E>;
export function replaceNode<E extends Entity>(
    node: StoreListNode<E>,
    value: EntityToType<E>[] | StoreListNode<E>
): StoreListNode<E>;
export function replaceNode<E extends Entity>(
    node: StoreNode<E> | StoreListNode<E>,
    value: EntityToType<E> | EntityToType<E>[] | StoreNode<E> | StoreListNode<E>
): StoreNode<E> | StoreListNode<E> {
    if (isStoreListNode<E>(node) && (isArray(value) || isObservableArray(value))) {
        // On remplace la liste existante par une nouvelle liste de noeuds construit à partir de `value`.
        node.replace((value as (EntityToType<E> | StoreNode<E>)[]).map(item => getNodeForList(node, item)));
    } else if (isStoreNode(node) && isObject(value)) {
        // On affecte chaque valeur du noeud avec la valeur demandée, et on réappelle `replaceNode` si la valeur n'est pas primitive.
        for (const entry in node) {
            const item = node[entry];
            const valueEntry = (value as any)[entry];
            if (entry === "sourceNode") {
                // Pas touche
            } else if (isAnyStoreNode(item)) {
                // Noeud -> on réappelle `replaceNode` ou on vide.
                if (!valueEntry) {
                    clearNode(item as StoreNode);
                } else {
                    replaceNode(item as any, valueEntry);
                }
            } else if (isEntityField(item) && !isComputedProp(item, "value")) {
                if (isEntityField(valueEntry)) {
                    item.value = valueEntry.value;
                } else {
                    item.value = valueEntry;
                }
            }
        }
    }

    return node;
}

/**
 * Remplit un noeud avec les valeurs fournies, potentiellement de façon récursive.
 * @param node Le noeud à remplir.
 * @param value La valeur du noeud.
 */
export function setNode<E extends Entity>(node: StoreNode<E>, value: EntityToType<E> | StoreNode<E>): StoreNode<E>;
export function setNode<E extends Entity>(
    node: StoreListNode<E>,
    value: EntityToType<E>[] | StoreListNode<E>
): StoreListNode<E>;
export function setNode<E extends Entity>(
    node: StoreNode<E> | StoreListNode<E>,
    value: EntityToType<E> | EntityToType<E>[] | StoreNode<E> | StoreListNode<E>
): StoreNode<E> | StoreListNode<E> {
    if (isStoreListNode<E>(node) && (isArray(value) || isObservableArray(value))) {
        // On va appeler récursivement `setNode` sur tous les éléments de la liste.
        (value as {}[]).forEach((item, i) => {
            if (i >= node.length) {
                node.pushNode(item);
            }
            setNode(node[i], item);
        });
    } else if (isStoreNode(node) && isObject(value)) {
        // On affecte chaque valeur du noeud avec la valeur demandée (si elle existe), et on réappelle `setNode` si la valeur n'est pas primitive.
        for (const item in value) {
            const itemEntry = (node as any)[item];
            const itemValue = (value as any)[item];
            if (!itemEntry) {
                throw new Error(`node.set : propriété "${item}" introuvable.`);
            }
            if (isAnyStoreNode(itemEntry)) {
                setNode(itemEntry as StoreNode, itemValue);
            } else if (isEntityField(itemValue)) {
                itemEntry.value = itemValue.value;
            } else {
                itemEntry.value = itemValue;
            }
        }
    }

    return node;
}

/**
 * Crée un noeud à ajouter dans un noeud de liste à partir de l'objet à ajouter.
 * @param list Le noeud de liste.
 * @param item L'item à ajouter (classique ou noeud).
 */
export function getNodeForList<E extends Entity>(list: StoreListNode<E>, item: EntityToType<E> | StoreNode<E>) {
    let node = buildNode<E>(list.$entity);
    if (list.$nodeBuilder) {
        node = list.$nodeBuilder(node);
    }
    if (isFormListNode(list)) {
        nodeToFormNode<E>(node, isStoreNode<E>(item) ? item : node, list);
    }
    setNode(node, item);
    return node;
}
