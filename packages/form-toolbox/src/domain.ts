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
    ReferenceList
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
import {domainFunctionBuilder} from "@focus4/forms/lib/utils";

/** Pour créer une nouvelle fonction de domaine, recopier la signature suivante. Remplacez les composants par défaut ainsi que leurs types de props */

export type DefaultInputProps<DT extends DomainFieldTypeSingle> /*                     */ = InputProps<DT>;
export type DefaultSelectProps<DT extends DomainFieldTypeSingle> /*                    */ = SelectProps<DT>;
export type DefaultSelectMultipleProps<DT extends DomainFieldTypeMultiple> /*          */ = SelectChipsProps<DT>;
export type DefaultAutocompleteProps<DT extends DomainFieldTypeSingle> /*              */ = AutocompleteSearchProps<DT>;
export type DefaultAutocompleteMultipleProps<DT extends DomainFieldTypeMultiple> /*    */ = AutocompleteChipsProps<DT>;
export type DefaultDisplayProps<DT extends DomainFieldType> /*                         */ = DisplayProps<DT>;
export type DefaultLabelProps /*                                                       */ = LabelProps;

/** Crée un domaine avec les composants par défaut du module `form-toolbox`. */
export function domain<
    const DT extends DomainFieldType,
    ICProps extends BaseInputProps<DT> = DT extends DomainFieldTypeSingle ? DefaultInputProps<DT> : {},
    SCProps extends BaseSelectProps<DT> = DT extends DomainFieldTypeSingle
        ? DefaultSelectProps<DT>
        : DT extends DomainFieldTypeMultiple
        ? DefaultSelectMultipleProps<DT>
        : DT extends "object"
        ? {values: ReferenceList}
        : never,
    // @ts-ignore
    ACProps extends BaseAutocompleteProps<DT> = DT extends DomainFieldTypeSingle
        ? DefaultAutocompleteProps<DT>
        : DT extends DomainFieldTypeMultiple
        ? DefaultAutocompleteMultipleProps<DT>
        : DT extends "object"
        ? {}
        : never,
    DCProps extends BaseDisplayProps<DT> = DefaultDisplayProps<DT>,
    LCProps extends BaseLabelProps = DefaultLabelProps
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
): Domain<DT, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">> {
    return domainFunctionBuilder({
        AutocompleteSimple: AutocompleteSearch,
        AutocompleteMultiple: AutocompleteChips,
        Display,
        Label,
        Input,
        SelectSimple: Select,
        SelectMultiple: SelectChips
    })(d);
}
