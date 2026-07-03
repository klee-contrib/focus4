import {isAnyFormNode, isEntityField, isFormEntityField, isStoreListNode, isStoreNode} from "../types";

export function isAdded(item: unknown) {
    if (isAnyFormNode(item)) {
        return item.form._added === true;
    } else if (isFormEntityField(item)) {
        return item._added === true;
    }
    return false;
}

export function isEmpty(item: unknown, includeAddedFields?: boolean): boolean {
    if (isAdded(item) && !includeAddedFields) {
        return true;
    } else if (isStoreListNode(item)) {
        return item.length === 0;
    } else if (isStoreNode(item)) {
        return Object.values(item).every(i => isEmpty(i, includeAddedFields));
    } else if (isEntityField(item)) {
        return (
            item.value === undefined ||
            item.value === null ||
            (typeof item.value === "string" && item.value.trim() === "") ||
            (Array.isArray(item.value) && item.value.length === 0)
        );
    }
    return true;
}

export function isRequired(item: unknown) {
    if (isAnyFormNode(item)) {
        return item.form.isRequired === true;
    } else if (isStoreListNode(item) || isStoreNode(item)) {
        return item.$required === true;
    } else if (isEntityField(item)) {
        return item.$field.isRequired === true;
    }
    return false;
}
