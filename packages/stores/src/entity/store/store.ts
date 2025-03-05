import {mapValues} from "es-toolkit";
import {action, extendObservable, isObservableArray, observable, runInAction} from "mobx";

import {FormNodeBuilder} from "../form";
import {
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
    readonly [P in keyof T]: T[P] extends any[]
        ? ListEntry<T[P][0]>
        : T[P] extends StoreNode<infer E>
        ? ObjectEntry<E>
        : ObjectEntry<T[P]>;
};

/**
 * Construit un store d'entité à partir des définitions d'entités demandées :
 *
 * - Une définition simple (`ProfilReadEntity` par exemple) créera un `StoreNode` pour contenir une instance de l'entité (`ProfilRead`).
 * - Une définition dans un array (`[ProfilReadEntity]` par exemple) créera un `StoreListNode` pour contenir une liste d'instances de l'entité (`ProfilRead[]`).
 *
 * Ces noeuds de store contiendront à la fois les données ainsi que les définitions des entités qui leur correspondent, ce qui permettra d'utiliser les métadonnées
 * des champs et de leurs domaines pour de la consultation et de la saisie.
 *
 * @param config Un objet dont les propriétés décrivent tous les noeuds du store à créer.
 */
export function makeEntityStore<C extends Record<string, any>>(config: C): StoreNode<ConfigToEntities<C>> {
    const entityStore: StoreNode<ConfigToEntities<C>> = {} as any;

    // On construit chaque noeud à partir de la config.
    for (const key in config) {
        const item = config[key];
        if (isStoreNode(item)) {
            entityStore[key] = item as any;
        } else {
            entityStore[key] = buildNode(item) as any;
        }
    }

    /*
     *Les fonctions `replace`, `set` et `clear` ne sont pas bindées, ce qui permettra de les copier lorsqu'on voudra faire un FormNode.
     *Tant qu'on appelle bien les fonctions depuis les objets (sans déstructurer par exemple), tout marchera comme prévu.
     *Typescript empêchera d'appeler la fonction dans le mauvais contexte de toute façon.
     */

    entityStore.clear = clearNode;
    entityStore.load = defaultLoad;
    entityStore.replace = replaceNode;
    entityStore.set = setNode;

    return entityStore;
}

/**
 * Construit un noeud à partir d'une entité, potentiellement de façon récursive.
 * @param entity L'entité de base (dans une liste pour un noeud liste).
 */
export function buildNode<E>(entity: E[]): StoreListNode<E>;
export function buildNode<E>(entity: E): StoreNode<E>;
export function buildNode<E>(entity: E | E[]): StoreListNode<E> | StoreNode<E> {
    // Cas d'un noeud de type liste : on construit une liste observable à laquelle on greffe les métadonnées et la fonction `set`.
    if (Array.isArray(entity)) {
        const outputEntry = observable.array([] as any[], {deep: false}) as StoreListNode<E>;

        // @ts-ignore
        outputEntry.$entity = entity[0];

        outputEntry.load = defaultLoad;
        outputEntry.pushNode = action("pushNode", function pushNode(this: typeof outputEntry, ...items: {}[]) {
            return this.push(...items.map(item => getNodeForList(this, item)));
        });
        outputEntry.replaceNodes = replaceNode;
        outputEntry.setNodes = setNode;

        return outputEntry;
    }

    // Cas d'un noeud simple : On parcourt tous les champs de l'entité.
    return {
        ...mapValues(entity as any, (field: FieldEntry | ListEntry | ObjectEntry | RecursiveListEntry) => {
            switch (field.type) {
                case "list":
                    const listNode = buildNode([field.entity]);
                    listNode.$required = field.isRequired ?? true;
                    return listNode;
                case "recursive-list":
                    const rListNode = buildNode([entity]);
                    rListNode.$required = field.isRequired ?? true;
                    return rListNode;
                case "object":
                    const node = buildNode(field.entity);
                    node.$required = field.isRequired ?? true;
                    return node;
                default:
                    return extendObservable({$field: field}, {value: undefined}, {value: observable.ref});
            }
        }),
        clear: clearNode,
        load: defaultLoad,
        replace: replaceNode,
        set: setNode
    } as any;
}

