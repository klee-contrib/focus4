import {Domain, DomainFieldType, UndefinedComponent} from "@focus4/stores";

import {ComponentType} from "react";

export type DomainFunctionBuilderConf<ACProps, ACCProps, DCProps, LCProps, ICProps, SCProps, SCCProps> = {
    AutocompleteSimple?: ComponentType<ACProps>;
    AutocompleteMultiple?: ComponentType<ACCProps>;
    Display?: ComponentType<DCProps>;
    Label?: ComponentType<LCProps>;
    Input?: ComponentType<ICProps>;
    SelectSimple?: ComponentType<SCProps>;
    SelectMultiple?: ComponentType<SCCProps>;
};

export function domainFunctionBuilder<ACProps, ACCProps, DCProps, LCProps, ICProps, SCProps, SCCProps>({
    AutocompleteSimple,
    AutocompleteMultiple,
    Display,
    Label,
    Input,
    SelectSimple,
    SelectMultiple
}: DomainFunctionBuilderConf<ACProps, ACCProps, DCProps, LCProps, ICProps, SCProps, SCCProps>) {
    return function domain(d: Partial<Domain> & {type: DomainFieldType}): Domain {
        const ddc = defaultDomainComponents(
            d.type,
            AutocompleteSimple,
            AutocompleteMultiple,
            Display,
            Label,
            Input,
            SelectSimple,
            SelectMultiple
        );
        return {...ddc, ...d};
    };
}

function defaultDomainComponents<
    ACProps,
    ACCProps,
    DCProps,
    LCProps,
    ICProps,
    SCProps,
    SCCProps,
    DT extends DomainFieldType = any
>(
    type: DT,
    AutocompleteSearch: ComponentType<ACProps> = UndefinedComponent,
    AutocompleteMultiple: ComponentType<ACCProps> = UndefinedComponent,
    Display: ComponentType<DCProps> = UndefinedComponent,
    Label: ComponentType<LCProps> = UndefinedComponent,
    Input: ComponentType<ICProps> = UndefinedComponent,
    Select: ComponentType<SCProps> = UndefinedComponent,
    SelectMultiple: ComponentType<SCCProps> = UndefinedComponent
): Omit<Domain<DT>, "type"> {
    if (type === "boolean" || type === "number" || type === "string") {
        return {
            AutocompleteComponent: AutocompleteSearch,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: Input,
            SelectComponent: Select
        };
    } else if (type === "boolean-array" || type === "number-array" || type === "string-array") {
        return {
            AutocompleteComponent: AutocompleteMultiple,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: UndefinedComponent,
            SelectComponent: SelectMultiple
        };
    } else {
        return {
            AutocompleteComponent: UndefinedComponent,
            DisplayComponent: Display,
            LabelComponent: Label,
            InputComponent: UndefinedComponent,
            SelectComponent: UndefinedComponent
        };
    }
}
