export interface BaseValidator {
    /** Surcharge du message d'erreur standard `focus.validation.${type}` */
    errorMessage?: string;
}

export interface NumberValidator extends BaseValidator {
    type: "number";
    min?: number;
    max?: number;
    maxDecimals?: number;
}

export interface StringValidator extends BaseValidator {
    type: "string";
    minLength?: number;
    maxLength?: number;
}

export interface RegexValidator extends BaseValidator {
    regex: RegExp;
}

export interface EmailValidator extends BaseValidator {
    type: "email";
}

export interface DateValidator extends BaseValidator {
    type: "date";
}

export type FunctionValidator<T> = (value: T) => string | false | undefined;

export type Validator<T> = T extends string
    ? DateValidator | EmailValidator | RegexValidator | StringValidator | FunctionValidator<string>
    : T extends number
    ? NumberValidator | FunctionValidator<number>
    : FunctionValidator<T>;
