import {isBoolean, values} from "lodash";
import {computed, extendObservable, observable} from "mobx";

import {EntityField, isEntityField, isStoreListNode, isStoreNode, StoreNode} from "../types";
import {validateField} from "../validation";

/**
 * Ajoute les champs calculés de validation et édition dans un FormNode.
 * @param data Le StoreNode ou l'EntityField.
 * @param parentNodeOrEditing Node parent, ou le cas échéant la valeur initiale de isEdit (= appel initial).
 */
export function addFormProperties(data: StoreNode, parentNodeOrEditing: StoreNode | boolean) {
    if (isBoolean(parentNodeOrEditing)) {
        (data as any).form = observable({isEdit: parentNodeOrEditing});
    } else {
        (data as any).form = observable({
            _isEdit: true,
            get isEdit() {
                return this._isEdit && (parentNodeOrEditing as StoreNode).form!.isEdit;
            },
            set isEdit(edit) {
                this._isEdit = edit;
            }
        });
    }

    if (isStoreListNode(data)) {
        data.forEach(i => addFormProperties(i, data));
        extendObservable(data.form!, {
            isValid: computed(() => !data.form!.isEdit || data.every(node => !node.form || node.form.isValid))
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
            isValid: computed(() =>
                !data.form!.isEdit || values(data)
                    .every(item => {
                        if (isEntityField(item)) {
                            return !item.isEdit || !item.error;
                        } else if (isStoreNode(item)) {
                            return !item.form || item.form.isValid;
                        } else {
                            return true;
                        }
                    })
                )
            });
    }
}

/** Ajoute les champs erreurs et d'édition sur un EntityField. */
function addFormFieldProperties(field: EntityField, parentNode: StoreNode) {
    extendObservable(field, {
        error: computed(() => validateField(field)),
        isEdit: computed(() => {
            const {isEdit = true} = field.$field as any;
            return isEdit && parentNode.form!.isEdit;
        })
    });
}
