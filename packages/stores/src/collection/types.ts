import {EntityToType, FormNodeBuilder} from "../entity";

/** Définition d'un service de recherche. */
export type SearchService<T = any, C = {}> = (query: QueryInput<C>, options?: RequestInit) => Promise<QueryOutput<T>>;

/** Définition d'une facette côté client. */
export interface LocalFacetDefinition<T> {
    /** Code de la facette. */
    code: string;
    /** Libellé de la facette. */
    label: string;
    /** Champ de l'objet sur lequel facetter. */
    fieldName: keyof T;
    /** Type de tri pour les valeurs de facettes. Par défaut : "count-desc". */
    ordering?: "count-asc" | "count-desc" | "key-asc" | "key-desc";
    /** Facette multisélectionnable. */
    isMultiSelectable?: boolean;
    /** Possibilité d'exclure des valeurs. */
    canExclude?: boolean;
    /** Mise en forme de la valeur pour affichage (ex: liste de référence, date...) */
    displayFormatter?: (value: string) => string;
}

/** Config pour un store de collection local. */
export interface LocalStoreConfig<T> {
    /** Liste des champs disponibles pour le filtrage par champ texte. */
    searchFields?: (string & keyof T)[];
    /** Définitions de facettes. */
    facetDefinitions?: LocalFacetDefinition<T>[];
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

/** Définition de tri. */
export interface SortInput {
    /** Champ sur lequel trier. */
    fieldName: string;
    /** Tri descendant. */
    sortDesc?: boolean;
}

/** Critères génériques de recherche. */
export interface SearchProperties<NC = any> {
    /** Critère personnalisé. */
    criteria?: EntityToType<NoInfer<NC>>;
    /** Champ sur lequel grouper. */
    groupingKey?: string;
    /** Champ texte. */
    query?: string;
    /** Liste des champs sur lesquels le champ texte filtre (si non renseigné : tous les champs disponibles). */
    searchFields?: string[];
    /** Facettes sélectionnées. */
    inputFacets?: {[facet: string]: FacetInput};
    /** Définitions de tri, par ordre d'application. */
    sort?: SortInput[];
    /** Nombre de résultats à retourner par requête. */
    top?: number;
}

/** Initialisation du CollectionStore */
export interface CollectionStoreInitProperties<C = any, NC = C> extends SearchProperties<NC> {
    /**
     * Mode de prise en compte de l'objet de critère :
     *
     * - `direct` : La mise à jour d'un critère lance la recherche immédiatement (valeur par défaut)
     * - `debounced` : La mise à jour d'un critère lance la recherche après un petit délai (comme pour `query`)
     * - `manual` : Les critères ne seront appliqués que via un appel explicite à `search()`.
     */
    criteriaMode?: "debounced" | "direct" | "manual";
    /** Configurateur pour le formulaire de critères. */
    criteriaBuilder?: (s: FormNodeBuilder<C, C>) => FormNodeBuilder<NC, C>;
    /** Délai entre la saisie du texte et la recherche dans la barre de recherche. Par défaut : 500ms. */
    textSearchDelay?: number;
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
        readonly selected?: readonly string[];
        /** Valeurs de la facette à exclure. */
        readonly excluded?: readonly string[];
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
    /** Définitions de tri, par ordre d'application. */
    sort?: SortInput[];
    /** Nombre de résultats à sauter. */
    skip?: number;
    /** Token pour la pagination, à utiliser à la place de `skip` */
    skipToken?: string;
    /** Nombre de résulats à retourner. */
    top: number;
}

/** Objet retour d'une recherche. */
export interface QueryOutput<T = any> {
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
    /** Token à utiliser pour la pagination. */
    skipToken?: string;
}
