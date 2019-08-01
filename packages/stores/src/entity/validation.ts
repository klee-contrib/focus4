import i18next from "i18next";
import {isFunction} from "lodash";
import moment from "moment";

import {DateValidator, EmailValidator, NumberValidator, RegexValidator, StringValidator, Validator} from "./types";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/** Récupère l'erreur associée au champ. Si la valeur vaut `undefined`, alors il n'y en a pas. */
export function validateField<T>(
    value: T,
    isRequired: boolean,
    validator?: Validator<T> | Validator<T>[]
): string | undefined {
    // On vérifie que le champ n'est pas vide et obligatoire.
    if (isRequired && (value === undefined || value === null || (typeof value === "string" && value.trim() === ""))) {
        return i18next.t("focus.validation.required");
    }

    // On applique le validateur du domaine.
    if (validator && value !== undefined && value !== null) {
        const errors = validate(value, Array.isArray(validator) ? validator : [validator]);
        if (errors.length) {
            return errors.map(e => i18next.t(e)).join(", ");
        }
    }

    // Pas d'erreur.
    return undefined;
}

/**
 * Valide une propriété avec les validateurs fournis et retourne la liste des erreurs.
 * @param value La valeur à valider.
 * @param validators Les validateurs.
 */
function validate<T>(value: T, validators?: Validator<T>[]) {
    const errors: string[] = [];
    if (validators) {
        for (const validator of validators) {
            let error: string | false | undefined = false;
            if (isFunction(validator)) {
                error = validator(value);
            } else if (isRegexValidator(validator) && typeof value === "string") {
                error =
                    value && !validator.regex.test(value) ? validator.errorMessage || "focus.validation.regex" : false;
            } else if (isEmailValidator(validator) && typeof value === "string") {
                error = value && !EMAIL_REGEX.test(value) ? validator.errorMessage || "focus.validation.email" : false;
            } else if (isStringValidator(validator)) {
                const {maxLength, minLength, errorMessage} = validator;
                const text = `${value || ""}`;
                const isMinLength = text.length < (minLength || 0);
                const isMaxLength = maxLength !== undefined && text.length > maxLength;
                error = isMinLength || isMaxLength ? errorMessage || "focus.validation.string" : undefined;
            } else if (isDateValidator(validator)) {
                error = !moment(value, moment.ISO_8601).isValid()
                    ? validator.errorMessage || "focus.validation.date"
                    : false;
            } else if (isNumberValidator(validator)) {
                const val = typeof value === "number" ? value : parseFloat(value as any);

                const {min, max, errorMessage, maxDecimals} = validator;
                const isMin = min !== undefined && val < min;
                const isMax = max !== undefined && val > max;
                const isDecimals = maxDecimals !== undefined && (`${val}`.split(".")[1] || "").length > maxDecimals;
                error =
                    Number.isNaN(val) || isMin || isMax || isDecimals
                        ? errorMessage || "focus.validation.number"
                        : false;
            }

            if (error) {
                errors.push(error);
            }
        }
    }

    return errors;
}

export function isRegexValidator(validator: Validator<any>): validator is RegexValidator {
    return !!(validator as RegexValidator).regex;
}

export function isStringValidator(validator: Validator<any>): validator is StringValidator {
    return (validator as StringValidator).type === "string";
}

export function isEmailValidator(validator: Validator<any>): validator is EmailValidator {
    return (validator as EmailValidator).type === "email";
}

export function isDateValidator(validator: Validator<any>): validator is DateValidator {
    return (validator as DateValidator).type === "date";
}

export function isNumberValidator(validator: Validator<any>): validator is NumberValidator {
    return (validator as NumberValidator).type === "number";
}