/**
 * Crée un noeud à ajouter dans un noeud de liste à partir de l'objet à ajouter.
 * @param list Le noeud de liste.
 * @param item L'item à ajouter (classique ou noeud).
 */
export function getNodeForList<E>(list: StoreListNode<E>, item: EntityToType<E> | StoreNode<E>) {
    let node: StoreNode<E>;
    if (isFormListNode<E>(list)) {
        const sourceNode = isStoreNode(item) ? item : buildNode<E>(list.$entity);
        node = list.$nodeBuilder ? list.$nodeBuilder(sourceNode) : new FormNodeBuilder(sourceNode).collect();
        nodeToFormNode(node, list);
    } else {
        node = buildNode<E>(list.$entity);
    }
    node.set(item as EntityToType<E>);
    return node;
}

/** `load` par défaut d'un StoreNode : appelle `clear` */
export async function defaultLoad(this: StoreListNode | StoreNode) {
    this.clear();
}

/**
 * Vide un noeud de store.
 */
export function clearNode<E>(this: StoreNode<E>): StoreNode<E>;
export function clearNode<E>(this: StoreListNode<E>): StoreListNode<E>;
export function clearNode<E>(this: StoreListNode<E> | StoreNode<E>) {
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
 * Remplace le noeud par les valeurs fournies, potentiellement de façon récursive.
 * @param this Le noeud à remplacer.
 * @param value La valeur du noeud.
 */
export function replaceNode<E>(this: StoreNode<E>, value: EntityToType<E> | StoreNode<E>): StoreNode<E>;
export function replaceNode<E>(this: StoreListNode<E>, value: EntityToType<E>[] | StoreListNode<E>): StoreListNode<E>;
export function replaceNode<E>(
    this: StoreListNode<E> | StoreNode<E>,
    value: EntityToType<E> | EntityToType<E>[] | StoreListNode<E> | StoreNode<E>
): StoreListNode<E> | StoreNode<E> {
    runInAction(() => {
        if (isStoreListNode<E>(this) && (Array.isArray(value) || isObservableArray(value))) {
            // On remplace la liste existante par une nouvelle liste de noeuds construit à partir de `value`.
            const self = this;
            this.replace((value as (EntityToType<E> | StoreNode<E>)[]).map(item => getNodeForList(self, item)));
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
                        item.value = valueEntry;
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
export function setNode<E>(this: StoreNode<E>, value: EntityToType<E> | StoreNode<E>): StoreNode<E>;
export function setNode<E>(this: StoreListNode<E>, value: EntityToType<E>[] | StoreListNode<E>): StoreListNode<E>;
export function setNode<E>(
    this: StoreListNode<E> | StoreNode<E>,
    value: EntityToType<E> | EntityToType<E>[] | StoreListNode<E> | StoreNode<E>
): StoreListNode<E> | StoreNode<E> {
    runInAction(() => {
        if (isStoreListNode<E>(this) && (Array.isArray(value) || isObservableArray(value))) {
            // On va appeler récursivement `setNode` sur tous les éléments de la liste.
            const self = this;
            (value as {}[]).forEach((item, i) => {
                if (i >= self.length) {
                    self.pushNode(item);
                }
                self[i].set(item);
            });
        } else if (isStoreNode<E>(this) && typeof value === "object") {
            // On affecte chaque valeur du noeud avec la valeur demandée (si elle existe), et on réappelle `setNode` si la valeur n'est pas primitive.
            for (const item in value as EntityToType<E>) {
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
                        itemEntry.value = itemValue;
                    }
                }
            }
        }
    });

    return this;
}
