import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain
} from "@focus4/stores";

import {AutocompleteProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../components";

/** Crée un domaine. */
export function domain<T>(): <
    ICProps extends BaseInputProps = InputProps<T extends number ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<T extends number ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<T extends number ? "number" : "string">,
    DCProps extends BaseDisplayProps = DisplayProps,
    LCProps extends BaseLabelProps = LabelProps
>(
    d: Domain<T, ICProps, SCProps, ACProps, DCProps, LCProps>
) => Domain<T, ICProps, SCProps, ACProps, DCProps, LCProps> {
    return d => d;
}
