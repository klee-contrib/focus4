import {mapValues} from "es-toolkit";
import {action, extendObservable, isObservableArray, observable, runInAction} from "mobx";

import {Entity, EntityToPartialType, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "@focus4/entities";

import {FormNodeBuilder, nodeToFormNode} from "../form";
import {
    FormListNode,
    isAnyStoreNode,
    isEntityField,
    isFormListNode,
    isStoreListNode,
    isStoreNode,
    StoreListNode,
    StoreNode
} from "../types";
import {toFlatValues} from "../utils";

/**
 * Crée un StoreListNode à partir d'une définition d'entité.
 * @param entity Un tuple une seule entité (pour différencier la création d'un StoreListNode de celle d'un StoreNode).
 * @param initialData Les données initiales du store.
 */
export function makeStoreNode<E extends Entity>(entity: [E], initialData?: EntityToPartialType<E>[]): StoreListNode<E>;
/**
 * Crée un StoreNode à partir d'une définition d'entité.
 * @param entity L'entité.
 * @param initialData Les données initiales du store.
 */
export function makeStoreNode<E extends Entity>(entity: E, initialData?: EntityToPartialType<E>): StoreNode<E>;
export function makeStoreNode<E extends Entity>(
    entity: E | [E],
    initialData?: EntityToPartialType<E> | EntityToPartialType<E>[]
): StoreListNode<E> | StoreNode<E> {
    // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (Array.isArray(entity)) {
        const storeListNode = observable.array([] as any[], {deep: false}) as StoreListNode<E>;

        // @ts-expect-error - Le champ est readonly dans l'API.
        storeListNode.$entity = entity[0];

        storeListNode.load = defaultLoad;
        storeListNode.getValues = getValues;
        storeListNode.pushNode = action("pushNode", function pushNode(this: typeof storeListNode, ...items: object[]) {
            return this.push(...items.map(item => getNodeForList(this, item)));
        });
        storeListNode.replaceNodes = replaceNode;
        storeListNode.setNodes = setNode;

        if (initialData) {
            storeListNode.setNodes(initialData as EntityToPartialType<E>[]);
        }

        return storeListNode;
    }

    // Cas d'un noeud simple : On parcourt tous les champs de l'entité.
    const storeNode = {
        $entity: entity,
        ...mapValues(entity, e => {
            const entry = e as FieldEntry | ObjectEntry | RecursiveListEntry | ListEntry;
            switch (entry.type) {
                case "list": {
                    const listNode = makeStoreNode([entry.entity]);
                    listNode.$required = entry.isRequired;
                    return listNode;
                }
                case "recursive-list": {
                    const rListNode = makeStoreNode([entity]);
                    rListNode.$required = entry.isRequired;
                    return rListNode;
                }
                case "object": {
                    const node = makeStoreNode(entry.entity);
                    node.$required = entry.isRequired;
                    return node;
                }
                case "field":
                    return extendObservable({$field: entry}, {value: undefined}, {value: observable.ref});
                default: {
                    const node = makeStoreNode(e as Entity);
                    node.$required = true;
                    return node;
                }
            }
        }),
        clear: clearNode,
        getValues,
        load: defaultLoad,
        replace: replaceNode,
        set: setNode
    } as unknown as StoreNode<E>;

    if (initialData) {
        storeNode.set(initialData as EntityToPartialType<E>);
    }

    return storeNode;
}

/**
 * Crée un noeud à ajouter dans un noeud de liste à partir de l'objet à ajouter.
 * @param list Le noeud de liste.
 * @param item L'item à ajouter (classique ou noeud).
 */
export function getNodeForList<E extends Entity>(list: StoreListNode<E>, item: EntityToPartialType<E> | StoreNode<E>) {
    let node: StoreNode<E>;
    if (isFormListNode<E>(list)) {
        let sourceNode;
        if (isStoreNode<E>(item)) {
            sourceNode = item;
        } else {
            sourceNode = makeStoreNode<E>(list.$entity);
            sourceNode.$addedListItem = true;
        }

        node = list.$nodeBuilder ? list.$nodeBuilder(sourceNode) : new FormNodeBuilder(sourceNode).collect();
        nodeToFormNode(node, list as FormListNode<E>);
    } else {
        node = makeStoreNode<E>(list.$entity);
    }
    node.set(item as EntityToPartialType<E>);
    return node;
}

/** `load` par défaut d'un StoreNode : appelle `clear` */
export async function defaultLoad(this: StoreListNode | StoreNode) {
    this.clear();
}

/**
 * Vide un noeud de store.
 */
export function clearNode<E extends Entity>(this: StoreNode<E>): StoreNode<E>;
export function clearNode<E extends Entity>(this: StoreListNode<E>): StoreListNode<E>;
export function clearNode<E extends Entity>(this: StoreListNode<E> | StoreNode<E>) {
    runInAction(() => {
        // Cas du noeud de liste : On vide simplement la liste.
        if (isStoreListNode<E>(this)) {
            this.clear();
        } else {
            // Cas du noeud simple, on parcourt chaque champ.
            for (const key in this) {
                if (key === "sourceNode") {
                    continue; // Pas touche.
                }
                const entryItem = (this as any)[key];
                if (isAnyStoreNode(entryItem)) {
                    // Cas Store(List)Node -> on rappelle `clear`.
                    entryItem.clear();
                } else if (entryItem.value !== undefined) {
                    // Cas primitive -> on met à `undefined`.
                    entryItem.value = undefined;
                }
            }
        }
    });

    return this;
}

