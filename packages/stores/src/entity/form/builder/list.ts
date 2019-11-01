import {isFunction} from "lodash";

import {nodeToFormNode} from "../../store";
import {Entity, FormListNode, StoreListNode} from "../../types";
import {clone, FormNodeBuilder} from "./node";

export class FormListNodeBuilder<E extends Entity> {
    /** @internal */
    node: StoreListNode<E>;
    /** @internal */
    sourceNode: StoreListNode<E>;
    /** @internal */
    isEdit?: boolean | (() => boolean);

    constructor(node: StoreListNode<E>) {
        this.node = clone(node);
        this.sourceNode = node;
    }

    /**
     * Construit le FormListNode à partir de la configuration renseignée.
     */
    build(): FormListNode<E> {
        this.node.$tempEdit = this.isEdit || false;
        nodeToFormNode(this.node, this.sourceNode);

        // @ts-ignore
        return this.node;
    }

    /**
     * Initialise l'état d'édition du FormListNode.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormListNodeBuilder<E>;
    /**
     * Force l'état d'édition du FormListNode.
     * @param value Condition d'édition.
     */
    edit(value: (node: StoreListNode<E>) => boolean): FormListNodeBuilder<E>;
    edit(value: boolean | ((node: StoreListNode<E>) => boolean)): FormListNodeBuilder<E> {
        this.isEdit = isFunction(value) ? () => value(this.node) : value;
        return this;
    }

    /**
     * Modifie les items du FormListNode.
     * @param builder Configurateur de noeud.
     */
    items<NE extends Entity>(
        builder: (b: FormNodeBuilder<E>, node: StoreListNode<E>) => FormNodeBuilder<NE>
    ): FormListNodeBuilder<NE> {
        // @ts-ignore
        this.node.$nodeBuilder = node => builder(new FormNodeBuilder(node), this.node).collect();
        // @ts-ignore
        return this;
    }

    /** @internal */
    collect() {
        this.node.$tempEdit = this.isEdit;
        return this.node;
    }
}
