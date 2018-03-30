import {DisplayProps} from "../../components/display";
import {InputProps} from "../../components/input";
import {LabelProps} from "../../components/label";
import {ReactComponent} from "../../config";

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

/** Définition de base d'un domaine. */
export interface Domain<ICProps = InputProps, DCProps = DisplayProps, LCProps = LabelProps> extends DomainNoDefault<ICProps, DCProps, LCProps> {}

/** Métadonnées d'une entrée de type "field" pour une entité. */
export interface FieldEntry<T = any, D extends DomainNoDefault = DomainNoDefault> {
    readonly type: "field";

    /** @internal */
    readonly fieldType?: T;

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
export interface ObjectEntry<T = object> {
    readonly type: "object";

    /** Entité de l'entrée */
    readonly entity: Entity<T>;
}

/** Métadonnées d'une entrée de type "list" pour une entité. */
export interface ListEntry<T = object> {
    readonly type: "list";

    /** Entité de l'entrée */
    readonly entity: Entity<T>;
}

/** Définition d'une entité. */
export interface Entity<T = any> {

    /** Nom de l'entité. */
    readonly name: string;

    /** Liste des champs de l'entité. */
    readonly fields: {
        readonly [P in keyof T]-?:
            T[P] extends StoreType ? FieldEntry<T[P]>
            : T[P] extends (infer Q)[] ? ListEntry<Q>
            : ObjectEntry<T[P]>
    };
}

/** Types possible pour le `T` de `EntityField<T>`. */
export type StoreType = number | number[] | boolean | boolean[] | string | string[];

/** Entrée de type "field" pour une entité. */
export interface EntityField<T = StoreType, D extends DomainNoDefault = DomainNoDefault> {

    /** Métadonnées. */
    readonly $field: FieldEntry<D>;

    /** Erreur de validation du champ (FormNode uniquement). */
    readonly error?: string | undefined;

    /** Précise si le champ associé est en édition ou non. */
    isEdit?: boolean;

    /** Valeur. */
    value: T | undefined;
}
