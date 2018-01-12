import {isArray} from "lodash";

import {messageStore} from "../message";

/** Format attendu des erreurs JSON issues du serveur. */
export interface ErrorResponse {
    [key: string]: any;
    status: number;
    type?: string;
    fieldErrors?: Record<string, string>;
}

/** Erreur JSON issue du serveur, à laquelle on a ajouté des infos issues du parsing. */
export interface ManagedErrorResponse {
    [key: string]: any;
    /** Erreurs détectées dans l'erreur serveur. */
    $parsedErrors: {
        /** Erreurs globales. */
        globals: string[];
        /** Erreurs sur des champs en particulier. */
        fields?: Record<string, string>;
    };
    /** Statut HTTP de la réponse. */
    $status: number;
}

const globalErrorTypes = {
    errors: "error",
    globalErrorMessages: "error",
    globalErrors: "error",
    globalInfoMessages: "error",
    globalInfos: "error",
    globalSuccess: "success",
    globalSuccessMessages: "success",
    globalWarningMessages: "warning",
    globalWarnings: "warning"
};

const errorTypes = {
    collection: "collection",
    composite: "composite",
    entity: "entity"
};

/**
 * Parse les erreurs de champ dans une erreur serveur.
 * @param response Erreur serveur.
 */
function treatFieldErrors(response: ErrorResponse) {
    if ([400, 401, 422].find(x => x === response.status) && response.type || errorTypes.entity === errorTypes.entity) {
        return response.fieldErrors || {};
    } else {
        return undefined;
    }
}

/**
 * Parse les erreurs globales dans une erreur serveur.
 * @param response Erreur serveur.
 */
function treatGlobalErrors(response: ErrorResponse) {
    let globals: string[] = [];
    Object.keys(globalErrorTypes)
        .forEach((errorName: keyof typeof globalErrorTypes) => {
            const messages: string[] = response[errorName];
            if (isArray(messages)) {
                globals = [...globals, ...messages];

                // On enregistre chaque message dans le store de messages.
                messages.forEach(content => messageStore.addMessage({type: globalErrorTypes[errorName] as "info", content}));
            }
        });
    return globals;
}

/**
 * Parse une réponse du serveur pour enregistrer les erreurs.
 * @param $status Statut HTTP de la réponse.
 * @param response Corps de la réponse.
 */
export function manageResponseErrors($status: number, response: ErrorResponse): ManagedErrorResponse {
    return {
        ...response,
        $status,
        $parsedErrors: {
            fields: treatFieldErrors(response),
            globals: treatGlobalErrors(response)
        }
    };
}
