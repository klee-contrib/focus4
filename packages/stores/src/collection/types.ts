import {EntityToType} from "../entity";

/** Définition d'un service de recherche. */
export type SearchService<T = any, C = {}> = (query: QueryInput<C>) => Promise<QueryOutput<T, C>>;

/** Config pour un store de collection local. */
export interface LocalStoreConfig<T> {
    /** Liste des champs disponibles pour le filtrage par champ texte. */
    searchFields?: (keyof T & string)[];
    /** Définitions de facettes. */
    facetDefinitions?: {
        /** Code de la facette. */
        code: string;
        /** Libellé de la facette. */
        label: string;
        /** Champ de l'objet sur lequel facetter. */
        fieldName: keyof T;
        /** Type de tri pour les valeurs de facettes. Par défaut : "count-desc". */
        ordering?: "key-asc" | "key-desc" | "count-asc" | "count-desc";
        /** Mise en forme de la valeur pour affichage (ex: liste de référence, date...) */
        displayFormatter?: (value: string) => string;
    }[];
}

/** Statut de la séléection */
export type SelectionStatus = "none" | "partial" | "selected";

/** Facette entrée de recherche. */
export interface FacetInput {
    /** Opérateur utilisé entre les différentes valeurs. */
    operator?: "and" | "or";
    /** Valeurs de la facette à prendre. */
    selected?: string[];
    /** Valeurs de la facette à exclure. */
    excluded?: string[];
}

/** Critères génériques de recherche. */
export interface SearchProperties<C = any> {
    /** Critère personnalisé. */
    criteria?: EntityToType<C>;
    /** Champ sur lequel grouper. */
    groupingKey?: string;
    /** Champ texte. */
    query?: string;
    /** Liste des champs sur lesquels le champ texte filtre (si non renseigné : tous les champs disponibles). */
    searchFields?: string[];
    /** Facettes sélectionnées. */
    inputFacets?: {[facet: string]: FacetInput};
    /** Tri croissant. */
    sortAsc?: boolean;
    /** Champ sur lequel trier. */
    sortBy?: string;
    /** Nombre de résultats à retourner par requête. */
    top?: number;
}

/** Valeur de facette. */
export interface FacetItem {
    /** Code de la valeur de facette. */
    code: string;
    /** Libellé de la valeur de facette. */
    label: string;
    /** Nombre de résultats pour la valeur de facette. */
    count: number;
}

/** Facette résultat de recherche. */
export interface FacetOutput {
    /** Code de la facette. */
    code: string;
    /** Libellé de la facette. */
    label: string;
    /** Précise si la facette est multi-sélectionnable. */
    isMultiSelectable: boolean;
    /** Précise si la facette peut avoir plusieurs valeurs. */
    isMultiValued: boolean;
    /** Précise s'il est possible d'exclure des valeurs. */
    canExclude: boolean;
    /** Valeurs de la facette. */
    values: FacetItem[];
}

/** Groupe résultat de recherche. */
export interface GroupResult<T = any> {
    /** Code du groupe. */
    code: string;
    /** Libellé du groupe. */
    label: string;
    /** Liste de résultats du groupe. */
    list: T[];
    /** Nombre d'éléments totaux du groupe. */
    totalCount: number;
}

/** Type readonly décrivant la sélection de facettes. */
export interface InputFacets {
    readonly [facet: string]: {
        /** Opérateur utilisé entre les différentes valeurs. */
        readonly operator?: "and" | "or";
        /** Valeurs de la facette à prendre. */
        readonly selected?: ReadonlyArray<string>;
        /** Valeurs de la facette à exclure. */
        readonly excluded?: ReadonlyArray<string>;
    };
}

/** Objet d'entrée pour la recherche. */
export interface QueryInput<C = {}> {
    /** Facettes sélectionnées. */
    facets?: InputFacets;
    /** Critère de recherche. */
    criteria?: C & {query: string; searchFields?: string[]};
    /** Champ sur lequel grouper. */
    group: string;
    /** Champ sur lequel trier. */
    sortFieldName?: string;
    /** Sens du tri. */
    sortDesc: boolean;
    /** Nombre de résultats à sauter. */
    skip: number;
    /** Nombre de résulats à retourner. */
    top: number;
}

/** Objet retour d'une recherche. */
export interface QueryOutput<T = any, C = {}> {
    /** Liste de résultats, si pas de groupes. */
    list?: T[];
    /** Groupes de résultats. */
    groups?: GroupResult<T>[];
    /** Facettes trouvées. */
    facets: FacetOutput[];
    /** Champs de recherche disponibles. */
    searchFields?: string[];
    /** Nombre total de résultat. */
    totalCount: number;
    /** Entrée. */
    query: QueryInput<C>;
}
