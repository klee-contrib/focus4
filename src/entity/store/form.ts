import {isBoolean, isEqual, isFunction, toPairs} from "lodash";
import {action, extendObservable, IArrayChange, IArraySplice, intercept, observable, observe} from "mobx";

import {
    Entity,
    EntityField,
    FormEntityField,
    FormListNode,
    FormNode,
    isAnyFormNode,
    isAnyStoreNode,
    isEntityField,
    isFormListNode,
    isFormNode,
    StoreListNode,
    StoreNode
} from "../types";
import {validateField} from "../validation";
import {getNodeForList, replaceNode} from "./store";
import {toFlatValues} from "./util";

/**
 * Transforme un Store(List)Node en Form(List)Node.
 * @param node Le FormNode en cours de création.
 * @param sourceNode Le node origine du FormNode.
 * @param parentNodeOrEditing Node parent, (l'état initial ou la condition) d'édition.
 */
export function nodeToFormNode<T extends Entity = any, U = {}>(
    node: StoreNode<T> & U | StoreListNode<T, U>,
    sourceNode: StoreNode<T> | StoreListNode<T>,
    parentNodeOrEditing: FormNode | FormListNode | boolean | (() => boolean)
) {
    const {$tempEdit} = node;
    if ($tempEdit !== undefined) {
        delete node.$tempEdit;
    }

    (node as any).reset = action("formNode.reset", () => {
        node.clear();
        replaceNode(node as any, sourceNode as any);
    });

    (node as any).sourceNode = sourceNode;

    (node as any).form = observable({
        _isEdit:
            (isBoolean(parentNodeOrEditing) ? parentNodeOrEditing : true) && (isBoolean($tempEdit) ? $tempEdit : true),
        get isEdit() {
            return (
                this._isEdit &&
                (isAnyFormNode(parentNodeOrEditing) ? parentNodeOrEditing.form.isEdit : true) &&
                (isFunction(parentNodeOrEditing) ? parentNodeOrEditing() : true) &&
                (isFunction($tempEdit) ? $tempEdit() : true)
            );
        },
        set isEdit(edit) {
            this._isEdit = edit;
        }
    });

    (node as any).form.dispose = function dispose() {
        if (isFormListNode(node)) {
            node.forEach(item => item.form.dispose());
            node.form._disposer();
        } else {
            for (const entry in node) {
                if (entry === "sourceNode") {
                    continue;
                }
                const child: {} = (node as any)[entry];
                if (isEntityField(child) && (child as FormEntityField)._formDisposer) {
                    (child as FormEntityField)._formDisposer!();
                } else if (isAnyFormNode(child)) {
                    child.form.dispose();
                }
            }
        }
    };

    if (isFormListNode(node)) {
        node.forEach((item, i) => nodeToFormNode(item, (sourceNode as StoreListNode)[i], node));
        extendObservable(node.form, {
            get isValid() {
                return isFormListNode(node) && node.every(item => item.form.isValid);
            },
            get errors() {
                return (isFormListNode(node) && node.map(item => item.form.errors)) || [];
            }
        });

        // On va chercher à mettre à jour le FormListNode suite aux ajouts et suppressions depuis la souce.
        const onSourceSplice = observe(
            sourceNode as StoreListNode,
            action((change: IArrayChange | IArraySplice) => {
                if (change.type === "splice") {
                    // On construit les nouveaux noeuds à ajouter au FormListNode.
                    const newNodes = change.added.map(item => getNodeForList(node, item));
                    // On cherche les noeuds correspondants aux noeuds supprimés de la source.
                    // Ils ne sont potentiellement ni à la même place, ni même présents.
                    const nodesToRemove = node.filter(item =>
                        change.removed.find(changed => isEqual(toFlatValues(changed), toFlatValues(item)))
                    );

                    // On va toujours chercher à ajouter les noeuds de la source avant les éventuels noeuds ajoutés dans la cible.
                    if (!change.index) {
                        // Ici c'est le cas facile : les éléments ajoutés sont au début de la source : ils sont donc au début de la cible.
                        node.splice(0, 0, ...(newNodes as any));
                    } else {
                        // On doit chercher l'index auquel il faut ajouter les éléments, qui au mieux est le même.
                        // La pire chose qu'il puisse arriver est d'avoir supprimé des éléments de la source dans la cible.
                        let previousIndex;
                        let changeIndex = change.index;
                        do {
                            // On va donc chercher le premier item de la cible précédent l'index de la source qui est inclus dans la source.
                            changeIndex--;
                            previousIndex = node.findIndex(item =>
                                isEqual(toFlatValues(change.object[changeIndex]), toFlatValues(item))
                            );
                        } while (previousIndex === -1 && changeIndex > 0);
                        // Si aucune suppression, on a fait (-1 +1) donc on retombe au bon endroit.
                        // S'il y a eu n suppressions, on a fait (-1 -n +1), et on est aussi au bon endroit.
                        // L'index minimal final est bien toujours 0, donc au pire on ajoutera au début, c'est qui est aussi le bon endroit.
                        node.splice(previousIndex + 1, 0, ...(newNodes as any));
                    }

                    // Et on supprime les noeuds à supprimer.
                    nodesToRemove.forEach(toRemove => node.remove(toRemove));
                }
            })
        );

        // En plus de monitorer les ajouts et les suppressions, il faut aussi disposer tous les noeuds supprimés de la liste.
        const onRemove = observe(node, change => {
            if (change.type === "splice") {
                change.removed.forEach(deleted => deleted.form.dispose());
            }
        });

        // Le disposer final d'un FormListNode est donc composer des deux observers ci-dessus.
        node.form._disposer = function _disposer() {
            onSourceSplice();
            onRemove();
        };
    } else if (isFormNode(node)) {
        for (const entry in node) {
            if (entry === "sourceNode") {
                continue;
            }
            const child: {} = (node as any)[entry];
            if (isEntityField(child)) {
                addFormFieldProperties(child, node);
            } else if (isAnyStoreNode(child)) {
                nodeToFormNode(child, (sourceNode as any)[entry], node);
            }
        }
        extendObservable(node.form, {
            get isValid() {
                return !Object.keys(this.errors).length;
            },
            get errors() {
                return (
                    (isFormNode(node) &&
                        toPairs(node).reduce((errors, [key, item]) => {
                            if (isEntityField(item)) {
                                const fItem = item as FormEntityField;
                                if (!fItem.isValid) {
                                    return {...errors, [key]: fItem.error};
                                }
                            } else if (isAnyFormNode(item) && item !== (node as any)) {
                                if (!item.form.isValid) {
                                    return {...errors, [key]: item.form.errors};
                                }
                            }
                            return errors;
                        }, {})) ||
                    {}
                );
            }
        });
    }
}

