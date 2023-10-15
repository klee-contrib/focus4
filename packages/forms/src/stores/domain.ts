import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain
} from "@focus4/stores";

import {AutocompleteSearchProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../components";
import {FieldOptions} from "../fields";

/** Crée un domaine. */
export function domain<
    DT extends "boolean" | "number" | "object" | "string",
    ICProps extends BaseInputProps = InputProps<DT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<DT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteSearchProps<DT extends "number" ? "number" : "string">,
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
