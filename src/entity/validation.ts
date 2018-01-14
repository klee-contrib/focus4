import i18next from "i18next";
import {isNull, isNumber, isUndefined, values} from "lodash";
import {computed, extendObservable, observable} from "mobx";
import moment from "moment";

import {EntityField, Error, isEntityField, isStoreListNode, isStoreNode, NumberOptions, StringOptions, ValidationProperty, Validator} from "./types";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Vérifie que le texte est une date.
 * @param text Le texte.
 */
export function dateValidator(text: string) {
    return moment(text, moment.ISO_8601)
        .isValid();
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

    text = `${text || ""}`;
    const isMinLength = text.length >= (options.minLength || 0);
    const isMaxLength = options.maxLength !== undefined ? text.length <= options.maxLength : true;
    return isMinLength && isMaxLength;
}

function getErrorLabel(type: string, options?: Error): string {
    return i18next.t(options && options.errorMessage ? options.errorMessage : `focus.validation.${type}`);
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
function validate(property: ValidationProperty, validators?: Validator[]) {
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

 /** Récupère l'erreur associée au champ. Si la valeur vaut `undefined`, alors il n'y en a pas. */
function validateField({$field, value}: EntityField): string | undefined {
    const {isRequired, label = ""} = $field;
    const {validator} = $field.domain;

    // On vérifie que le champ n'est pas vide et obligatoire.
    if (isRequired && (value as any) !== 0 && !value) {
        return i18next.t("focus.validation.required");
    }

    // On applique le validateur du domaine.
    if (validator && value !== undefined && value !== null) {
        const validStat = validate({value, name: i18next.t(label)}, validator);
        if (validStat.errors.length) {
            return i18next.t(validStat.errors.join(", "));
        }
    }

    // Pas d'erreur.
    return undefined;
}

/** Ajoute les champs calculés de validation sur un StoreNode. */
export function addErrorFields(data: any) {
    if (isStoreListNode(data)) {
        data.forEach(addErrorFields);
        (data as any).form = observable({
            isValid: computed(() => data.every(node => !node.form || node.form.isValid))
        });
    } else if (isStoreNode(data)) {
        for (const entry in data) {
            addErrorFields(data[entry as keyof typeof data]);
        }
        (data as any).form = observable({
            isValid: computed(() =>
                values(data)
                    .every(item => {
                        if (isEntityField(item)) {
                            return !item.error;
                        } else if (isStoreNode(item)) {
                            return !item.form || item.form.isValid;
                        } else {
                            return true;
                        }
                    })
                )
            });
    } else if (data.$field) {
        extendObservable(data, {error: computed(() => validateField(data))});
    }
}
