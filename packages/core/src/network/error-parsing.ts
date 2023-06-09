import {messageStore} from "../stores/message";

/** Format attendu des erreurs JSON issues du serveur. */
export interface ErrorResponse {
    [key: string]: any;
    status: number;
}

/** Erreur JSON issue du serveur, à laquelle on a ajouté des infos issues du parsing. */
export interface ManagedErrorResponse {
    [key: string]: any;
    /** Erreurs détectées dans l'erreur serveur. */
    $parsedErrors: {
        /** Erreurs globales. */
        globals: string[];
    };
    /** Statut HTTP de la réponse. */
    $status: number;
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
            globals: messageStore.addMessages(response)
        }
    };
}
