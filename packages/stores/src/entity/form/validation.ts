import {isFunction} from "es-toolkit";
import {DateTime} from "luxon";
import {ZodType} from "zod";

import {FieldEntry} from "@focus4/entities";

import {
    DateValidator,
    EmailValidator,
    FunctionValidator,
    NumberValidator,
    RegexValidator,
    StringValidator,
    Validator
} from "../types";

import {BuildingFormEntityField} from "./builders";

const EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/u;

/** Récupère les erreurs associées au champ. */
export function validateField(entityField: BuildingFormEntityField<FieldEntry<Domain<ZodType>>>): string[] {
    const {
        $field: {
            domain: {schema, validator},
            isRequired,
            requiredErrorMessage = "focus.validation.required"
        },
        value
    } = entityField;

    // On vérifie que le champ n'est pas vide et obligatoire.
    if (
        isRequired &&
        (value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (schema.type === "array" && Array.isArray(value) && value.length === 0))
    ) {
        return [requiredErrorMessage];
    }

    if (value !== undefined && value !== null) {
        // On applique la validation du schéma.
        const errors = schema.safeParse(value).error?.issues.map(i => i.message) ?? [];

        // Puis les validateurs legacy.
        const validators: Validator<any>[] = Array.isArray(validator) ? validator : validator ? [validator] : [];
        for (const v of validators) {
            let error: string | false | undefined = false;
            if (isFunctionValidator(v)) {
                error = v(value);
            } else if (isRegexValidator(v) && typeof value === "string") {
                error = value && !v.regex.test(value) ? (v.errorMessage ?? "focus.validation.regex") : false;
            } else if (isEmailValidator(v) && typeof value === "string") {
                error = value && !EMAIL_REGEX.test(value) ? (v.errorMessage ?? "focus.validation.email") : false;
            } else if (isStringValidator(v)) {
                const {maxLength, minLength, errorMessage} = v;
                const text = value?.toString() ?? "";
                const isMinLength = text.length < (minLength ?? 0);
                const isMaxLength = maxLength !== undefined && text.length > maxLength;
                error = isMinLength || isMaxLength ? (errorMessage ?? "focus.validation.string") : undefined;
            } else if (isDateValidator(v)) {
                error = !DateTime.fromISO(value as string).isValid
                    ? (v.errorMessage ?? "focus.validation.date")
                    : false;
            } else if (isNumberValidator(v)) {
                const val = Number(value);

                const {min, max, errorMessage, maxDecimals} = v;
                const isMin = min !== undefined && val < min;
                const isMax = max !== undefined && val > max;
                const isDecimals = maxDecimals !== undefined && (`${val}`.split(".")[1] || "").length > maxDecimals;
                error =
                    Number.isNaN(val) || isMin || isMax || isDecimals
                        ? (errorMessage ?? "focus.validation.number")
                        : false;
            }

            if (error) {
                errors.push(error);
            }
        }

        return errors;
    }

    // Pas d'erreur.
    return [];
}

function isFunctionValidator<T>(validator: Validator<T>): validator is FunctionValidator<T> {
    return isFunction(validator);
}

function isRegexValidator(validator: Validator<any>): validator is RegexValidator {
    return Boolean((validator as RegexValidator).regex);
}

function isStringValidator(validator: Validator<any>): validator is StringValidator {
    return (validator as StringValidator).type === "string";
}

function isEmailValidator(validator: Validator<any>): validator is EmailValidator {
    return (validator as EmailValidator).type === "email";
}

function isDateValidator(validator: Validator<any>): validator is DateValidator {
    return (validator as DateValidator).type === "date";
}

function isNumberValidator(validator: Validator<any>): validator is NumberValidator {
    return (validator as NumberValidator).type === "number";
}
