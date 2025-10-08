import {ZodType} from "zod";

import {FieldOptions} from "@focus4/forms";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    ReferenceList,
    UndefinedComponent,
    ZodTypeMultiple,
    ZodTypeSingle
} from "@focus4/stores";

import {
    AutocompleteChips,
    AutocompleteChipsProps,
    AutocompleteSearch,
    AutocompleteSearchProps,
    Display,
    DisplayProps,
    Input,
    InputProps,
    Label,
    LabelProps,
    Select,
    SelectChips,
    SelectChipsProps,
    SelectProps
} from "./components";

/** Crée un domaine avec les composants par défaut du module `form-toolbox`. */
export function domain<
    const S extends ZodTypeSingle,
    ICProps extends BaseInputProps<S> = InputProps<S>,
    SCProps extends BaseSelectProps<S> = SelectProps<S>,
    // @ts-ignore
    ACProps extends BaseAutocompleteProps<S> = AutocompleteSearchProps<S>,
    DCProps extends BaseDisplayProps<S> = DisplayProps<S>,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Partial<
        Domain<
            S,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
        >
    > & {schema: S}
): Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;
export function domain<
    const S extends ZodTypeMultiple,
    ICProps extends BaseInputProps<S> = {},
    SCProps extends BaseSelectProps<S> = SelectChipsProps<S>,
    ACProps extends BaseAutocompleteProps<S> = AutocompleteChipsProps<S>,
    DCProps extends BaseDisplayProps<S> = DisplayProps<S>,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Partial<
        Domain<
            S,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
        >
    > & {schema: S}
): Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;
export function domain<
    const S extends ZodType,
    ICProps extends BaseInputProps<S> = {},
    SCProps extends BaseSelectProps<S> = {values: ReferenceList},
    ACProps extends BaseAutocompleteProps<S> = {},
    DCProps extends BaseDisplayProps<S> = DisplayProps<S>,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Partial<
        Domain<
            S,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
        >
    > & {schema: S}
): Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;
export function domain(d: Partial<Domain> & {schema: ZodType}): Domain {
    if (d.schema.type === "boolean" || d.schema.type === "number" || d.schema.type === "string") {
        return {
            AutocompleteComponent: AutocompleteSearch,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: Input,
            SelectComponent: Select,
            ...d
        };
    } else if (d.schema.type === "array") {
        return {
            AutocompleteComponent: AutocompleteChips,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: UndefinedComponent,
            SelectComponent: SelectChips,
            ...d
        };
    } else {
        return {
            AutocompleteComponent: UndefinedComponent,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: UndefinedComponent,
            SelectComponent: UndefinedComponent,
            ...d
        };
    }
}
