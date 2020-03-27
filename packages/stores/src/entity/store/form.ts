import {isBoolean, isEqual, isFunction, toPairs} from "lodash";
import {action, extendObservable, IArrayChange, IArraySplice, intercept, observable, observe} from "mobx";

import {
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

/**
 * Transforme un Store(List)Node en Form(List)Node.
 * @param node Le FormNode en cours de création.
 * @param sourceNode Le node origine du FormNode.
 * @param parentNode Le node parent.
 */
export function nodeToFormNode<E = any>(
    node: StoreNode<E> | StoreListNode<E>,
    sourceNode: StoreNode<E> | StoreListNode<E>,
    parentNode?: FormNode | FormListNode
) {
    const {$tempEdit} = node;
    if ($tempEdit !== undefined) {
        delete node.$tempEdit;
    }

    (node as any).reset = action("formNode.reset", () => {
        node.clear();
        return replaceNode(node as any, sourceNode as any);
    });

    (node as any).sourceNode = sourceNode;

    (node as any).form = observable({
        _isEdit: isBoolean($tempEdit) ? $tempEdit : true,
        get isEdit() {
            return (parentNode ? parentNode.form.isEdit : true) && (isFunction($tempEdit) ? $tempEdit() : this._isEdit);
        },
        set isEdit(edit) {
            this._isEdit = edit;
        }
    });

    (node as any).dispose = function dispose() {
        if (isFormListNode(node)) {
            node.forEach(item => item.dispose());
            node._dispose();
        } else {
            for (const entry in node) {
                if (entry === "sourceNode") {
                    continue;
                }
                const child: {} = (node as any)[entry];
                if (isEntityField(child)) {
                    (child as FormEntityField)._dispose?.();
                } else if (isAnyFormNode(child)) {
                    child.dispose();
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
                if (sourceNode === node) {
                    return;
                }

                if (change.type === "splice") {
                    // On construit les nouveaux noeuds à ajouter au FormListNode.
                    const newNodes = change.added.map(item => getNodeForList(node, item));

                    // Cas particulier du replace : on remplace tout comme attendu.
                    if (change.addedCount === change.removedCount) {
                        node.replace(newNodes as any);
                        return;
                    }

                    // On cherche les noeuds correspondants aux noeuds supprimés de la source.
                    // Ils ne sont potentiellement ni à la même place, ni même présents.
                    const nodesToRemove = node.filter(item =>
                        change.removed.find(changed => changed === item.sourceNode)
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
                                isEqual(change.object[changeIndex], item.sourceNode)
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
                change.removed.forEach(deleted => deleted.dispose());
            }
        });

        // Le disposer final d'un FormListNode est donc composer des deux observers ci-dessus.
        node._dispose = function _dispose() {
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

/** Ajoute les champs erreurs et d'édition sur un EntityField. */
function addFormFieldProperties(field: EntityField, parentNode: FormNode) {
    const {isEdit} = field as FormEntityField;
    delete (field as FormEntityField).isEdit;
    extendObservable(field, {
        _isEdit: isBoolean(isEdit) ? isEdit : true,
        get error() {
            return validateField<any>(field.value, field.$field.isRequired, field.$field.domain.validator);
        },
        get isEdit() {
            return parentNode.form.isEdit && (isFunction(isEdit) ? isEdit() : this._isEdit);
        },
        set isEdit(edit) {
            this._isEdit = edit;
        },
        get isValid() {
            return !this.isEdit || !this.error;
        }
    });

    if (parentNode !== parentNode.sourceNode) {
        const sourceField = parentNode.sourceNode[field.$field.name] as EntityField;
        if (sourceField) {
            (field as FormEntityField)._dispose = intercept(sourceField, "value", change => {
                if (parentNode !== parentNode.sourceNode) {
                    field.value = change.newValue;
                }
                return change;
            });
        }
    }
}
