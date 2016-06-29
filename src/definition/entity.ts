import {Domain} from "./";

export interface EntityField {
    domain: Domain;
    isRequired: boolean;
    name: string;
}

export interface Entity<T> {
    fields: {[name: string]: EntityField};
    moduleName: string;
    name: string;
    type: T;
}
