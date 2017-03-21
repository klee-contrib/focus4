import {Validator} from "./validation";

/** Définition de base d'un domaine. */
export interface Domain {
    [key: string]: any;
    formatter?: (value: any, options?: {isEdit: boolean}) => string;
    unformatter?: (text: string, options?: {isEdit: boolean}) => any;
    validator?: Validator[];
    DisplayComponent?: ReactComponent<any>;
    FieldComponent?: ReactComponent<any>;
    InputComponent?: ReactComponent<any>;
    LabelComponent?: ReactComponent<any>;
    className?: string;
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry {
    readonly type: "field";
    readonly domain?: Domain; // N'est pas renseigné pour un objet composé.
    readonly entityName?: string; // Est renseigné pour un objet composé.
    readonly isRequired: boolean;
    readonly name: string;
    readonly translationKey: string;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry {
    readonly type: "list";
    readonly entityName: string;
}

/** Définition d'une entité. */
export interface Entity {
    readonly fields: {readonly [name: string]: FieldEntry | ListEntry};
    readonly name: string;
}

/** Entrée de type "field" pour une entité. */
export interface EntityField<T> {
    readonly $entity: FieldEntry;
    value: T;
}

/** Entrée de type "list" pour une entité. */
export interface EntityList<T> {
    readonly $entity: ListEntry;
    value: T;
}
