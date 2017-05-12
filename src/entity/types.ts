import {DisplayTextProps} from "focus-components/input-display/text";
import {InputTextProps} from "focus-components/input-text";
import {LabelProps} from "focus-components/label";

import {Validator} from "./validation";

export interface BaseDisplayProps<T> {
    formattedInputValue?: string | number;
    rawInputValue?: T;
    value?: T;
}

export interface BaseInputProps<T> {
    error?: string | null;
    formattedInputValue?: string | number;
    labelKey?: string;
    name?: string;
    onChange?: (value: T) => void;
    rawInputValue?: T;
    valid?: boolean;
    value?: T;
    valueKey?: string;
    values?: any[];
}

/** Définition de base d'un domaine. */
export interface DomainNoDefault<ICProps = {}, DCProps = {}, LCProps = {}> {
    /** Classe CSS pour le champ. */
    className?: string;

    /** Formatteur pour l'affichage du champ (en édition ou non) */
    formatter?: (value: any, options?: {isEdit: boolean}) => string;

    /** Formatteur inverse pour convertir l'affichage du champ en la valeur. (en édition ou non) */
    unformatter?: (text: string, options?: {isEdit: boolean}) => any;

    /** Liste des validateurs. */
    validator?: Validator[];

    /** Composant personnalisé pour l'affichage. */
    DisplayComponent?: ReactComponent<DCProps>;
    /** Props pour le composant d'affichage */
    displayProps?: Partial<DCProps>;

    /** Composant personnalisé pour l'entrée utilisateur. */
    InputComponent?: ReactComponent<ICProps>;
    /** Props pour le composant d'entrée utilisateur. */
    inputProps?: Partial<ICProps>;

    /** Composant personnalisé pour le libellé. */
    LabelComponent?: ReactComponent<LCProps>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<LCProps>;
}

export interface Domain<ICProps extends BaseInputProps<any> = Partial<InputTextProps>, DCProps extends BaseDisplayProps<any> = Partial<DisplayTextProps>, LCProps = Partial<LabelProps>> extends DomainNoDefault<ICProps, DCProps, LCProps> {}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<DCProps = {}, ICProps = {}, LCProps = {}> {
    readonly type: "field";

    /** Domaine du champ. N'est pas renseigné pour un objet composé. */
    readonly domain?: Domain<DCProps, ICProps, LCProps>;

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
export interface EntityField<T, D extends DomainNoDefault = {}> {

    /** Métadonnées. */
    readonly $entity: FieldEntry<D["displayProps"], D["inputProps"], D["labelProps"]>;

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
