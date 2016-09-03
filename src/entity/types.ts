import {ReactType} from "react";

import {Validator} from "../validation";

export interface Domain {
    formatter?: (value: any) => string;
    unformatter?: (text: string) => any;
    locale?: string;
    format?: string;
    type: string | undefined;
    validator?: Validator[];
    FieldComponent?: ReactType;
    InputLabelComponent?: ReactType;
    InputComponent?: ReactType;
    SelectComponent?: ReactType;
    TextComponent?: ReactType;
    DisplayComponent?: ReactType;
    options?: {};
}

export interface EntityField {
    domain: Domain;
    isRequired: boolean;
    name: string;
    entityName?: string;
}

export interface Entity {
    fields: {[name: string]: EntityField};
    moduleName: string;
    name: string;
}
