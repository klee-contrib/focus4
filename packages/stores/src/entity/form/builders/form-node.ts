import {intersection, isFunction} from "es-toolkit";
import {extendObservable, observable} from "mobx";

import {Entity, FieldEntry, ListEntry, ObjectEntry, RecursiveListEntry} from "@focus4/entities";

import {FormNode, isEntityField, isStoreListNode, isStoreNode, Patch, StoreListNode, StoreNode} from "../../types";
import {nodeToFormNode} from "../node";

import {EntityFieldBuilder} from "./entity-field";
import {FormEntryBuilder} from "./entry";
import {FormListNodeBuilder} from "./form-list-node";

type FieldsOf<E extends Entity> = {[P in keyof E]: E[P] extends FieldEntry ? P : never}[keyof E];
type ObjectsOf<E extends Entity> = {[P in keyof E]: E[P] extends ObjectEntry ? P : never}[keyof E];
type ListsOf<E extends Entity> = {[P in keyof E]: E[P] extends ListEntry | RecursiveListEntry ? P : never}[keyof E];

type EntryToEntity<E> =
    E extends ObjectEntry<infer E1>
        ? E1
        : E extends ListEntry<infer E2>
          ? E2
          : E extends RecursiveListEntry
            ? E
            : never;

const reservedKeys = [
    "clear",
    "replace",
    "set",
    "sourceNode",
    "$added",
    "$addedListItem",
    "$edit",
    "$entity",
    "$form",
    "$required"
];

export class FormNodeBuilder<E extends Entity, E0 extends Entity = E> {
    /** @internal */
    node: StoreNode<E>;

    constructor(node: StoreNode<E>) {
        this.node = node.$form ? node : initFormNode(node);
    }

    /**
     * Ajoute un nouveau champ dans le FormNode.
     * @param name Nom du champ.
     */
    add<FE extends string, NFE extends FieldEntry>(
        name: FE,
        builder: (b: FormEntryBuilder, node: StoreNode<E>) => EntityFieldBuilder<NFE>
    ): FormNodeBuilder<E & {[P in FE]: NFE}, E0>;
    /**
     * Ajoute un nouveau sous-noeud dans le FormNode.
     * @param name Nom du sous-noeud.
     */
    add<FE extends string, NE extends Entity>(
        name: FE,
        builder: (b: FormEntryBuilder, node: StoreNode<E>) => FormNodeBuilder<NE>
    ): FormNodeBuilder<E & {[P in FE]: ObjectEntry<NE>}, E0>;
    /**
     * Ajoute un nouveau sous-noeud liste dans le FormNode.
     * @param name Nom du sous-noeud.
     */
    add<FE extends string, NE extends Entity>(
        name: FE,
        builder: (b: FormEntryBuilder, node: StoreNode<E>) => FormListNodeBuilder<NE>
    ): FormNodeBuilder<E & {[P in FE]: ListEntry<NE>}, E0>;
    add<FE extends string>(name: FE, builder: (b: FormEntryBuilder, node: StoreNode<E>) => any): any {
        // @ts-ignore
        this.node[name] = builder(new FormEntryBuilder(name), this.node).collect();
        // @ts-ignore
        return this;
    }

    /**
     * Construit le FormNode à partir de la configuration renseignée.
     */
    build(): FormNode<E, E0> {
        this.node.$edit ??= false;

        nodeToFormNode(this.node);

        // @ts-ignore
        return this.node;
    }

    /**
     * Initialise l'état d'édition du FormNode.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormNodeBuilder<E, E0>;
    /**
     * Force l'état d'édition du FormNode.
     * @param value Condition d'édition.
     */
    edit(value: (node: StoreNode<E>) => boolean): FormNodeBuilder<E, E0>;
    /**
     * Initialise l'état d'édition de plusieurs champs/noeuds du FormNode.
     * @param value Etat d'édition initial.
     * @param params Les champs.
     */
    edit(value: boolean, ...params: (keyof E)[]): FormNodeBuilder<E, E0>;
    /**
     * Force l'état d'édition de plusieurs champs/noeuds du FormNode.
     * @param value Condition d'édition.
     * @param params Les champs.
     */
    edit(value: (node: StoreNode<E>) => boolean, ...params: (keyof E)[]): FormNodeBuilder<E, E0>;
    edit(value: boolean | ((node: StoreNode<E>) => boolean), ...params: (keyof E)[]): FormNodeBuilder<E, E0> {
        const isEdit = (isFunction(value) ? () => value(this.node) : value) as () => boolean;
        if (!params.length) {
            this.node.$edit = isEdit;
        } else {
            for (const key of params) {
                const child = this.node[key];
                if (isStoreListNode(child)) {
                    // @ts-ignore
                    this.node[key] = new FormListNodeBuilder(child).edit(isEdit).collect();
                } else if (isStoreNode(child)) {
                    // @ts-ignore
                    this.node[key] = new FormNodeBuilder(child).edit(isEdit).collect();
                } else if (isEntityField(child)) {
                    // @ts-ignore
                    this.node[key] = new EntityFieldBuilder(child).edit(isEdit).collect();
                }
            }
        }
        return this;
    }

