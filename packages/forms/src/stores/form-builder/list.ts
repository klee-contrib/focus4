import {Entity, FormListNode, nodeToFormNode, patchNodeEdit, StoreListNode} from "@focus4/stores";
import {isFunction} from "lodash";
import {disposeOnUnmount} from "mobx-react";

import {clone, FormNodeBuilder} from "./node";

export class FormListNodeBuilder<E extends Entity> {
    /** @internal */
    node: StoreListNode<E>;
    /** @internal */
    sourceNode: StoreListNode<E>;
    /** @internal */
    isEdit: boolean | (() => boolean) = false;

    constructor(node: StoreListNode<E>) {
        this.node = clone(node);
        this.sourceNode = node;
    }

    /**
     * Construit le FormListNode à partir de la configuration renseignée.
     * @param componentClass Le composant (classe) lié au FormListNode, pour disposer la réaction de synchronisation à son démontage.
     */
    build(componentClass: React.Component | null): FormListNode<E> {
        nodeToFormNode(patchNodeEdit(this.node, this.isEdit), this.sourceNode);

        if (componentClass) {
            // @ts-ignore
            disposeOnUnmount(componentClass, this.node.dispose);
        }

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
        return patchNodeEdit(this.node, this.isEdit);
    }
}
