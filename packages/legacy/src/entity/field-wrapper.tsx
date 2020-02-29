import {flatten} from "lodash";
import * as React from "react";

import {autocompleteFor, AutocompleteResult, fieldFor, FieldOptions, selectFor} from "@focus4/forms";
import {Domain, EntityField, FieldEntry, fromField, ReferenceList, validateField, Validator} from "@focus4/stores";

export function FieldWrapper<F extends FieldEntry>({
    AutocompleteComponent,
    displayFormatter,
    domain,
    error: pError,
    field: pField,
    fieldType,
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
    fieldType: "autocomplete" | "input" | "select";
    InputComponent?: React.ComponentType<any>;
    isEdit: boolean;
    label?: string;
    isRequired?: boolean;
    onErrorChange: (error: string | undefined) => void;
    options: FieldOptions<F> & {
        keyResolver?: (key: number | string) => Promise<string | undefined>;
        querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
    };
    SelectComponent?: React.ComponentType<any>;
    type?: "string" | "number" | "boolean" | "object";
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
                SelectComponent,
                type
            }),
        [
            pField,
            AutocompleteComponent,
            InputComponent,
            displayFormatter,
            domain,
            label,
            isRequired,
            SelectComponent,
            type
        ]
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

    if (fieldType === "autocomplete") {
        return autocompleteFor<any>(formField, options as any);
    } else if (fieldType === "select") {
        return selectFor<any>(formField, values!, options as any);
    } else {
        return fieldFor<any>(formField, options as any);
    }
}

export function fieldWrapperFor(
    fieldType: "autocomplete" | "input" | "select",
    field: EntityField,
    isEdit: boolean,
    onErrorChange: (error: string | undefined) => void,
    options: FieldOptions<any> &
        Partial<Domain> & {
            domain?: Domain;
            error?: string;
            label?: string;
            isEdit?: boolean;
            isRequired?: boolean;
            keyResolver?: (key: number | string) => Promise<string | undefined>;
            querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
        } = {},
    values?: ReferenceList
) {
    const {
        AutocompleteComponent,
        DisplayComponent,
        InputComponent,
        LabelComponent,
        SelectComponent,
        displayFormatter,
        domain,
        error,
        label,
        isEdit: fieldEdit,
        isRequired,
        type,
        validator,
        ...fieldOptions
    } = options;
    return (
        <FieldWrapper
            AutocompleteComponent={AutocompleteComponent}
            displayFormatter={displayFormatter}
            domain={domain}
            error={error}
            field={field}
            fieldType={fieldType}
            InputComponent={InputComponent}
            isEdit={fieldEdit ?? isEdit}
            isRequired={isRequired}
            label={label}
            onErrorChange={onErrorChange}
            options={fieldOptions}
            SelectComponent={SelectComponent}
            type={type}
            validator={validator}
            values={values}
        />
    );
}