    /**
     * Modifie un champ du FormNode.
     * @param field Nom du champ.
     * @param builder Configurateur de champ.
     */
    patch<F extends FieldsOf<E>, NFE extends FieldEntry>(
        field: F,
        // @ts-ignore
        builder: (b: EntityFieldBuilder<E[F]>, node: StoreNode<E>) => EntityFieldBuilder<NFE>
    ): FormNodeBuilder<E[F] extends NFE ? E : Patch<E, {[_ in F]: NFE}>, E0>;
    /**
     * Modifie un noeud du FormNode.
     * @param node Nom du noeud.
     * @param builder Configurateur de noeud.
     */
    patch<L extends ListsOf<E>, NE extends Entity>(
        node: L,
        builder: (
            b: FormListNodeBuilder<EntryToEntity<E[L]>>,
            node: StoreNode<E>
        ) => FormListNodeBuilder<NE, EntryToEntity<E[L]>>
    ): FormNodeBuilder<E[L] extends ListEntry<NE> ? E : Patch<E, {[_ in L]: ListEntry<NE>}>, E0>;
    /**
     * Modifie un noeud du FormNode.
     * @param node Nom du noeud.
     * @param builder Configurateur de noeud.
     */
    patch<O extends ObjectsOf<E>, NE extends Entity>(
        node: O,
        builder: (
            b: FormNodeBuilder<EntryToEntity<E[O]>>,
            node: StoreNode<E>
        ) => FormNodeBuilder<NE, EntryToEntity<E[O]>>
    ): FormNodeBuilder<E[O] extends ObjectEntry<NE> ? E : Patch<E, {[_ in O]: ObjectEntry<NE>}>, E0>;
    patch(node: keyof E, builder: (builder: any, node: any) => any): any {
        const child = this.node[node];
        if (isStoreListNode(child)) {
            this.node[node] = builder(new FormListNodeBuilder(child), this.node).collect();
        } else if (isStoreNode(child)) {
            this.node[node] = builder(new FormNodeBuilder(child), this.node).collect();
        } else if (isEntityField(child)) {
            this.node[node] = builder(new EntityFieldBuilder(child), this.node).collect();
        }
        return this;
    }

    /**
     * Patche le noeud courant pour correspondre à l'entité cible en ajoutant les membres qui manquent, retirant les membres en trop, et en modifiant les membres en commun.
     *
     * Les membres en commun ne seront patchés que s'ils sont compatibles (même type de chaque côté, et si c'est un sous-noeud, cela doit être de la même classe). Dans le cas contraire, ces membres seront supprimés et recréés (sans lien avec le noeud source donc).
     * @param targetEntity Entité cible.
     */
    patchAllTo<NE extends Entity>(targetEntity: NE): FormNodeBuilder<NE, E0> {
        // On récupère en premier lieu les noms d'entrée en commun.
        const commonKeys = intersection(Object.keys(this.node), Object.keys(targetEntity)).filter(
            key => !reservedKeys.includes(key)
        );

        // Puis on ne garde que celles pour lesquelles on peut faire la correspondance :
        const realCommonKeys = commonKeys.filter(commonKey => {
            const sourceEntry = this.node[commonKey];
            const targetEntry = targetEntity[commonKey];

            // Pour garder une entrée liste de la source, il faut une entrée liste de la même entité sur la cible.
            if (
                isStoreListNode(sourceEntry) &&
                ((Array.isArray(targetEntry) && targetEntry[0] === sourceEntry.$entity) ||
                    (!Array.isArray(targetEntry) &&
                        targetEntry.type === "list" &&
                        targetEntry.entity === sourceEntry.$entity))
            ) {
                return true;
            }

            if (Array.isArray(targetEntry)) {
                return false;
            }

            // Pour garder une entrée objet de la source, il faut une entrée objet de la même entité sur la cible.
            if (
                isStoreNode(sourceEntry) &&
                (targetEntry === sourceEntry.$entity ||
                    (targetEntry.type === "object" && targetEntry.entity === sourceEntry.$entity))
            ) {
                return true;
            }

            // Pour garder une entrée champ de la source, il faut que l'entrée soit aussi un champ et qu'il n'est pas encore été patché.
            if (isEntityField(sourceEntry) && targetEntry.type === "field" && !("_domain" in sourceEntry)) {
                return true;
            }

            return false;
        }) as (FieldsOf<E> | ObjectsOf<E> | ListsOf<E>)[];

        // On enlève toutes les entrées qu'on ne garde pas.
        this.removeAllBut(...realCommonKeys);

        // Puis on ajoute toutes celles qui manquent.
        for (const targetEntryName in targetEntity) {
            if (!(targetEntryName in this.node)) {
                const targetEntry = targetEntity[targetEntryName];
                if (Array.isArray(targetEntry)) {
                    this.add(targetEntryName, f => f.list(targetEntry[0]));
                } else {
                    switch (targetEntry.type) {
                        case "field":
                            this.add(targetEntryName, f => f.field(targetEntry));
                            break;
                        case "list":
                            this.add(targetEntryName, f => f.list(targetEntry));
                            break;
                        case "recursive-list":
                            this.add(targetEntryName, f => f.list(targetEntity));
                            break;
                        default:
                            this.add(targetEntryName, f => f.object(targetEntry as Entity));
                            break;
                    }
                }
            }
        }

        // Pour chacune des entrées en commun, on met à jour : pour une entrée objet/liste, on remplace le `required`, pour un champ, on écrase la définition.
        for (const commonKey of realCommonKeys) {
            const sourceEntry = this.node[commonKey];
            const targetEntry = targetEntity[commonKey as string as FieldsOf<NE> | ObjectsOf<NE> | ListsOf<NE>];

            if (isStoreListNode(sourceEntry)) {
                sourceEntry.$required = Array.isArray(targetEntry)
                    ? true
                    : ((targetEntry as ListEntry).isRequired ?? true);
            } else if (isStoreNode(sourceEntry) && !Array.isArray(targetEntry)) {
                sourceEntry.$required = targetEntry.type === "object" ? (targetEntry.isRequired ?? true) : true;
            } else if (isEntityField(sourceEntry) && !Array.isArray(targetEntry) && targetEntry.type === "field") {
                (sourceEntry as any).$field = targetEntry;
            }
        }

        // @ts-ignore
        return this;
    }

