import i18next from "i18next";
import isNetworkError from "is-network-error";
import ky from "ky";

import {coreConfig} from "../config";

import {createProblemDetails, handleProblemDetails, HTTPDetailedError} from "./error-parsing";
import {HttpMethod, requestStore} from "./store";

export const coreFetch = ky.create({
    timeout: false,
    // On surcharge la logique par défaut de retry pour ne le faire que sur les erreurs réseau, et pour pouvoir correctement terminer la requête dans le RequestStore.
    retry: {
        limit: Infinity,
        shouldRetry(state) {
            return state.retryCount <= coreConfig.retryCountOnFailedFetch + 1 && isNetworkError(state.error);
        }
    },
    hooks: {
        beforeRequest: [
            async (req, options) => {
                // Override du header Accept-Language par i18next si demandé dans la config.
                if (coreConfig.useI18nextAcceptHeader) {
                    req.headers.set("Accept-Language", i18next.language);
                }

                // Enregistrement de la requête dans le RequestStore.
                if (!options.context.requestId) {
                    options.context.requestId = await requestStore.startRequest(req.method as HttpMethod, req.url);

                    // On ne passe dans aucun autre hook si la requête est annulée, donc on s'assure de terminer la requête dans ce cas.
                    if (options.signal) {
                        options.signal.addEventListener("abort", () => {
                            requestStore.endRequest(options.context.requestId as string);
                        });
                    }
                }
            }
        ],
        afterResponse: [
            (_, options) => {
                requestStore.endRequest(options.context.requestId as string);
            }
        ],
        beforeError: [
            async error => {
                error.message = `Une erreur ${error.response.status} est survenue lors de l'appel à "${error.request.url}".`;

                // On essaie de compléter cette erreur selon le type de retour en fonction du Content-Type dans le header.
                const contentType = error.response.headers.get("Content-Type");

                if (contentType?.includes("application/problem+json")) {
                    // Pour un ProblemDetails, on le parse pour récupérer les erreurs à ajouter dans le MessageStore, puis on le renvoie.
                    error = handleProblemDetails(error, await error.response.json());
                } else if (contentType?.includes("application/json")) {
                    // Pour une erreur JSON classique, on la transforme en ProblemDetails, puis on la traite comme précédemment.
                    error = handleProblemDetails(
                        error,
                        createProblemDetails(error.response.status, await error.response.json())
                    );
                }

                if (error instanceof HTTPDetailedError) {
                    console.error("Détails :", error.details);
                }

                return error;
            }
        ],
        beforeRetry: [
            r => {
                // On contourne un peu la mécanique de retry en lançant l'erreur nous-même une fois notre nombre de retries atteint, pour s'assurer que le RequestStore est bien mis à jour.
                if (r.retryCount >= coreConfig.retryCountOnFailedFetch + 1) {
                    requestStore.endRequest(r.options.context.requestId as string);
                    r.error.message = `Une erreur technique non gérée est survenue lors de l'appel à "${r.request.url}" après ${r.retryCount} tentatives.`;
                    throw r.error;
                }
            }
        ]
    }
});

/** Télécharge un fichier depuis une réponse d'appel d'API. */
export async function downloadFile(response: Response) {
    const disposition = response.headers.get("content-disposition") ?? "";
    let filename = "file";
    if (disposition.includes("attachment")) {
        const filenameRegex = /filename\*=UTF-8''(.+)/i;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) {
            filename = decodeURIComponent(matches[1]);
        }
    }

    const objectUrl = URL.createObjectURL(await response.blob());

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.append(a);
    a.click();
    setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(objectUrl);
    }, 100);
}
