import {isBoolean, isEqual, isFunction} from "es-toolkit";
import {action, extendObservable, IArrayDidChange, intercept, observable, observe} from "mobx";

import {BuildingFormEntityField} from "../field";
import {
    EntityField,
    FormEntityField,
    FormListNode,
    FormNode,
    isAnyFormNode,
    isAnyStoreNode,
    isEntityField,
    isFormEntityField,
    isFormListNode,
    isFormNode,
    StoreListNode,
    StoreNode
} from "../types";
import {validateField} from "../validation";

import {getNodeForList, replaceNode, setNode} from "./store";

/**
 * Transforme un Store(List)Node en Form(List)Node.
 * @param node Le FormNode en cours de création.
 * @param parentNode Le node parent.
 */
export function nodeToFormNode<E = any>(node: StoreListNode<E> | StoreNode<E>, parentNode?: FormListNode | FormNode) {
    let {$edit, $required} = node;
    if ($edit !== undefined) {
        delete node.$edit;
    } else {
        $edit = true;
    }
    if ($required !== undefined) {
        delete node.$required;
    } else {
        $required = true;
    }

    delete node.$form;

    const {sourceNode} = node as any;

    node.load = () => sourceNode.load();
    (node as any).reset = action("formNode.reset", () => {
        if ((node as any).form._initialData) {
            replaceNode.call(node as any, (node as any).form._initialData);
        }
        setNode.call(node as any, sourceNode);
        return node;
    });

    (node as any).form = observable(
        {
            _isEdit: isBoolean($edit) ? $edit : true,
            get isEdit() {
                return (parentNode ? parentNode.form.isEdit : true) && (isFunction($edit) ? $edit() : this._isEdit);
            },
            set isEdit(edit) {
                this._isEdit = edit;
            },
            get isRequired() {
                if (parentNode && parentNode.form.isEmpty && !parentNode.form.isRequired) {
                    return false;
                }
                return isFunction($required) ? $required() : ($required ?? true);
            }
        },
        {},
        {proxy: false}
    );

    (node as any).dispose = function dispose() {
        if (isFormListNode<E>(node)) {
            for (const item of node) {
                item.dispose();
            }
            node._dispose();
        } else {
            for (const entry in node as StoreNode<E>) {
                if (entry === "sourceNode") {
                    continue;
                }
                const child: {} = (node as any)[entry];
                if (isFormEntityField(child)) {
                    child._dispose?.();
                } else if (isAnyFormNode(child)) {
                    child.dispose();
                }
            }
        }
    };

    if (isFormListNode(node)) {
        for (const item of node) {
            nodeToFormNode(item, node);
        }

        extendObservable(node.form, {
            get hasChanged() {
                return node.some(item => item.form.hasChanged);
            },
            get isEmpty() {
                return node.length === 0;
            },
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
            action((change: IArrayDidChange) => {
                if (sourceNode === (node as any)) {
                    return;
                }

                if (change.type === "splice") {
                    const isReplace = change.addedCount === change.removedCount;

                    // Si on a exactement autant d'élément sources non existants dans la source et d'éléments cibles non liés à un élément de la source, alors on les lies (dans le même ordre).
                    const unmatchedItems = node.sourceNode.filter(item => !node.some(ni => ni.sourceNode === item));
                    const unlinkedItems = node.filter(item => !node.sourceNode.some(ni => ni === item.sourceNode));

                    if (!isReplace && unmatchedItems.length >= unlinkedItems.length) {
                        for (let i = 0; i < unlinkedItems.length; i++) {
                            setNode.call(unlinkedItems[i] as any, unmatchedItems[i] as any);
                            setSourceNode(unlinkedItems[i], unmatchedItems[i]);
                            change.added = change.added.filter(a => a !== unmatchedItems[i]);
                            change.index++;
                        }
                    }

                    // On construit les nouveaux noeuds à ajouter au FormListNode.
                    const newNodes = change.added.map(item => getNodeForList(node, item));

                    // Cas particulier du replace : on remplace tout comme attendu.
                    if (isReplace) {
                        node.replace(newNodes as any);
                        return;
                    }

                    /*
                     * On cherche les noeuds correspondants aux noeuds supprimés de la source.
                     * Ils ne sont potentiellement ni à la même place, ni même présents.
                     */
                    const nodesToRemove = node.filter(item =>
                        change.removed.find(changed => changed === item.sourceNode)
                    );

                    // On va toujours chercher à ajouter les noeuds de la source avant les éventuels noeuds ajoutés dans la cible.
                    if (!change.index) {
                        // Ici c'est le cas facile : les éléments ajoutés sont au début de la source : ils sont donc au début de la cible.
                        node.splice(0, 0, ...(newNodes as any));
                    } else {
                        /*
                         * On doit chercher l'index auquel il faut ajouter les éléments, qui au mieux est le même.
                         * La pire chose qu'il puisse arriver est d'avoir supprimé des éléments de la source dans la cible.
                         */
                        let previousIndex;
                        let changeIndex = change.index;
                        do {
                            // On va donc chercher le premier item de la cible précédent l'index de la source qui est inclus dans la source.
                            changeIndex--;
                            previousIndex = node.findIndex(item =>
                                isEqual(change.object[changeIndex], item.sourceNode)
                            );
                        } while (previousIndex === -1 && changeIndex > 0);
                        /*
                         * Si aucune suppression, on a fait (-1 +1) donc on retombe au bon endroit.
                         * S'il y a eu n suppressions, on a fait (-1 -n +1), et on est aussi au bon endroit.
                         * L'index minimal final est bien toujours 0, donc au pire on ajoutera au début, c'est qui est aussi le bon endroit.
                         */
                        node.splice(previousIndex + 1, 0, ...(newNodes as any));
                    }

                    // Et on supprime les noeuds à supprimer.
                    for (const toRemove of nodesToRemove) {
                        node.remove(toRemove);
                    }
                }
            })
        );

        // En plus de monitorer les ajouts et les suppressions, il faut aussi disposer tous les noeuds supprimés de la liste.
        const onRemove = observe(node, change => {
            if (change.type === "splice") {
                for (const deleted of change.removed) {
                    deleted.dispose();
                }
            }
        });

        // Le disposer final d'un FormListNode est donc composer des deux observers ci-dessus.
        node._dispose = function _dispose() {
            onSourceSplice();
            onRemove();
        };
    } else if (isFormNode<E>(node)) {
        for (const entry in node) {
            if (entry === "sourceNode") {
                continue;
            }
            const child: {} = (node as any)[entry];
            if (isEntityField(child)) {
                addFormFieldProperties(child as BuildingFormEntityField, node);
            } else if (isAnyStoreNode(child)) {
                nodeToFormNode(child, node);
            }
        }
        extendObservable(node.form, {
            get hasChanged() {
                return Object.values(node).some(item => {
                    if (isFormEntityField(item)) {
                        return item.hasChanged;
                    } else if (isAnyFormNode(item) && item !== node) {
                        return item.form.hasChanged;
                    } else {
                        return false;
                    }
                });
            },
            get isEmpty() {
                return Object.values(node).every(item => {
                    if (isFormEntityField(item)) {
                        return (
                            !!item._added ||
                            item.value === undefined ||
                            item.value === null ||
                            (typeof item.value === "string" && item.value.trim() === "") ||
                            (Array.isArray(item.value) && item.value.length === 0)
                        );
                    } else if (isAnyFormNode(item) && node !== item) {
                        return item.form.isEmpty;
                    } else {
                        return true;
                    }
                });
            },
            get isValid() {
                return !Object.keys(this.errors).length;
            },
            get errors() {
                return (
                    (isFormNode(node) &&
                        Object.entries(node).reduce((errors, [key, item]) => {
                            if (isFormEntityField(item)) {
                                if (!item.isValid) {
                                    return {...errors, [key]: item.error};
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
function addFormFieldProperties(field: BuildingFormEntityField, parentNode: FormNode) {
    if ("_metadatas" in field) {
        field._metadatas.push(metadata => ({
            isRequired: parentNode.form.isEmpty && !parentNode.form.isRequired ? false : (metadata?.isRequired ?? false)
        }));
    } else {
        const {$field} = field as FormEntityField;
        // @ts-ignore
        delete field.$field;
        extendObservable(field, {
            get $field() {
                return {
                    ...$field,
                    isRequired: parentNode.form.isEmpty && !parentNode.form.isRequired ? false : $field.isRequired
                };
            }
        });
    }

    if (!("_isEdit" in field)) {
        extendObservable(field, {_isEdit: true});
    }

    extendObservable(field, {
        get error() {
            return validateField(field);
        },
        get hasChanged() {
            const sourceField = parentNode.sourceNode[field.$field.name] as EntityField;
            if (sourceField === field) {
                return true; // Le champ est dans un item de liste ajouté => forcément changé.
            } else if (!sourceField) {
                return false; // Le champ est ajouté => forcément inchangé.
            } else {
                return !isEqual(sourceField.value, field.value);
            }
        },
        get isEdit() {
            return parentNode.form.isEdit && (isFunction(field._isEdit) ? field._isEdit() : field._isEdit);
        },
        set isEdit(edit) {
            if (!isFunction(field._isEdit)) {
                field._isEdit = edit;
            }
        },
        get isValid() {
            return !this.isEdit || !this.error;
        }
    });

    if (parentNode !== parentNode.sourceNode) {
        const sourceField = parentNode.sourceNode[field.$field.name] as EntityField;
        if (sourceField) {
            (field as any)._dispose = intercept(sourceField, "value", change => {
                if (parentNode !== parentNode.sourceNode) {
                    field.value = change.newValue;
                }
                return change;
            });
        }
    }
}

function setSourceNode(node: FormListNode | FormNode, sourceNode: StoreListNode | StoreNode) {
    if (sourceNode && node !== sourceNode) {
        (node as any).sourceNode = sourceNode;
        for (const key in node as FormNode) {
            const item = (node as any)[key];
            const sourceItem = (sourceNode as any)[key];
            if (isAnyFormNode(item) && isAnyStoreNode(item)) {
                setSourceNode(item, sourceItem);
            } else if (isFormEntityField(item) && isEntityField(sourceItem)) {
                item._dispose = intercept(sourceItem, "value", change => {
                    item.value = change.newValue;
                    return change;
                });
            }
        }
    }
}
