import {DisplayProps, InputProps, LabelProps} from "../components";
import {ReactComponent} from "../config";

import {Validator} from "./validation";

/** Définition de base d'un domaine, sans valeurs par défaut (sinon ça pose problème avec les EntityField). */
export interface DomainNoDefault<ICProps = any, DCProps = any, LCProps = any> {
    /** Classe CSS pour le champ. */
    className?: string;

    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: any) => string;

    /** Formatteur pour l'affichage du champ en édition. */
    inputFormatter?: (value: any) => string;

    /** Formatteur inverse pour convertir l'affichage du champ en la valeur (édition uniquement) */
    unformatter?: (text: string) => any;

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

/** Définition de base d'un domaine. */
export interface Domain<ICProps = InputProps, DCProps = DisplayProps, LCProps = LabelProps> extends DomainNoDefault<ICProps, DCProps, LCProps> {}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<D extends DomainNoDefault = DomainNoDefault> {
    readonly type: "field";

    /** Domaine du champ. */
    readonly domain: D;

    /** Champ obligatoire. */
    readonly isRequired: boolean;

    /** Nom de l'entrée. */
    readonly name: string;

    /** Libellé de l'entrée. */
    readonly label: string;

    /** Commentaire de l'entrée */
    readonly comment?: string;
}

/** Métadonnées d'une entrée de type "object" pour une entité. */
export interface ObjectEntry {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entityName: string;
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
    readonly fields: {readonly [name: string]: FieldEntry | ObjectEntry | ListEntry};

    /** Nom de l'entité. */
    readonly name: string;
}

/** Types possible pour le `T` de `EntityField<T>`. */
export type StoreType = number | number[] | boolean | boolean[] | string | string[];

/** Entrée de type "field" pour une entité. */
export interface EntityField<T = StoreType, D extends DomainNoDefault = DomainNoDefault> {

    /** Métadonnées. */
    readonly $field: FieldEntry<D>;

    /** Valeur. */
    value: T | undefined;
}
