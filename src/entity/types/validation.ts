export interface ValidationProperty {
    name: string;
    value: any;
}

export interface Error {
    errorMessage?: string;
}

export interface NumberOptions extends Error {
    min?: number;
    max?: number;
    isInteger?: boolean;
}

export interface StringOptions extends Error {
    minLength?: number;
    maxLength?: number;
}

export interface NumberValidator {
    type: "number";
    options?: NumberOptions;
}

export interface StringValidator {
    type: "string";
    options?: StringOptions;
}

export interface RegexValidator {
    type: "regex";
    value: RegExp;
    options?: Error;
}

export interface EmailValidator {
    type: "email";
    options?: Error;
}

export interface DateValidator {
    type: "date";
    options?: Error;
}

export interface FunctionValidator {
    type: "function";
    value: (param: any, options?: {isEdit?: boolean}) => boolean;
    options?: {isEdit?: boolean} & Error;
}

export type Validator = DateValidator | EmailValidator | FunctionValidator | NumberValidator | RegexValidator | StringValidator;
