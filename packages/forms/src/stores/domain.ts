import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    DomainFieldType
} from "@focus4/stores";

import {AutocompleteSearchProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../components";
import {FieldOptions} from "../fields";

/** Crée un domaine. */
export function domain<
    DT extends DomainFieldType,
    ICProps extends BaseInputProps = InputProps<DT>,
    SCProps extends BaseSelectProps = SelectProps<DT>,
    ACProps extends BaseAutocompleteProps = AutocompleteSearchProps<DT>,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Domain<
        DT,
        ICProps,
        SCProps,
        ACProps,
        DCProps,
        LCProps,
        Omit<FieldOptions<any>, "inputType" | "onChange" | "type">
    >
) {
    return d;
}
