export interface FacetItem {
    code: string;
    label: string;
    count: number;
}

export interface FacetOutput {
    code: string;
    label: string;
    values: FacetItem[];
}

export interface GroupResult<T> {
    code?: string;
    label?: string;
    list: T[];
    totalCount?: number;
}

export interface QueryInput {
    facets: {[facet: string]: string};
    criteria: {query: string, scope: string};
    group: string;
    sortFieldName?: string;
    sortDesc: boolean;
    skip: number;
    top: number;
}

export interface QueryOutput<T> {
    list?: T[];
    groups?: GroupResult<T>[];
    facets: FacetOutput[];
    totalCount: number;
    query: QueryInput;
}

export interface UnscopedQueryOutput {
    groups: GroupResult<{}>[];
    facets: FacetOutput[];
    totalCount: number;
    query: QueryInput;
}
