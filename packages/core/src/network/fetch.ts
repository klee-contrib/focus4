import {merge} from "es-toolkit";
import i18next from "i18next";

import {coreConfig} from "../config";

import {createProblemDetails, handleProblemDetails, isAbortError} from "./error-parsing";
import {HttpMethod, requestStore} from "./store";

/**
 * Effectue une requête HTTP avec du log et la gestion des erreurs.
 * @param method Méthode HTTP.
 * @param url L'url à requêter.
 * @param data Contient le body ainsi que l'objet à convertir en query string.
 * @param options Les options de la requête, qui surchargeront les valeurs par défaut.
 */
export async function coreFetch(
    method: HttpMethod,
    url: string,
    {body, query}: {body?: {}; query?: {}} = {},
    options: RequestInit = {}
): Promise<any> {
    const queryString = buildQueryString(query);
    url += queryString ? `${url.includes("?") ? "&" : "?"}${queryString}` : "";
    options = merge(
        {method, credentials: "include" as const},
        merge(
            merge(
                coreConfig.useI18nextAcceptHeader ? {headers: {"Accept-Language": i18next.language}} : {},
                body instanceof FormData
                    ? {body}
                    : body
                      ? {
                            headers: {
                                "Content-Type": typeof body === "object" ? "application/json" : "text/plain"
                            },
                            body: JSON.stringify(body)
                        }
                      : {}
            ),
            options
        )
    );

    // On crée la requête dans le store.
    const id = await requestStore.startRequest(method, url);

    let errorHandled = false;

    let tryCount = 0;

    // On lance la requête.
    while (tryCount <= coreConfig.retryCountOnFailedFetch) {
        tryCount++;
        try {
            const response = await window.fetch(url, options);

            // On termine la requête dans le store.
            requestStore.endRequest(id);

            if (response.status >= 200 && response.status < 300) {
                // Retour en succès.

                // On détermine le type de retour en fonction du Content-Type dans le header.
                const contentType = response.headers.get("Content-Type");
                if (contentType?.includes("application/json")) {
                    return await response.json();
                } else if (contentType?.includes("text/plain")) {
                    return await response.text();
                } else if (response.status === 204) {
                    return null; // Cas réponse vide.
                } else {
                    return response;
                }
            } else {
                // Retour en erreur
                errorHandled = true;

                // On détermine le type de retour en fonction du Content-Type dans le header.
                const contentType = response.headers.get("Content-Type");
                if (contentType?.includes("application/problem+json")) {
                    // Pour un ProblemDetails, on le parse pour récupérer les erreurs à ajouter dans le MessageStore, puis on le renvoie.
                    return await Promise.reject(handleProblemDetails(await response.json()));
                } else if (contentType?.includes("application/json")) {
                    // Pour une erreur JSON classique, on la transforme en ProblemDetails, puis on la traite comme précédemment.
                    return await Promise.reject(
                        handleProblemDetails(createProblemDetails(response.status, await response.json()))
                    );
                } else {
                    // Sinon, on renvoie le body de la réponse sous format texte (faute de mieux).
                    console.error(`Une erreur ${response.status} est survenue lors de l'appel à "${url}".`);
                    return await Promise.reject(response);
                }
            }
        } catch (error: unknown) {
            if (isAbortError(error)) {
                requestStore.endRequest(id);
                throw error;
            }

            // Requête en erreur (= pas de retour serveur).
            if (!errorHandled) {
                // On réessaie si on est en dessous du seuil de réessai.
                if (tryCount <= coreConfig.retryCountOnFailedFetch) {
                    await new Promise(r => {
                        setTimeout(r, coreConfig.retryDelayOnFailedFetch);
                    });
                } else {
                    // Sinon, on retourne une erreur technique.
                    requestStore.endRequest(id);
                    console.error(
                        `Une erreur technique non gérée est survenue lors de l'appel à "${url}" après ${tryCount} tentatives. Dernière erreur : ${
                            error as string
                        }.`
                    );
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }
}

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

    const objectUrl = await getFileObjectUrl(response);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.append(a);
    a.click();
    setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
    }, 100);
}

/** Récupère un ObjectUrl pour un fichier récupéré depuis un appel d'API. */
export async function getFileObjectUrl(response: Response) {
    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
}

/** Construit le query string associé à l'objet donné. */
function buildQueryString(obj: any, prefix = ""): string {
    let queryString = "";
    if (typeof obj === "object") {
        queryString = Object.entries(obj).reduce(
            (acc, [key, value]) =>
                acc +
                (acc && acc !== "" && !acc.endsWith("&") && value !== undefined ? "&" : "") +
                buildQueryString(value, prefix !== "" ? (Array.isArray(obj) ? prefix : `${prefix}.${key}`) : key),
            ""
        );
    } else if (prefix && prefix !== "" && obj !== undefined) {
        queryString = `${prefix}=${encodeURIComponent(obj)}`;
    }
    return queryString;
}