/**
 * Wrappe `toFlatValues` pour récupérer les valeurs d'un noeud de store.
 * @param this Le noeud source.
 * @param allowUndefined Si `true`, ne vérifie pas que tous les champs obligatoires sont remplis, et renvoie un type partiel.
 * @param includeAddedFields Si `true`, inclue les champs ajoutés dans le formulaire.
 */
export function getValues(
    this: StoreNode | StoreListNode,
    allowUndefined?: boolean,
    includeAddedFields?: boolean
): any {
    return toFlatValues(this, includeAddedFields, allowUndefined);
}

/**
 * Remplace le noeud par les valeurs fournies, potentiellement de façon récursive.
 * @param this Le noeud à remplacer.
 * @param value La valeur du noeud.
 */
export function replaceNode<E extends Entity>(
    this: StoreNode<E>,
    value: EntityToPartialType<E> | StoreNode<E>
): StoreNode<E>;
export function replaceNode<E extends Entity>(
    this: StoreListNode<E>,
    value: EntityToPartialType<E>[] | StoreListNode<E>
): StoreListNode<E>;
export function replaceNode<E extends Entity>(
    this: StoreListNode<E> | StoreNode<E>,
    value: EntityToPartialType<E> | EntityToPartialType<E>[] | StoreListNode<E> | StoreNode<E>
): StoreListNode<E> | StoreNode<E> {
    runInAction(() => {
        if (isStoreListNode<E>(this) && (Array.isArray(value) || isObservableArray(value))) {
            // On remplace la liste existante par une nouvelle liste de noeuds construit à partir de `value`.
            // oxlint-disable-next-line no-this-assignment no-this-alias
            const self = this;
            this.replace((value as (EntityToPartialType<E> | StoreNode<E>)[]).map(item => getNodeForList(self, item)));
        } else if (isStoreNode(this) && typeof value === "object") {
            // On affecte chaque valeur du noeud avec la valeur demandée, et on réappelle `replaceNode` si la valeur n'est pas primitive.
            for (const entry in this) {
                const item: any = this[entry];
                const valueEntry = (value as any)[entry];
                if (entry === "sourceNode") {
                    // Pas touche
                } else if (isAnyStoreNode(item)) {
                    // Noeud -> on réappelle `replaceNode` ou on vide.
                    if (!valueEntry) {
                        item.clear();
                    } else {
                        replaceNode.call(item as any, valueEntry);
                    }
                } else if (isEntityField(item)) {
                    if (isEntityField(valueEntry)) {
                        item.value = valueEntry.value;
                    } else {
                        item.value = valueEntry ?? undefined;
                    }
                }
            }
        }
    });

    return this;
}

/**
 * Remplit un noeud avec les valeurs fournies, potentiellement de façon récursive.
 * @param node Le noeud à remplir.
 * @param value La valeur du noeud.
 */
export function setNode<E extends Entity>(
    this: StoreNode<E>,
    value: EntityToPartialType<E> | StoreNode<E>
): StoreNode<E>;
export function setNode<E extends Entity>(
    this: StoreListNode<E>,
    value: EntityToPartialType<E>[] | StoreListNode<E>
): StoreListNode<E>;
export function setNode<E extends Entity>(
    this: StoreListNode<E> | StoreNode<E>,
    value: EntityToPartialType<E> | EntityToPartialType<E>[] | StoreListNode<E> | StoreNode<E>
): StoreListNode<E> | StoreNode<E> {
    runInAction(() => {
        if (isStoreListNode<E>(this) && (Array.isArray(value) || isObservableArray(value))) {
            // On va appeler récursivement `setNode` sur tous les éléments de la liste.
            // oxlint-disable-next-line no-this-assignment no-this-alias
            const self = this;
            // oxlint-disable-next-line no-array-for-each
            (value as object[]).forEach((item, i) => {
                if (i >= self.length) {
                    self.pushNode(item);
                }
                self[i].set(item);
            });
        } else if (isStoreNode<E>(this) && typeof value === "object") {
            // On affecte chaque valeur du noeud avec la valeur demandée (si elle existe), et on réappelle `setNode` si la valeur n'est pas primitive.
            for (const item in value as EntityToPartialType<E>) {
                const itemEntry = (this as any)[item];
                const itemValue = (value as any)[item];
                if (itemEntry) {
                    if (isAnyStoreNode(itemEntry)) {
                        setNode.call(itemEntry as any, itemValue);
                    } else if (isEntityField(itemValue)) {
                        if (itemValue.value !== undefined) {
                            itemEntry.value = itemValue.value;
                        }
                    } else if (isEntityField(itemEntry)) {
                        itemEntry.value = itemValue ?? undefined;
                    }
                }
            }
        }
    });

    return this;
}
