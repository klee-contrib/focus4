import {isBoolean, isFunction, values} from "lodash";
import {extendObservable, observable} from "mobx";

import {BaseStoreNode, EntityField, isEntityField, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "../types";
import {validateField} from "../validation";

/**
 * Ajoute les champs calculés de validation et édition dans un FormNode.
 * @param data Le StoreNode ou l'EntityField.
 * @param parentNodeOrEditing Node parent, (l'état initial ou la condition) d'édition.
 */
export function addFormProperties(data: BaseStoreNode, parentNodeOrEditing: BaseStoreNode | boolean | (() => boolean)) {
    const {$tempEdit} = data;
    if ($tempEdit) {
        delete data.$tempEdit;
    }

    (data as any).form = observable({
        _isEdit: (isBoolean(parentNodeOrEditing) ? parentNodeOrEditing : true) && (isBoolean($tempEdit) ? $tempEdit : true),
        get isEdit() {
            return this._isEdit
                && (isStoreNode(parentNodeOrEditing) ? parentNodeOrEditing.form!.isEdit : true)
                && (isFunction(parentNodeOrEditing) ? parentNodeOrEditing() : true)
                && (isFunction($tempEdit) ? $tempEdit() : true);
        },
        set isEdit(edit) {
            this._isEdit = edit;
        }
    });

    if (isStoreListNode(data)) {
        data.forEach(i => addFormProperties(i, data));
        extendObservable(data.form!, {
            get isValid() {
                return !data.form!.isEdit || (data as StoreListNode).every(node => !node.form || node.form.isValid);
            }
        });
    } else {
        for (const entry in data) {
            const child: {} = (data as any)[entry];
            if (isEntityField(child)) {
                addFormFieldProperties(child, data);
            } else if (isStoreNode(child)) {
                addFormProperties(child, isBoolean(parentNodeOrEditing) ? data : parentNodeOrEditing);
            }
        }
        extendObservable(data.form!, {
            get isValid() {
                return !data.form!.isEdit || values(data)
                    .every(item => {
                        if (isEntityField(item)) {
                            return !item.isEdit || !item.error;
                        } else if (isStoreNode(item)) {
                            return !item.form || item.form.isValid;
                        } else {
                            return true;
                        }
                    });
                }
            });
    }
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
export function addFormFieldProperties(field: EntityField, parentNode: BaseStoreNode) {
    const {isEdit} = field;
    delete field.isEdit;
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
