import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain
} from "@focus4/stores";

import {AutocompleteProps, DisplayProps, InputProps, LabelProps, SelectProps} from "../components";
import {FieldOptions} from "../fields";

/** Crée un domaine. */
export function domain<
    DT extends "string" | "number" | "boolean" | "object",
    ICProps extends BaseInputProps = InputProps<DT extends "number" ? "number" : "string">,
    SCProps extends BaseSelectProps = SelectProps<DT extends "number" ? "number" : "string">,
    ACProps extends BaseAutocompleteProps = AutocompleteProps<DT extends "number" ? "number" : "string">,
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