/**
 * Ajoute une condition d'édition à un StoreNode (dans un FormNode).
 * @param node Le noeud de store.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function patchNodeEdit<T extends Entity = any, U = {}>(
    node: StoreNode<T> | StoreListNode<T, U>,
    isEdit: boolean | (() => boolean)
) {
    node.$tempEdit = isEdit;
}

/** Ajoute les champs erreurs et d'édition sur un EntityField. */
function addFormFieldProperties(field: EntityField, parentNode: FormNode) {
    const {isEdit} = field as FormEntityField;
    delete (field as FormEntityField).isEdit;
    extendObservable(field, {
        _isEdit: isBoolean(isEdit) ? isEdit : true,
        get error() {
            return validateField(field);
        },
        get isEdit() {
            return this._isEdit && parentNode.form.isEdit && (isFunction(isEdit) ? isEdit() : true);
        },
        set isEdit(edit) {
            this._isEdit = edit;
        },
        get isValid() {
            return !this.isEdit || !this.error;
        }
    });

    if (parentNode !== parentNode.sourceNode) {
        (field as FormEntityField)._formDisposer = intercept(
            parentNode.sourceNode[field.$field.name] as EntityField,
            "value",
            change => {
                field.value = change.newValue;
                return change;
            }
        );
    }
}
