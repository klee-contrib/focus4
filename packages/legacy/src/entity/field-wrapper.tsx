import {flatten} from "lodash";
import {useObserver} from "mobx-react";
import * as React from "react";

import {autocompleteFor, AutocompleteResult, fieldFor, FieldOptions, selectFor} from "@focus4/forms";
import {EntityField, FieldEntry, makeField, Metadata, ReferenceList, validateField, Validator} from "@focus4/stores";

export function FieldWrapper<F extends FieldEntry>({
    AutocompleteComponent,
    className,
    comment,
    displayFormatter,
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
    className?: string;
    comment?: React.ReactNode;
    displayFormatter?: (value: any) => string;
    error?: string;
    field: EntityField<F>;
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
    type: "autocomplete" | "input" | "select";
    validator?: Validator<any> | Validator<any>[];
    values?: ReferenceList;
}) {
    // On vide l'erreur si on enlève le champ.
    React.useEffect(() => () => onErrorChange(undefined), [pField.$field.name]);

    return useObserver(() => {
        const field = React.useMemo(
            () =>
                makeField(
                    () => pField.value,
                    {
                        name: pField.$field.name,
                        domain: pField.$field.domain,
                        label: label ?? pField.$field.label,
                        isRequired: isRequired ?? pField.$field.isRequired,
                        comment: comment ?? pField.$field.comment,
                        AutocompleteComponent: AutocompleteComponent ?? pField.$field.domain.AutocompleteComponent,
                        InputComponent: InputComponent ?? pField.$field.domain.InputComponent,
                        className: className ?? pField.$field.domain.className,
                        displayFormatter: displayFormatter ?? pField.$field.domain.displayFormatter,
                        SelectComponent: SelectComponent ?? pField.$field.domain.SelectComponent
                    },
                    value => (pField.value = value)
                ),
            [
                pField,
                AutocompleteComponent,
                InputComponent,
                className,
                comment,
                displayFormatter,
                label,
                isRequired,
                SelectComponent
            ]
        );

        const error = React.useMemo(() => {
            const {validator: dValidator} = field.$field.domain;
            const e =
                pError ??
                validateField(
                    field.value,
                    field.$field.isRequired,
                    flatten([dValidator, pValidator]).filter(v => v) as Validator<F["fieldType"]>[]
                );
            onErrorChange(isEdit ? e : undefined);
            return e;
        }, [pError, field.value, isEdit, field.$field.isRequired, pValidator]);

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
            return autocompleteFor<any>(formField, options as any);
        } else if (type === "select") {
            return selectFor<any>(formField, values!, options as any);
        } else {
            return fieldFor<any>(formField, options as any);
        }
    });
}

export function fieldWrapperFor(
    type: "autocomplete" | "input" | "select",
    field: EntityField,
    isEdit: boolean,
    onErrorChange: (error: string | undefined) => void,
    options: FieldOptions<any> &
        Metadata & {
            error?: string;
            isEdit?: boolean;
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
        className,
        comment,
        displayFormatter,
        error,
        label,
        isEdit: fieldEdit,
        isRequired,
        validator,
        ...fieldOptions
    } = options;
    return (
        <FieldWrapper
            AutocompleteComponent={AutocompleteComponent}
            className={className}
            comment={comment}
            displayFormatter={displayFormatter}
            error={error}
            field={field}
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
