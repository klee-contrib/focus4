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
    readonly type: "field";
    readonly domain?: Domain;
    readonly entityName?: string;
    readonly isRequired: boolean;
    readonly name: string;
    readonly translationKey: string;
}

export interface ListEntry {
    readonly type: "list";
    readonly entityName: string;
}

export interface Entity {
    readonly fields: {readonly [name: string]: FieldEntry | ListEntry};
    readonly name: string;
}

export interface EntityField<T> {
    readonly $entity: FieldEntry;
    value: T;
}

export interface EntityList<T> {
    readonly $entity: ListEntry;
    value: T;
}
