import {Validator} from "./validation";

/** Définition de base d'un domaine. */
export interface Domain {
    [key: string]: any;

    /** Formatteur pour l'affichage du champ (en édition ou non) */
    formatter?: (value: any, options?: {isEdit: boolean}) => string;

    /** Formatteur inverse pour convertir l'affichage du champ en la valeur. (en édition ou non) */
    unformatter?: (text: string, options?: {isEdit: boolean}) => any;

    /** Liste des validateurs. */
    validator?: Validator[];

    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: ReactComponent<any>;

    /** Composant personnalisé de champ, remplace les trois autres. */
    FieldComponent?: ReactComponent<any>;

    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: ReactComponent<any>;

    /** Composant personnalisé pour le libellé. */
    LabelComponent?: ReactComponent<any>;

    /** Classe CSS pour le champ. */
    className?: string;
}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry {
    readonly type: "field";

    /** Domaine du champ. N'est pas renseigné pour un objet composé. */
    readonly domain?: Domain;

    /** Entité de l'entrée pour un objet composé. */
    readonly entityName?: string;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Identifiant unique de l'entrée. */
    readonly translationKey: string;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entityName: string;
}

/** Définition d'une entité. */
export interface Entity {

    /** Liste des champs de l'entité. */
    readonly fields: {readonly [name: string]: FieldEntry | ListEntry};

    /** Nom de l'entité. */
    readonly name: string;
}

/** Entrée de type "field" pour une entité. */
export interface EntityField<T> {

    /** Métadonnées. */
    readonly $entity: FieldEntry;

    /** Valeur. */
    value: T;
}

/** Entrée de type "list" pour une entité. */
export interface EntityList<T> {

    /** Métadonnées. */
    readonly $entity: ListEntry;

    /** Valeur. */
    value: T;
}
