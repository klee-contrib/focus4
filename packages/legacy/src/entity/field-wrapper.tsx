import {flatten} from "lodash";
import * as React from "react";

import {autocompleteFor, fieldFor, FieldOptions, fromField, selectFor} from "@focus4/forms";
import {Domain, EntityField, FieldEntry, ReferenceList, validateField, Validator} from "@focus4/stores";

export function FieldWrapper<F extends FieldEntry>({
    AutocompleteComponent,
    displayFormatter,
    domain,
    error: pError,
    field: pField,
    isEdit,
    isRequired,
    label,
    InputComponent,
    onErrorChange,
    options,
    SelectComponent,
    type,
    validator: pValidator,
    values
}: {
    AutocompleteComponent?: React.ComponentType<any>;
    displayFormatter?: (value: any) => string;
    domain?: Domain<any>;
    error?: string;
    field: EntityField<F>;
    InputComponent?: React.ComponentType<any>;
    isEdit: boolean;
    label?: string;
    isRequired?: boolean;
    onErrorChange: (error: string | undefined) => void;
    options: FieldOptions<F>;
    SelectComponent?: React.ComponentType<any>;
    type: "autocomplete" | "input" | "select";
    validator?: Validator<any> | Validator<any>[];
    values?: ReferenceList;
}) {
    const field = React.useMemo(
        () =>
            fromField(pField, {
                AutocompleteComponent,
                InputComponent,
                displayFormatter,
                domain,
                label,
                isRequired,
                SelectComponent
            }),
        [pField, AutocompleteComponent, InputComponent, displayFormatter, domain, label, isRequired, SelectComponent]
    );

    const validator = React.useMemo(() => {
        const {validator: dValidator} = field.$field.domain;
        return flatten([dValidator, pValidator]);
    }, [pValidator]) as Validator<F["fieldType"]>[];

    const error = React.useMemo(() => {
        const e = pError ?? validateField(field.value, field.$field.isRequired, validator);
        onErrorChange(e);
        return e;
    }, [pError, field.value, field.$field.isRequired, validator]);

    const formField = React.useMemo(
        () => ({
            $field: field.$field,
            get value() {
                return field.value;
            },
            set value(v) {
                field.value = v;
            },
            isEdit,
            error,
            isValid: !error
        }),
        [field, isEdit, error]
    );

    if (type === "autocomplete") {
        return autocompleteFor<any>(formField, options);
    } else if (type === "select") {
        return selectFor<any>(formField, values!, options);
    } else {
        return fieldFor<any>(formField, options);
    }
}
