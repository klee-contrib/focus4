export interface InputFacet {
    key: string;
    value: string;
}

export interface FacetValue {
    code: string;
    label: string;
    count: number;
}

export interface OutputFacet {
    [facet: string]: FacetValue[];
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
    groups?: {[name: string]: T[]}[];
    facets: OutputFacet[];
    totalCount: number;
    query: QueryInput;
}

export interface UnscopedQueryOutput {
    facets: OutputFacet[];
    groups: {[name: string]: {}[]}[];
    totalCount: number;
    query: QueryInput;
}
