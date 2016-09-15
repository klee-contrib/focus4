import {ReactComponent} from "../defaults";
import {Validator} from "../validation";

export interface Domain {
    formatter?: (value: any, options?: {isEdit: boolean}) => string;
    unformatter?: (text: string, options?: {isEdit: boolean}) => any;
    validator?: Validator[];
    DisplayComponent?: ReactComponent<any>;
    FieldComponent?: ReactComponent<any>;
    InputComponent?: ReactComponent<any>;
    LabelComponent?: ReactComponent<any>;
}

export interface FieldEntry {
    type: "field";
    domain?: Domain;
    entityName?: string;
    isRequired: boolean;
    name: string;
    translationKey: string;
}

export interface ListEntry {
    type: "list";
    entityName: string;
}

export interface Entity {
    fields: {[name: string]: FieldEntry | ListEntry};
    name: string;
}

export interface EntityField<T> {
    $entity: FieldEntry;
    value: T;
}

export interface EntityList<T> {
    $entity: ListEntry;
    value: T;
}
