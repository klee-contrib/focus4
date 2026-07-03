import {isFunction} from "es-toolkit";

import {Entity} from "@focus4/entities";

import {FormListNode, StoreListNode} from "../../types";
import {nodeToFormNode} from "../node";

import {FormNodeBuilder, initFormNode} from "./form-node";

export class FormListNodeBuilder<E extends Entity, E0 extends Entity = E, R extends boolean = boolean> {
    /** @internal */
    node: StoreListNode<E>;

    constructor(node: StoreListNode<E>) {
        this.node = node.$form ? node : initFormNode(node);
    }

    /**
     * Construit le FormListNode à partir de la configuration renseignée.
     */
    build(): FormListNode<E, E0> {
        this.node.$edit ??= false;

        nodeToFormNode(this.node);

        // @ts-expect-error - Impossible de vérifier le type générique.
        return this.node;
    }

    /**
     * Initialise l'état d'édition du FormListNode.
     * @param value Etat d'édition initial.
     */
    edit(value: boolean): FormListNodeBuilder<E, E0, R>;
    /**
     * Force l'état d'édition du FormListNode.
     * @param value Condition d'édition.
     */
    edit(value: (node: StoreListNode<E>) => boolean): FormListNodeBuilder<E, E0, R>;
    edit(value: boolean | ((node: StoreListNode<E>) => boolean)): FormListNodeBuilder<E, E0, R> {
        this.node.$edit = (isFunction(value) ? () => value(this.node) : value) as () => boolean;
        return this;
    }

    /**
     * Modifie les items du FormListNode.
     * @param builder Configurateur de noeud.
     */
    items<NE extends Entity>(
        builder: (b: FormNodeBuilder<E, E0, true>, node: StoreListNode<E>) => FormNodeBuilder<NE, E0, true>
    ): FormListNodeBuilder<NE, E0, R> {
        // @ts-expect-error - Impossible de vérifier le type générique.
        this.node.$nodeBuilder = node => builder(new FormNodeBuilder(node), this.node).collect();
        // @ts-expect-error - Impossible de vérifier le type générique.
        return this;
    }

    /**
     * Surcharge le caractère obligatoire du noeud.
     * @param value Valeur fixe.
     */
    required<NR extends boolean>(value: NR): FormListNodeBuilder<E, E0, NR>;
    /**
     * Surcharge le caractère obligatoire du noeud.
     * @param value Valeur calculée.
     */
    required(value: (node: StoreListNode<E>) => boolean): FormListNodeBuilder<E, E0, false>;
    required(value: boolean | ((node: StoreListNode<E>) => boolean)): FormListNodeBuilder<E, E0, false> {
        this.node.$required = (isFunction(value) ? () => value(this.node) : value) as () => boolean;
        return this;
    }

    /** @internal */
    collect() {
        this.node.$edit ??= true;
        return this.node;
    }
}
