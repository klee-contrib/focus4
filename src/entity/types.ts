import {ReactType} from "react";

import {Validator} from "../validation";

export interface Domain {
    formatter?: (value: any, options?: {isEdit: boolean}) => string;
    unformatter?: (text: string, options?: {isEdit: boolean}) => any;
    locale?: string;
    format?: string[];
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

export interface Field {
    type: "field";
    domain?: Domain;
    entityName?: string;
    isRequired: boolean;
    name: string;
    translationKey: string;
}

export interface List {
    type: "list";
    entityName: string;
}

export interface Entity {
    fields: {[name: string]: Field | List};
    name: string;
}

export interface EntityField<T> {
    $entity: Field;
    value: T;
}

export interface EntityList<T> {
    $entity: List;
    value: T;
}
