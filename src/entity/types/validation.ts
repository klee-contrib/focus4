export interface Error {
    /** Surcharge du message d'erreur standard `focus.validation.${type}` */
    errorMessage?: string;
}

export interface NumberValidator extends Error {
    type: "number";
    min?: number;
    max?: number;
    isInteger?: boolean;
}

export interface StringValidator extends Error {
    type: "string";
    minLength?: number;
    maxLength?: number;
}

export interface RegexValidator extends Error {
    regex: RegExp;
}

export interface EmailValidator extends Error {
    type: "email";
}

export interface DateValidator extends Error {
    type: "date";
}

export interface LegacyFunctionValidator extends Error {
    type: "function";
    value: (text: any) => boolean;
    options: {
        translationKey: string;
    };
}

export type FunctionValidator = (value: any) => string | false| undefined;

export type Validator = DateValidator | EmailValidator | FunctionValidator | NumberValidator | RegexValidator | StringValidator | LegacyFunctionValidator;