    /**
     * Supprime les champs demandés du FormNode.
     * @param fields Les champs à supprimer.
     */
    remove<F extends FieldsOf<E> | ListsOf<E> | ObjectsOf<E>>(...fields: F[]): FormNodeBuilder<Omit<E, F>, E0> {
        for (const field of fields) {
            delete this.node[field];
        }
        // @ts-ignore
        return this;
    }

    /**
     * Supprime tous les champs du FormNode, sauf ceux demandés.
     * @param fields Les champs à garder.
     */
    removeAllBut<F extends FieldsOf<E> | ListsOf<E> | ObjectsOf<E>>(...fields: F[]): FormNodeBuilder<Pick<E, F>, E0> {
        for (const key in this.node) {
            if (!fields.includes(key as F) && !reservedKeys.includes(key)) {
                delete this.node[key as F];
            }
        }
        // @ts-ignore
        return this;
    }

    /**
     * Surcharge le caractère obligatoire du noeud.
     * @param value Valeur fixe.
     */
    required(value: boolean): FormNodeBuilder<E, E0>;
    /**
     * Surcharge le caractère obligatoire du noeud.
     * @param value Valeur calculée.
     */
    required(value: (node: StoreNode<E>) => boolean): FormNodeBuilder<E, E0>;
    /**
     * Surcharge le caractère obligatoire de plusieurs champs/noeuds du FormNode.
     * @param value Valeur fixe.
     * @param params Les champs.
     */
    required(value: boolean, ...params: (keyof E)[]): FormNodeBuilder<E, E0>;
    /**
     * Surcharge le caractère obligatoire de plusieurs champs/noeuds du FormNode.
     * @param value Valeur fixe.
     * @param params Les champs.
     */
    required(value: (node: StoreNode<E>) => boolean, ...params: (keyof E)[]): FormNodeBuilder<E, E0>;
    required(value: boolean | ((node: StoreNode<E>) => boolean), ...params: (keyof E)[]): FormNodeBuilder<E, E0> {
        const isRequired = (isFunction(value) ? () => value(this.node) : value) as () => boolean;
        if (!params.length) {
            this.node.$required = isRequired;
        } else {
            for (const key of params) {
                const child = this.node[key];
                if (isStoreListNode(child)) {
                    // @ts-ignore
                    this.node[key] = new FormListNodeBuilder(child).required(isRequired).collect();
                } else if (isStoreNode(child)) {
                    // @ts-ignore
                    this.node[key] = new FormNodeBuilder(child).required(isRequired).collect();
                } else if (isEntityField(child)) {
                    // @ts-ignore
                    this.node[key] = new EntityFieldBuilder(child)
                        .metadata(isFunction(isRequired) ? () => ({isRequired: isRequired()}) : {isRequired})
                        .collect();
                }
            }
        }
        return this;
    }

    /** @internal */
    collect() {
        this.node.$edit ??= true;
        return this.node;
    }
}

export function initFormNode(source: any): any {
    if (isStoreListNode(source)) {
        const res = observable.array<{}>([], {deep: false}) as StoreListNode;

        res.$form = true;
        res.$required = source.$required ?? true;

        // @ts-ignore
        res.$entity = source.$entity;
        res.load = source.load;
        res.pushNode = source.pushNode;
        res.replaceNodes = source.replaceNodes;
        res.setNodes = source.setNodes;

        // @ts-ignore
        res.sourceNode = source;

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            // @ts-ignore
            res[key] = initFormNode((source as any)[key]);
        }

        res.$form = true;
        res.$required = source.$required ?? true;

        // @ts-ignore
        res.sourceNode = source;

        return res;
    } else if (isEntityField(source)) {
        return extendObservable(
            {
                $field: source.$field
            },
            {
                _isEdit: true,
                value: source.$field.defaultValue
            },
            {
                value: observable.ref
            }
        );
    }

    return source;
}
