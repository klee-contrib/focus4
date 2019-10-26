import {isFunction} from "lodash";
import {extendObservable, observable} from "mobx";

import {nodeToFormNode, patchNodeEdit} from "../../store";
import {
    Entity,
    FieldEntry,
    FormNode,
    isEntityField,
    isStoreListNode,
    isStoreNode,
    ListEntry,
    ObjectEntry,
    RecursiveListEntry,
    StoreListNode,
    StoreNode
} from "../../types";
import {FormEntityFieldBuilder} from "./field";
import {FormListNodeBuilder} from "./list";

type FieldsOf<E extends Entity> = {
    [P in keyof E["fields"]]: E["fields"][P] extends FieldEntry ? P : never;
}[keyof E["fields"]];
type ObjectsOf<E extends Entity> = {
    [P in keyof E["fields"]]: E["fields"][P] extends ObjectEntry ? P : never;
}[keyof E["fields"]];
type ListsOf<E extends Entity> = {
    [P in keyof E["fields"]]: E["fields"][P] extends ListEntry | RecursiveListEntry ? P : never;
}[keyof E["fields"]];

type EntryToEntity<E> = E extends ObjectEntry<infer E1>
    ? E1
    : E extends ListEntry<infer E2>
    ? E2
    : E extends RecursiveListEntry
    ? E
    : never;

export class FormNodeBuilder<E extends Entity> {
    /** @internal */
    node: StoreNode<E>;
    /** @internal */
    sourceNode: StoreNode<E>;
    /** @internal */
    isEdit: boolean | (() => boolean) = false;

    constructor(node: StoreNode<E>) {
        this.node = clone(node);
        this.sourceNode = node;
    }

    /**
     * Ajoute un champ calculé dans le FormNode.
     * @param name Nom du champ.
     * @param get Getter du champ.
     * @param set Setter du champ.
     */
    add<FE extends string, NFE extends FieldEntry>(
        name: FE,
        builder: (b: FormEntityFieldBuilder<FieldEntry>, node: StoreNode<E>) => FormEntityFieldBuilder<NFE>
    ): FormNodeBuilder<E & {readonly fields: {[P in FE]: NFE}}> {
        // @ts-ignore
        this.node[name] = builder(new FormEntityFieldBuilder(), this.node).collect();
        // @ts-ignore
        return this;
    }

    /**
     * Construit le FormNode à partir de la configuration renseignée.
     */
    build(_: any): FormNode<E> {
        nodeToFormNode(patchNodeEdit(this.node, this.isEdit), this.sourceNode);

        // @ts-ignore
        return this.node;
    }

    /**
     * Initialise l'état d'édition du FormNode.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormNodeBuilder<E>;
    /**
     * Force l'état d'édition du FormNode.
     * @param value Condition d'édition.
     */
    edit(value: (node: StoreNode<E>) => boolean): FormNodeBuilder<E>;
    edit(value: boolean | ((node: StoreNode<E>) => boolean)): FormNodeBuilder<E> {
        this.isEdit = isFunction(value) ? () => value(this.node) : value;
        return this;
    }

    /**
     * Modifie un champ du FormNode.
     * @param field Nom du champ.
     * @param builder Configurateur de champ.
     */
    patch<F extends FieldsOf<E>, NFE extends FieldEntry>(
        field: F,
        builder: (b: FormEntityFieldBuilder<E["fields"][F]>, node: StoreNode<E>) => FormEntityFieldBuilder<NFE>
    ): FormNodeBuilder<{
        readonly name: E["name"];
        readonly fields: Omit<E["fields"], F> & {[_ in F]: NFE};
    }>;
    /**
     * Modifie un noeud du FormNode.
     * @param node Nom du noeud.
     * @param builder Configurateur de noeud.
     */
    patch<L extends ListsOf<E>, NE extends Entity>(
        node: L,
        builder: (b: FormListNodeBuilder<EntryToEntity<E["fields"][L]>>, node: StoreNode<E>) => FormListNodeBuilder<NE>
    ): FormNodeBuilder<{
        readonly name: E["name"];
        readonly fields: Omit<E["fields"], L> & {[_ in L]: ListEntry<NE>};
    }>;
    /**
     * Modifie un noeud du FormNode.
     * @param node Nom du noeud.
     * @param builder Configurateur de noeud.
     */
    patch<O extends ObjectsOf<E>, NE extends Entity>(
        node: O,
        builder: (b: FormNodeBuilder<EntryToEntity<E["fields"][O]>>, node: StoreNode<E>) => FormNodeBuilder<NE>
    ): FormNodeBuilder<{
        readonly name: E["name"];
        readonly fields: Omit<E["fields"], O> & {[_ in O]: ObjectEntry<NE>};
    }>;
    patch(node: keyof E["fields"], builder: Function): any {
        const child = this.node[node];
        if (isStoreListNode(child)) {
            this.node[node] = builder(new FormListNodeBuilder(child), this.node).collect();
        } else if (isStoreNode(child)) {
            this.node[node] = builder(new FormNodeBuilder(child), this.node).collect();
        } else if (isEntityField(child)) {
            this.node[node] = builder(new FormEntityFieldBuilder(child), this.node).collect();
        }
        return this;
    }

    /** @internal */
    collect() {
        return patchNodeEdit(this.node, this.isEdit);
    }
}

export function clone(source: any): any {
    if (isStoreListNode(source)) {
        const res = observable.array<{}>([], {deep: false}) as StoreListNode;

        // @ts-ignore
        res.$entity = source.$entity;
        res.pushNode = source.pushNode;
        res.replaceNodes = source.replaceNodes;
        res.setNodes = source.setNodes;

        return res;
    } else if (isStoreNode(source)) {
        const res: typeof source = {} as any;
        for (const key in source) {
            // @ts-ignore
            res[key] = clone((source as any)[key]);
        }
        return res;
    } else if (isEntityField(source)) {
        return extendObservable(
            {
                $field: source.$field
            },
            {
                value: undefined
            },
            {
                value: observable.ref
            }
        );
    }

    return source;
}
