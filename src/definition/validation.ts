import {isNull, isNumber, isUndefined} from "lodash";
import moment from "moment";

import {translate} from "../translation";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export interface ValidationProperty {
    modelName: string;
    name: string;
    value: string;
}

export interface TrKey {
    translationKey?: string;
}

export interface NumberOptions extends TrKey {
    min?: number;
    max?: number;
}

export interface StringOptions extends TrKey {
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

export interface RequiredValidator {
    type: "required";
    value: boolean;
    options?: TrKey;
}

export interface RegexValidator {
    type: "regex";
    value: RegExp;
    options?: TrKey;
}

export interface EmailValidator {
    type: "email";
    options?: TrKey;
}

export interface DateValidator {
    type: "date";
    options?: TrKey;
}

export interface FunctionValidator {
    type: "function";
    value: (param: any, options?: {isEdit?: boolean}) => boolean;
    options?: {isEdit?: boolean} & TrKey;
}

export type Validator = DateValidator | EmailValidator | FunctionValidator | NumberValidator | RegexValidator | RequiredValidator | StringValidator;

/**
 * Returns true is the date is valid, false otherwise.
 * @param text The date to validate.
 */
export function dateValidator(text: string) {
    return moment(text).isValid();
}

/**
 * Returns true is the email is valid, false otherwise.
 * @param text The email to validate.
 */
export function emailValidator(text: string) {
    return EMAIL_REGEX.test(text);
}

/**
 * Returns true is the number is valid, false otherwise.
 * @param numberToValidate  The number to validate.
 * @param options           The validator options.
 */
export function numberValidator(text: string, options?: NumberOptions) {
    if (isUndefined(text) || isNull(text)) {
        return true;
    }
    let n = +text;
    if (isNaN(n) || !isNumber(n)) {
        return false;
    }

    if (!options) {
        return true;
    }

    let isMin = options.min !== undefined ? n >= options.min : true;
    let isMax = options.max !== undefined ? n <= options.max : true;
    return isMin && isMax;
}

/**
 * Returns true is the string is valid, false otherwise.
 * @param text The number to validate.
 * @param options The validator options.
 */
export function stringValidator(text: string, options?: StringOptions) {
    if (!options) {
        return true;
    }
    options.minLength = options.minLength || 0;
    const isMinLength = options.minLength !== undefined ? text.length >= options.minLength : true;
    const isMaxLength = options.maxLength !== undefined ? text.length <= options.maxLength : true;
    return isMinLength && isMaxLength;
}

/**
 * Validate a property with given validators and returns the validation status.
 * @param property      Property to validate.
 * @param validators    The validators to apply on the property.
 */
export function validate(property: ValidationProperty, validators?: Validator[]) {
    let errors: string[] = [];
    if (validators) {
        for (const validator of validators) {
            const res = validateProperty(property, validator);
            if (res !== undefined) {
                errors.push(res);
            }
        }
    }

    return {
        name: property.name,
        value: property.value,
        isValid: 0 === errors.length,
        errors
    };
}

/**
 * Validate a property.
 * @param property  - The property to validate.
 * @param validator - The validator to apply.
 */
function validateProperty(property: ValidationProperty, validator: Validator) {
    const {value} = property;
    const isValueNullOrUndefined = isNull(value) || isUndefined(value);
    const isValid = (() => {
        switch (validator.type) {
            case "required":
                const prevalidString = "" === property.value ? false : true;
                return true === validator.value ? (!isNull(value) && !isUndefined(value) && prevalidString) : true;
            case "regex":
                if (isValueNullOrUndefined) {
                    return true;
                }
                return validator.value.test(value);
            case "email":
                if (isValueNullOrUndefined) {
                    return true;
                }
                return emailValidator(value);
            case "number":
                return numberValidator(value, validator.options);
            case "string":
                return stringValidator(value || "", validator.options);
            case "date":
                return dateValidator(value);
            case "function":
                return validator.value(value, validator.options);
            default:
                return undefined;
        }
    })();

    if (isValid === undefined) {
        console.warn(`The validator of type: ${validator.type} is not defined`);
    } else if (isValid === false) {
        return getErrorLabel(validator.type, property.modelName + "." + property.name, validator.options);
    }

    return undefined;
}

function getErrorLabel(type: string, fieldName: string, options?: TrKey): string {
    return translate(options && options.translationKey ? options.translationKey : `domain.validation.${type}`);
}
