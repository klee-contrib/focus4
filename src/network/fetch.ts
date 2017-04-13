import {isObject} from "lodash";
import {v4} from "uuid";
import "whatwg-fetch";

import {ManagedErrorResponse, manageResponseErrors} from "./error-parsing";
import {requestStore} from "./store";

/**
 * Effectue une requête HTTP avec du log et la gestion des erreurs.
 * @param method Méthode HTTP.
 * @param url L'url à requêter.
 * @param data Le corps du message.
 */
export async function coreFetch<RQ, RS>(method: "GET" | "POST" | "PUT" | "DELETE", url: string, data?: RQ): Promise<any> {

    // On détermine le body et les headers en fonction des entrées.
    const body = data ? JSON.stringify(data) : undefined;
    const headers = data ? {"Content-Type": isObject(data) ? "application/json" : "text/plain"} : undefined;

    // On crée la requête dans le store de requête.
    const id = v4();
    requestStore.updateRequest({id, url, status: "pending"});

    // On lance la requête.
    try {
        const response = await window.fetch(url, {method, body, headers, credentials: "include"});

        if (response.status >= 200 && response.status < 300) { // Retour en succès.

            // On met à jour en succès la requête dans le store.
            requestStore.updateRequest({id, url, status: "success"});

            // On détermine le type de retour en fonction du Content-Type dans le header.
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json() as RS;
            } else {
                return await response.text();
            }
        } else { // Retour en erreur

            // On met à jour en erreur la requête dans le store.
            requestStore.updateRequest({id, url, status: "error"});

            // On détermine le type de retour en fonction du Content-Type dans le header.
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {

                // Pour une erreur JSON, on la parse pour trouver et enregistrer les erreurs "attendues".
                return Promise.reject<ManagedErrorResponse>(manageResponseErrors(response.status, await response.json()));
            } else {

                // Sinon, on renvoie le body de la réponse sous format texte (faute de mieux).
                console.error(`${response.status} error when calling ${url}`);
                return Promise.reject<string>(await response.text());
            }
        }
    } catch (error) { // Requête en erreur (= pas de retour serveur).
        requestStore.updateRequest({id, url, status: "error"});
        console.error(`"${error.message}" error when calling ${url}`);
        return Promise.reject(error);
    }
}

/**
 * Effectue un DELETE avec du log et la gestion des erreurs.
 * @param url L'url à requêter.
 */
export async function httpDelete<RS>(url: string): Promise<RS> {
    return coreFetch("DELETE", url);
}

/**
 * Effectue un GET avec du log et la gestion des erreurs.
 * @param url L'url à requêter.
 */
export async function httpGet<RS>(url: string): Promise<RS> {
    return coreFetch("GET", url);
}

/**
 * Effectue un POST avec du log et la gestion des erreurs.
 * @param url L'url à requêter.
 * @param data Le corps du message.
 */
export async function httpPost<RQ, RS>(url: string, data: RQ): Promise<RS> {
    return coreFetch("POST", url, data);
}

/**
 * Effectue un PUT avec du log et la gestion des erreurs.
 * @param url L'url à requêter.
 * @param data Le corps du message.
 */
export async function httpPut<RQ, RS>(url: string, data: RQ): Promise<RS> {
    return coreFetch("PUT", url, data);
}
