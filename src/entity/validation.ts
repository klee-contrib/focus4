import i18next from "i18next";
import {isFunction, isNumber} from "lodash";
import moment from "moment";

import {EntityField, isRegex, Validator} from "./types";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/** Récupère l'erreur associée au champ. Si la valeur vaut `undefined`, alors il n'y en a pas. */
export function validateField({$field, value}: EntityField): string | undefined {
    const {isRequired, domain: {validator}} = $field;

    // On vérifie que le champ n'est pas vide et obligatoire.
    if (isRequired && value !== 0 && !value) {
        return i18next.t("focus.validation.required");
    }

    // On applique le validateur du domaine.
    if (validator && value !== undefined && value !== null) {
        const errors = validate(value, Array.isArray(validator) ? validator : [validator]);
        if (errors.length) {
            return errors.map(e =>  i18next.t(e))
                .join(", ");
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
function validate(value: any, validators?: Validator[]) {
    const errors: string[] = [];
    if (validators) {
        for (const validator of validators) {
            let error;
            if (isFunction(validator)) {
                error = validator(value);
            } else  {
                if (isRegex(validator)) {
                    error = value && !validator.regex.test(value);
                } else {
                    switch (validator.type) {
                        case "email":
                            error = value && !EMAIL_REGEX.test(value);
                            break;
                        case "number":
                            if (value === undefined || value === null) {
                                break;
                            }
                            const n = +value;
                            if (Number.isNaN(n) || !isNumber(n) || validator.isInteger && !Number.isInteger(n)) {
                                error = true;
                            }
                            const isMin = validator.min !== undefined && n < validator.min;
                            const isMax = validator.max !== undefined && n > validator.max;
                            error = isMin || isMax;
                            break;
                        case "string":
                            const text = `${value || ""}`;
                            const isMinLength = text.length < (validator.minLength || 0);
                            const isMaxLength = validator.maxLength !== undefined && text.length > validator.maxLength;
                            error = isMinLength || isMaxLength;
                            break;
                        case "date":
                            error = !moment(value, moment.ISO_8601)
                                .isValid();
                            break;
                        case "function":
                            error = !validator.value(value) && validator.options.translationKey;
                            break;
                    }
                }

                if (error === true) {
                    error = validator.errorMessage || `focus.validation.${isRegex(validator) ? "regex" : validator.type}`;
                }
            }

            if (error) {
                errors.push(error as string); // bug TS (!!)
            }
        }
    }

    return errors;
}
