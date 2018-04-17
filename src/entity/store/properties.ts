import {isBoolean, isFunction, values} from "lodash";
import {action, extendObservable, observable, reaction} from "mobx";

import {BaseStoreNode, EntityField, FormEntityField, FormNode, isEntityField, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "../types";
import {validateField} from "../validation";
import {setEntityEntry} from "./store";
import {toFlatValues} from "./utils";

/**
 * Ajoute les champs calculés de validation et édition dans un FormNode.
 * @param node Le FormNode en cours de création.
 * @param sourceNode Le node origine du FormNode.
 * @param parentNodeOrEditing Node parent, (l'état initial ou la condition) d'édition.
 */
export function addFormProperties(node: BaseStoreNode, sourceNode: BaseStoreNode, parentNodeOrEditing: FormNode | boolean | (() => boolean)) {
    const {$tempEdit} = node;
    if ($tempEdit) {
        delete node.$tempEdit;
    }

    const formNode = node as FormNode<BaseStoreNode>;

    (formNode as any).form = observable({
        _isEdit: (isBoolean(parentNodeOrEditing) ? parentNodeOrEditing : true) && (isBoolean($tempEdit) ? $tempEdit : true),
        get isEdit() {
            return this._isEdit
                && (isStoreNode(parentNodeOrEditing) ? (parentNodeOrEditing as FormNode<StoreNode>).form.isEdit : true)
                && (isFunction(parentNodeOrEditing) ? parentNodeOrEditing() : true)
                && (isFunction($tempEdit) ? $tempEdit() : true);
        },
        set isEdit(edit) {
            this._isEdit = edit;
        }
    });

    if (isStoreListNode(formNode)) {
        formNode.forEach((item, i) => addFormProperties(item, (sourceNode as StoreListNode)[i], formNode));
        extendObservable(formNode.form, {
            get isValid() {
                return !formNode.form.isEdit || (node as StoreListNode).every(item => !item.form || item.form.isValid);
            }
        });
    } else {
        for (const entry in formNode) {
            const child: {} = (formNode as any)[entry];
            if (isEntityField(child)) {
                addFormFieldProperties(child, formNode);
            } else if (isStoreNode(child)) {
                addFormProperties(child, (sourceNode as any)[entry], isBoolean(parentNodeOrEditing) ? formNode : parentNodeOrEditing);
            }
        }
        extendObservable(formNode.form, {
            get isValid() {
                return formNode.form.isEdit || values(formNode)
                    .every(item => {
                        if (isEntityField(item)) {
                            return !(item as FormEntityField).isEdit || !(item as FormEntityField).error;
                        } else if (isStoreNode(item)) {
                            return !item.form || (item as FormNode<StoreNode>).form.isValid;
                        } else {
                            return true;
                        }
                    });
                }
            });
    }

    formNode.reset = makeResetAction(formNode);
    formNode.sourceNode = sourceNode;
    formNode.stopSync = reaction(() => toFlatValues(sourceNode), formNode.reset);
}

/**
 * Ajoute une condition d'édition à un StoreNode (dans un FormNode).
 * @param node Le noeud de store.
 * @param isEdit L'état initial ou la condition d'édition.
 */
export function patchNodeEdit(node: StoreNode, isEdit: boolean | (() => boolean)) {
    node.$tempEdit = isEdit;
}

/** Ajoute les champs erreurs et d'édition sur un EntityField. */
export function addFormFieldProperties(field: EntityField, parentNode: FormNode) {
    const {isEdit} = field as FormEntityField;
    delete (field as FormEntityField).isEdit;
    extendObservable(field, {
        _isEdit: isBoolean(isEdit) ? isEdit : true,
        get error() {
            return validateField(field);
        },
        get isEdit() {
            return this._isEdit
                && parentNode.form!.isEdit
                && (isFunction(isEdit) ? isEdit() : true);
        },
        set isEdit(edit) {
            this._isEdit = edit;
        }
    });
}

/** Construit la méthode `reset` pour un `FormNode`. */
export function makeResetAction(formNode: FormNode): () => void {
    return action("formNode.reset", () => {
        (formNode as any).clear();
        setEntityEntry(formNode as any, formNode.sourceNode);
    });
}
