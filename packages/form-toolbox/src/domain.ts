import {FieldOptions} from "@focus4/forms";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    DomainFieldType,
    DomainFieldTypeMultiple,
    DomainFieldTypeSingle,
    ReferenceList,
    UndefinedComponent
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
    const DT extends DomainFieldTypeSingle,
    ICProps extends BaseInputProps<DT> = InputProps<DT>,
    SCProps extends BaseSelectProps<DT> = SelectProps<DT>,
    // @ts-ignore
    ACProps extends BaseAutocompleteProps<DT> = AutocompleteSearchProps<DT>,
    DCProps extends BaseDisplayProps<DT> = DisplayProps<DT>,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Partial<
        Domain<
            DT,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
        >
    > & {type: DT}
): Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;
export function domain<
    const DT extends DomainFieldTypeMultiple,
    ICProps extends BaseInputProps<DT> = {},
    SCProps extends BaseSelectProps<DT> = SelectChipsProps<DT>,
    ACProps extends BaseAutocompleteProps<DT> = AutocompleteChipsProps<DT>,
    DCProps extends BaseDisplayProps<DT> = DisplayProps<DT>,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Partial<
        Domain<
            DT,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
        >
    > & {type: DT}
): Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;
export function domain<
    const DT extends "object",
    ICProps extends BaseInputProps<DT> = {},
    SCProps extends BaseSelectProps<DT> = {values: ReferenceList},
    ACProps extends BaseAutocompleteProps<DT> = {},
    DCProps extends BaseDisplayProps<DT> = DisplayProps<DT>,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Partial<
        Domain<
            DT,
            ICProps,
            SCProps,
            ACProps,
            DCProps,
            LCProps,
            Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
        >
    > & {type: DT}
): Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;
export function domain(d: Partial<Domain> & {type: DomainFieldType}): Domain {
    if (d.type === "boolean" || d.type === "number" || d.type === "string") {
        return {
            AutocompleteComponent: AutocompleteSearch,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: Input,
            SelectComponent: Select,
            ...d
        };
    } else if (d.type === "boolean-array" || d.type === "number-array" || d.type === "string-array") {
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
