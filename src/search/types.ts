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

/** Objet d'entrée pour la recherche. */
export interface QueryInput<C = {}> {
    /** Facettes sélectionnées. */
    facets?: {[facet: string]: string};
    /** Critère de recherche. */
    criteria?: C & {query: string};
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
    /** Nombre total de résultat. */
    totalCount: number;
    /** Entrée. */
    query: QueryInput<C>;
}
