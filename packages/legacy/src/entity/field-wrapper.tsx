import {flatten} from "lodash";
import {useObserver} from "mobx-react";
import {ComponentType, ReactNode, useEffect, useMemo} from "react";

import {autocompleteFor, AutocompleteResult, fieldFor, FieldOptions, selectFor} from "@focus4/forms";
import {EntityField, FieldEntry, makeField, Metadata, ReferenceList, validateField, Validator} from "@focus4/stores";

export function FieldWrapper<F extends FieldEntry>({
    AutocompleteComponent,
    className,
    comment,
    DisplayComponent,
    displayFormatter,
    error: pError,
    field: pField,
    isEdit,
    isRequired,
    label,
    LabelComponent,
    InputComponent,
    onErrorChange,
    options,
    SelectComponent,
    type,
    validator: pValidator,
    values
}: {
    AutocompleteComponent?: ComponentType<any>;
    className?: string;
    comment?: ReactNode;
    DisplayComponent?: ComponentType<any>;
    displayFormatter?: (value: any) => string;
    error?: string;
    field: EntityField<F>;
    InputComponent?: ComponentType<any>;
    isEdit: boolean;
    label?: string;
    LabelComponent?: ComponentType<any>;
    isRequired?: boolean;
    onErrorChange: (error: string | undefined) => void;
    options: FieldOptions<F> & {
        keyResolver?: (key: number | string) => Promise<string | undefined>;
        querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
    };
    SelectComponent?: ComponentType<any>;
    type: "autocomplete" | "input" | "select";
    validator?: Validator<any> | Validator<any>[];
    values?: ReferenceList;
}) {
    // On vide l'erreur si on enlève le champ.
    useEffect(() => () => onErrorChange(undefined), [pField.$field.name]);

    return useObserver(() => {
        const field = useMemo(
            () =>
                makeField(pField.$field.name, f =>
                    f
                        .domain(pField.$field.domain)
                        .value(
                            () => pField.value,
                            value => (pField.value = value)
                        )
                        .metadata({
                            label: label ?? pField.$field.label,
                            isRequired: isRequired ?? pField.$field.isRequired,
                            comment: comment ?? pField.$field.comment,
                            AutocompleteComponent: AutocompleteComponent ?? pField.$field.domain.AutocompleteComponent,
                            InputComponent: InputComponent ?? pField.$field.domain.InputComponent,
                            className: className ?? pField.$field.domain.className,
                            DisplayComponent: DisplayComponent ?? pField.$field.domain.DisplayComponent,
                            displayFormatter: displayFormatter ?? pField.$field.domain.displayFormatter,
                            LabelComponent: LabelComponent ?? pField.$field.domain.LabelComponent,
                            SelectComponent: SelectComponent ?? pField.$field.domain.SelectComponent
                        })
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

        const error = useMemo(() => {
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

        const formField = useMemo(
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
            DisplayComponent={DisplayComponent}
            displayFormatter={displayFormatter}
            error={error}
            field={field}
            InputComponent={InputComponent}
            isEdit={fieldEdit ?? isEdit}
            isRequired={isRequired}
            label={label}
            LabelComponent={LabelComponent}
            onErrorChange={onErrorChange}
            options={fieldOptions}
            SelectComponent={SelectComponent}
            type={type}
            validator={validator}
            values={values}
        />
    );
}
