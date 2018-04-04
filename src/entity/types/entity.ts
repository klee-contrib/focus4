import {DisplayProps} from "../../components/display";
import {InputProps} from "../../components/input";
import {LabelProps} from "../../components/label";
import {ReactComponent} from "../../config";

import {Validator} from "./validation";

/** Définition d'un domaine. */
export interface Domain<ICProps extends {theme?: {}} = InputProps, DCProps extends {theme?: {}} = DisplayProps, LCProps = LabelProps> {
    /** Classe CSS pour le champ. */
    className?: string;

    /** Formatteur pour l'affichage du champ en consulation. */
    displayFormatter?: (value: any) => string;

    /** Formatteur pour l'affichage du champ en édition. */
    inputFormatter?: (value: any) => string;

    /** Formatteur inverse pour convertir l'affichage du champ en la valeur (édition uniquement) */
    unformatter?: (text: string) => any;

    /** Liste des validateurs. */
    validator?: Validator | Validator[];

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

/** Définition générale d'une entité. */
export interface Entity {
    /** Nom de l'entité. */
    readonly name: string;

    /** Liste des champs de l'entité. */
    readonly fields: {[key: string]: FieldEntry<any, any, any, any> | ObjectEntry | ListEntry};
}

/** Enumération des types primitifs possibles dans entité, à partir desquels on construira les champs. */
export type StoreType = number | number[] | boolean | boolean[] | string | string[];

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<T = StoreType, ICProps extends {theme?: {}} = InputProps, DCProps extends {theme?: {}} = DisplayProps, LCProps = LabelProps> {
    readonly type: "field";

    /** Type du champ. */
    readonly fieldType: T;

    /** Domaine du champ. */
    readonly domain: Domain<ICProps, DCProps, LCProps>;

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
export interface ObjectEntry<T extends Entity = any> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: T;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<T extends Entity = any> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: T;
}

/** Génère le type associé à une entité, avec toutes ses propriétés en optionnel. */
export type EntityToType<T extends Entity> = {
    [P in keyof T["fields"]]?:
        T["fields"][P] extends FieldEntry<any, any, any, any> ? T["fields"][P]["fieldType"]
        : T["fields"][P] extends ObjectEntry<infer U> ? EntityToType<U>
        : T["fields"][P] extends ListEntry<infer U> ? EntityToType<U>[]
        : never
};

/** Définition de champ dans un store. */
export interface EntityField<F extends FieldEntry<any, any, any, any> = FieldEntry> {

    /** Métadonnées. */
    readonly $field: F;

    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error?: string | undefined;

    /** Précise si le champ associé est en édition ou non. */
    isEdit?: boolean;

    /** Valeur. */
    value: F["fieldType"] | undefined;
}
