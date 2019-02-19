import i18next from "i18next";
import {isNull, isNumber, isUndefined} from "lodash";
import moment from "moment";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export interface ValidationProperty {
    name: string;
    value: any;
}

export interface TrKey {
    translationKey?: string;
}

export interface NumberOptions extends TrKey {
    min?: number;
    max?: number;
    isInteger?: boolean;
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

export type Validator =
    | DateValidator
    | EmailValidator
    | FunctionValidator
    | NumberValidator
    | RegexValidator
    | StringValidator;

/**
 * Vérifie que le texte est une date.
 * @param text Le texte.
 */
export function dateValidator(text: string) {
    return moment(text, moment.ISO_8601).isValid();
}

/**
 * Vérifie que le texte est un email.
 * @param text Le texte.
 */
export function emailValidator(text: string) {
    return EMAIL_REGEX.test(text);
}

/**
 * Vérifie que le texte est un nombre.
 * @param text Le texte.
 * @param options Les options du validateur.
 */
export function numberValidator(text: string, options?: NumberOptions) {
    if (isUndefined(text) || isNull(text)) {
        return true;
    }
    if (typeof text === "string" && text.trim() !== text) {
        return false;
    }
    const n = +text;
    if (isNaN(n) || !isNumber(n)) {
        return false;
    }

    if (!options) {
        return true;
    }

    if (options.isInteger && !Number.isInteger(n)) {
        return false;
    }

    const isMin = options.min !== undefined ? n >= options.min : true;
    const isMax = options.max !== undefined ? n <= options.max : true;
    return isMin && isMax;
}

/**
 * Vérifie que le texte est un string valide.
 * @param text Le texte.
 * @param options Les options du validateur.
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

function getErrorLabel(type: string, options?: TrKey): string {
    return i18next.t(options && options.translationKey ? options.translationKey : `focus.validation.${type}`);
}

/**
 * Valide une propriété avec un validateur.
 * @param property La propriété à valider.
 * @param validator Le validateur à utiliser.
 */
function validateProperty(property: ValidationProperty, validator: Validator) {
    const {value} = property;
    const isValid = (() => {
        switch (validator.type) {
            case "regex":
                if (!value) {
                    return true;
                }
                return validator.value.test(value);
            case "email":
                if (!value) {
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
        console.warn(`Le validateur de type : ${validator.type} n'existe pas.`);
    } else if (!isValid) {
        return getErrorLabel(validator.type, validator.options);
    }

    return undefined;
}

/**
 * Valide une propriété avec les validateurs fournis et retourne le status de validation.
 * @param property La propriété à valider.
 * @param validators Les validateurs.
 */
export function validate(property: ValidationProperty, validators?: Validator[]) {
    const errors: string[] = [];
    if (validators) {
        for (const validator of validators) {
            const res = validateProperty(property, validator);
            if (res !== undefined) {
                errors.push(res);
            }
        }
    }

    return {
        errors,
        isValid: errors.length === 0,
        name: property.name,
        value: property.value
    };
}
