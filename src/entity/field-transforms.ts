import {InputProps} from "react-toolbox/lib/input";
import {DisplayProps, LabelProps} from "../components";
import {Domain, EntityField, FieldEntry} from "./types";

export function makeField<
    T,
    ICProps = InputProps,
    DCProps = DisplayProps,
    LCProps = LabelProps
>(
    value: T,
    $field: Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>>> = {}
) {
    return {$field, value} as EntityField<T, Domain<ICProps, DCProps, LCProps>>;
}

export function patchField<
    T,
    ICDomainProps = InputProps,
    DCDomainProps = DisplayProps,
    LCDomainProps = LabelProps,
    ICProps = ICDomainProps,
    DCProps = DCDomainProps,
    LCProps = LCDomainProps
>(
    field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
    $field: Partial<FieldEntry<Domain<ICProps, DCProps, LCProps>>>
) {
    return {
        $field: {
            ...field.$field,
            domain: {
                ...field.$field.domain,
                ...$field.domain,
                inputProps: {
                    ...(field.$field.domain.inputProps as any),
                    ...($field.domain && $field.domain.inputProps as any)
                },
                displayProps: {
                    ...(field.$field.domain.displayProps as any),
                    ...($field.domain && $field.domain.displayProps as any)
                },
                labelProps: {
                    ...(field.$field.domain.labelProps as any),
                    ...($field.domain && $field.domain.labelProps as any)
                }
            },
        },
        value: field.value
    } as EntityField<T, Domain<ICProps, DCProps, LCProps>>;
}
