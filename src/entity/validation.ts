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
            } else if (typeof value === "string") {
                const sValidator = validator as Validator<string>;

                if (isRegexValidator(sValidator)) {
                    error =
                        value && !sValidator.regex.test(value)
                            ? sValidator.errorMessage || "focus.validation.regex"
                            : false;
                } else if (isEmailValidator(sValidator)) {
                    error =
                        value && !EMAIL_REGEX.test(value) ? sValidator.errorMessage || "focus.validation.email" : false;
                } else if (isStringValidator(sValidator)) {
                    const {maxLength, minLength, errorMessage} = sValidator;
                    const text = `${value || ""}`;
                    const isMinLength = text.length < (minLength || 0);
                    const isMaxLength = maxLength !== undefined && text.length > maxLength;
                    error = isMinLength || isMaxLength ? errorMessage || "focus.validation.string" : undefined;
                } else if (isDateValidator(sValidator)) {
                    error = !moment(value, moment.ISO_8601).isValid()
                        ? sValidator.errorMessage || "focus.validation.date"
                        : false;
                }
            } else if (typeof value === "number") {
                const numberValidator = validator as Validator<number>;

                if (isNumberValidator(numberValidator)) {
                    const {min, max, errorMessage, maxDecimals} = numberValidator;
                    const isMin = min !== undefined && value < min;
                    const isMax = max !== undefined && value > max;
                    const isDecimals =
                        maxDecimals !== undefined && (`${value}`.split(".")[1] || "").length <= maxDecimals;
                    error = isMin || isMax || isDecimals ? errorMessage || "focus.validation.number" : false;
                    break;
                }
            }

            if (error) {
                errors.push(error);
            }
        }
    }

    return errors;
}

export function isRegexValidator(validator: Validator<string>): validator is RegexValidator {
    return !!(validator as RegexValidator).regex;
}

export function isStringValidator(validator: Validator<string>): validator is StringValidator {
    return (validator as StringValidator).type === "string";
}

export function isEmailValidator(validator: Validator<string>): validator is EmailValidator {
    return (validator as EmailValidator).type === "email";
}

export function isDateValidator(validator: Validator<string>): validator is DateValidator {
    return (validator as DateValidator).type === "date";
}

export function isNumberValidator(validator: Validator<number>): validator is NumberValidator {
    return (validator as NumberValidator).type === "number";
}
