import {isObject, merge, toPairs} from "lodash";
import {v4} from "uuid";
import "whatwg-fetch";

import {ManagedErrorResponse, manageResponseErrors} from "./error-parsing";
import {requestStore} from "./store";

/**
 * Effectue une requête HTTP avec du log et la gestion des erreurs.
 * @param method Méthode HTTP.
 * @param url L'url à requêter.
 * @param data Contient le body ainsi que l'objet à convertir en query string.
 * @param options Les options de la requête, qui surchargeront les valeurs par défaut.
 */
export async function coreFetch(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT",
    url: string,
    {body, query}: {body?: {}; query?: {}} = {},
    options: RequestInit = {}
): Promise<any> {
    const queryString = buildQueryString(query);

    url = url + (queryString ? `${url.includes("?") ? "&" : "?"}${queryString}` : "");
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

    // On crée une première Promise autorésolue ici pour éviter de trigger une mise à jour d'état synchrone avec l'appel du fetch.
    // Ni React, ni MobX n'apprécient ça.
    const id = v4();
    await new Promise(resolve => setTimeout(resolve, 0));
    requestStore.updateRequest({id, url, status: "pending"}); // On crée la requête dans le store (= la mise à jour d'état en question).

    // On lance la requête.
    try {
        const response = await window.fetch(url, options);

        if (response.status >= 200 && response.status < 300) {
            // Retour en succès.

            // On met à jour en succès la requête dans le store.
            requestStore.updateRequest({id, url, status: "success"});

            // On détermine le type de retour en fonction du Content-Type dans le header.
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            } else if (contentType && contentType.includes("text/plain")) {
                return await response.text();
            } else if (response.status === 204) {
                return null; // Cas réponse vide.
            } else {
                return response;
            }
        } else {
            // Retour en erreur

            // On met à jour en erreur la requête dans le store.
            requestStore.updateRequest({id, url, status: "error"});

            // On détermine le type de retour en fonction du Content-Type dans le header.
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                // Pour une erreur JSON, on la parse pour trouver et enregistrer les erreurs "attendues".
                return Promise.reject<ManagedErrorResponse>(
                    manageResponseErrors(response.status, await response.json())
                );
            } else {
                // Sinon, on renvoie le body de la réponse sous format texte (faute de mieux).
                console.error(`${response.status} error when calling ${url}`);
                return Promise.reject<string>(await response.text());
            }
        }
    } catch (error) {
        // Requête en erreur (= pas de retour serveur).
        requestStore.updateRequest({id, url, status: "error"});
        console.error(`"${error.message}" error when calling ${url}`);
        return Promise.reject(error);
    }
}

/** Construit le query string associé à l'objet donné. */
function buildQueryString(obj: any, prefix = ""): string {
    let queryString = "";
    if (isObject(obj)) {
        queryString = toPairs(obj).reduce(
            (acc, [key, value]) =>
                acc +
                (acc && acc !== "" && !acc.endsWith("&") && value !== undefined ? "&" : "") +
                buildQueryString(value, prefix !== "" ? `${prefix}.${key}` : key),
            ""
        );
    } else if (prefix && prefix !== "" && obj !== undefined) {
        queryString = `${prefix}=${encodeURIComponent(obj)}`;
    }
    return queryString;
}
