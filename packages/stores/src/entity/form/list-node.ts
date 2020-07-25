import {isFunction} from "lodash";

import {nodeToFormNode} from "../store";
import {FormListNode, StoreListNode} from "../types";
import {clone, FormNodeBuilder} from "./node";

export class FormListNodeBuilder<E, E0 = E> {
    /** @internal */
    node: StoreListNode<E>;
    /** @internal */
    sourceNode: StoreListNode<E0>;
    /** @internal */
    isEdit?: boolean | (() => boolean);

    constructor(node: StoreListNode<E>) {
        this.node = clone(node);
        this.sourceNode = node as any;
    }

    /**
     * Construit le FormListNode à partir de la configuration renseignée.
     */
    build(): FormListNode<E, E0> {
        this.node.$tempEdit = this.isEdit ?? false;
        nodeToFormNode(this.node, this.sourceNode);

        // @ts-ignore
        return this.node;
    }

    /**
     * Initialise l'état d'édition du FormListNode.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormListNodeBuilder<E, E0>;
    /**
     * Force l'état d'édition du FormListNode.
     * @param value Condition d'édition.
     */
    edit(value: (node: StoreListNode<E>) => boolean): FormListNodeBuilder<E, E0>;
    edit(value: boolean | ((node: StoreListNode<E>) => boolean)): FormListNodeBuilder<E, E0> {
        this.isEdit = isFunction(value) ? () => value(this.node) : value;
        return this;
    }

    /**
     * Modifie les items du FormListNode.
     * @param builder Configurateur de noeud.
     */
    items<NE>(
        builder: (b: FormNodeBuilder<E, E0>, node: StoreListNode<E>) => FormNodeBuilder<NE, E0>
    ): FormListNodeBuilder<NE, E0> {
        // @ts-ignore
        this.node.$nodeBuilder = node => builder(new FormNodeBuilder(node), this.node).collect();
        // @ts-ignore
        return this;
    }

    /** @internal */
    collect() {
        this.node.$tempEdit = this.isEdit ?? true;
        return this.node;
    }
}
