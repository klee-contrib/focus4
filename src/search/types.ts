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

export interface QueryInput<C> {
    facets: {[facet: string]: string};
    criteria: C & {query: string, scope: string};
    group: string;
    sortFieldName?: string;
    sortDesc: boolean;
    skip: number;
    top: number;
}

export interface QueryOutput<T, C> {
    list?: T[];
    groups?: GroupResult<T>[];
    facets: FacetOutput[];
    totalCount: number;
    query: QueryInput<C>;
}

export interface UnscopedQueryOutput<C> {
    groups: GroupResult<{}>[];
    facets: FacetOutput[];
    totalCount: number;
    query: QueryInput<C>;
}
