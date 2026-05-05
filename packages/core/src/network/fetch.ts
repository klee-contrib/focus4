import i18next from "i18next";
import ky, {isHTTPError, isNetworkError} from "ky";

import {coreConfig} from "../config";

import {
    createProblemDetails,
    handleProblemDetails,
    HTTPDetailedError,
    isAbortError,
    ProblemDetails
} from "./error-parsing";
import {HttpMethod, requestStore} from "./store";

export const coreFetch = ky.create({
    timeout: false,
    retry: {
        shouldRetry(state) {
            // Ky retry 2 fois par défaut, on limite juste le comportement aux erreurs réseaux (on ne veut pas retry pour des erreurs du serveur ou des timeouts par exemple)
            return isNetworkError(state.error);
        }
    },
    hooks: {
        beforeRequest: [
            async ({options, request}) => {
                // Override du header Accept-Language par i18next si demandé dans la config.
                if (coreConfig.useI18nextAcceptHeader) {
                    request.headers.set("Accept-Language", i18next.language);
                }

                // Enregistrement de la requête dans le RequestStore.
                if (!options.context.requestId && !options.signal?.aborted) {
                    // On ne passe dans aucun autre hook si la requête est annulée, donc on s'assure de terminer la requête dans ce cas.
                    options.signal?.addEventListener("abort", () => {
                        requestStore.endRequest(options.context.requestId as string);
                    });

                    options.context.requestId = await requestStore.startRequest(
                        request.method as HttpMethod,
                        request.url
                    );
                }
            }
        ],
        afterResponse: [
            ({options}) => {
                requestStore.endRequest(options.context.requestId as string);
            }
        ],
        beforeError: [
            async ({error, options, request, retryCount}) => {
                if (isHTTPError(error)) {
                    error.message = `Une erreur ${error.response.status} est survenue lors de l'appel à "${error.request.url}".`;

                    // On essaie de compléter cette erreur selon le type de retour en fonction du Content-Type dans le header.
                    const contentType = error.response.headers.get("Content-Type");

                    if (contentType?.includes("application/problem+json")) {
                        // Pour un ProblemDetails, on le parse pour récupérer les erreurs à ajouter dans le MessageStore, puis on le renvoie.
                        error = handleProblemDetails(error, error.data as ProblemDetails);
                    } else if (contentType?.includes("application/json")) {
                        // Pour une erreur JSON classique, on la transforme en ProblemDetails, puis on la traite comme précédemment.
                        error = handleProblemDetails(
                            error,
                            createProblemDetails(error.response.status, error.data as object)
                        );
                    }

                    if (error instanceof HTTPDetailedError) {
                        console.error("Détails :", error.details);
                    }
                } else if (!isAbortError(error)) {
                    requestStore.endRequest(options.context.requestId as string); // Pour HTTPError, le endRequest est appelé par `afterResponse`, et pour AbortError par le listener sur le signal.
                    error.message = `Une erreur technique non gérée est survenue lors de l'appel à "${request.url}" après ${retryCount + 1} tentatives.`;
                }

                return error;
            }
        ]
    }
});

/** Télécharge un fichier depuis une réponse d'appel d'API. */
export async function downloadFile(response: Response) {
    const disposition = response.headers.get("content-disposition") ?? "";
    let filename = "file";
    if (disposition.includes("attachment")) {
        const filenameRegex = /filename\*=UTF-8''(.+)/iu;
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
