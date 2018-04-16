import {isBoolean, isFunction, values} from "lodash";
import {extendObservable, observable} from "mobx";

import {BaseStoreNode, EntityField, FormEntityField, FormNode, isEntityField, isStoreListNode, isStoreNode, StoreListNode, StoreNode} from "../types";
import {validateField} from "../validation";

/**
 * Ajoute les champs calculés de validation et édition dans un FormNode.
 * @param data Le StoreNode ou l'EntityField.
 * @param parentNodeOrEditing Node parent, (l'état initial ou la condition) d'édition.
 */
export function addFormProperties(data: BaseStoreNode, parentNodeOrEditing: FormNode | boolean | (() => boolean)) {
    const {$tempEdit} = data;
    if ($tempEdit) {
        delete data.$tempEdit;
    }

    const formData = data as FormNode<BaseStoreNode>;

    (formData as any).form = observable({
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

    if (isStoreListNode(formData)) {
        formData.forEach(i => addFormProperties(i, formData));
        extendObservable(formData.form, {
            get isValid() {
                return !formData.form.isEdit || (data as StoreListNode).every(node => !node.form || node.form.isValid);
            }
        });
    } else {
        for (const entry in formData) {
            const child: {} = (formData as any)[entry];
            if (isEntityField(child)) {
                addFormFieldProperties(child, formData);
            } else if (isStoreNode(child)) {
                addFormProperties(child, isBoolean(parentNodeOrEditing) ? formData : parentNodeOrEditing);
            }
        }
        extendObservable(formData.form, {
            get isValid() {
                return formData.form.isEdit || values(formData)
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
