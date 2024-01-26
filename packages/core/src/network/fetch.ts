/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import {isObject, merge, toPairs} from "lodash";

import {config} from "../utils";

import {ManagedErrorResponse, manageResponseErrors} from "./error-parsing";
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
        {method, credentials: "include"},
        body instanceof FormData
            ? {body}
            : body
            ? {
                  headers: {
                      "Content-Type": isObject(body) ? "application/json" : "text/plain"
                  },
                  body: JSON.stringify(body)
              }
            : {},
        options
    );

    // On crée la requête dans le store.
    const id = await requestStore.startRequest(method, url);

    let errorHandled = false;

    let tryCount = 0;

    // On lance la requête.
    while (tryCount <= config.retryCountOnFailedFetch) {
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
                if (contentType?.includes("application/json")) {
                    // Pour une erreur JSON, on la parse pour trouver et enregistrer les erreurs "attendues".
                    return await Promise.reject<ManagedErrorResponse>(
                        manageResponseErrors(response.status, await response.json())
                    );
                } else {
                    // Sinon, on renvoie le body de la réponse sous format texte (faute de mieux).
                    console.error(`Une erreur ${response.status} est survenue lors de l'appel à "${url}".`);
                    return await Promise.reject<string>(await response.text());
                }
            }
        } catch (error: unknown) {
            // Requête en erreur (= pas de retour serveur).
            if (!errorHandled) {
                // On réessaie si on est en dessous du seuil de réessai.
                if (tryCount <= config.retryCountOnFailedFetch) {
                    await new Promise(r => {
                        setTimeout(r, config.retryDelayOnFailedFetch);
                    });
                } else {
                    // Sinon, on retourne une erreur technique.
                    requestStore.endRequest(id);
                    console.error(
                        `Une erreur technique non gérée est survenue lors de l'appel à "${url}" après ${tryCount} tentatives. Dernière erreur : ${
                            error as string
                        }.`
                    );
                    return Promise.reject(error);
                }
            } else {
                return Promise.reject(error);
            }
        }
    }
}

/** Télécharge un fichier depuis une réponse d'appel d'API. */
export async function downloadFile(response: Response) {
    const disposition = response.headers.get("content-disposition") ?? "";
    let filename = "file";
    if (disposition.includes("attachment")) {
        const filenameRegex = /filename\*=UTF-8''(.+)/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) {
            filename = decodeURIComponent(matches[1]);
        }
    }

    const objectUrl = await getFileObjectUrl(response);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
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
    if (isObject(obj)) {
        queryString = toPairs(obj).reduce(
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
