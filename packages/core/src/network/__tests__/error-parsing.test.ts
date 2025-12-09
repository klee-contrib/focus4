import {HTTPError, NormalizedOptions} from "ky";
import {beforeEach, describe, expect, test} from "vitest";

import {messageStore} from "../../stores/message";
import {
    createProblemDetails,
    handleProblemDetails,
    HTTPDetailedError,
    isAbortError,
    ProblemDetails
} from "../error-parsing";

/**
 * Crée un HTTPError réel pour les tests sans mocks.
 */
function createHTTPError(status: number, url: string = "https://example.com/api"): HTTPError {
    const response = new Response(JSON.stringify({error: "test"}), {
        status,
        statusText: "Error",
        headers: {"Content-Type": "application/json"}
    });
    const request = new Request(url);
    const options: NormalizedOptions = {
        method: "GET",
        retry: {},
        prefixUrl: "",
        onDownloadProgress: () => {},
        onUploadProgress: () => {},
        context: {}
    };

    return new HTTPError(response, request, options);
}

describe("error-parsing", () => {
    beforeEach(() => {
        // Réinitialiser le messageStore avant chaque test
        const store = messageStore as any;
        store.messages.clear();
    });

    describe("createProblemDetails", () => {
        test("Crée un ProblemDetails avec les valeurs par défaut", () => {
            const jsonResponse = {message: "Une erreur est survenue"};
            const result = createProblemDetails(404, jsonResponse);

            expect(result).toEqual({
                message: "Une erreur est survenue",
                type: "about:blank",
                status: 404
            });
        });

        test("Préserve les propriétés existantes du jsonResponse", () => {
            const jsonResponse = {
                type: "custom-type",
                title: "Erreur personnalisée",
                detail: "Détails de l'erreur",
                customField: "valeur"
            };
            const result = createProblemDetails(500, jsonResponse);

            expect(result.type).toBe("custom-type");
            expect(result.title).toBe("Erreur personnalisée");
            expect(result.detail).toBe("Détails de l'erreur");
            expect(result.customField).toBe("valeur");
            expect(result.status).toBe(500);
        });

        test("Écrase le type si déjà présent", () => {
            const jsonResponse = {type: "existing-type"};
            const result = createProblemDetails(400, jsonResponse);

            expect(result.type).toBe("existing-type");
            expect(result.status).toBe(400);
        });
    });

    describe("handleProblemDetails", () => {
        test("Traite un ProblemDetails avec seulement detail", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                detail: "Erreur de validation"
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result).toBeInstanceOf(HTTPDetailedError);
            expect(result.details).toEqual(problemDetails);
            expect(result.$messages).toHaveLength(1);
            expect(result.$messages[0]).toEqual({
                type: "error",
                message: "Erreur de validation"
            });
            expect(messageStore.getLatestMessage("error")?.label).toBe("Erreur de validation");
        });

        test("Traite un ProblemDetails avec title uniquement (sans detail)", () => {
            const error = createHTTPError(404);
            const problemDetails: ProblemDetails = {
                status: 404,
                title: "Ressource non trouvée"
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result).toBeInstanceOf(HTTPDetailedError);
            expect(result.details).toEqual(problemDetails);
            expect(result.$messages).toHaveLength(1);
            expect(result.$messages[0]).toEqual({
                type: "error",
                message: "Ressource non trouvée"
            });
            expect(messageStore.getLatestMessage("error")?.label).toBe("Ressource non trouvée");
        });

        test("N'ajoute pas title si des messages ont déjà été ajoutés", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                title: "Titre",
                detail: "Détail"
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(1);
            expect(result.$messages[0].message).toBe("Détail");
            expect(messageStore.getLatestMessage("error")?.label).toBe("Détail");
        });

        test("Traite un ProblemDetails avec errors comme string", () => {
            const error = createHTTPError(422);
            const problemDetails: ProblemDetails = {
                status: 422,
                errors: "Erreur globale"
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(1);
            expect(result.$messages[0]).toEqual({
                type: "error",
                message: "Erreur globale"
            });
        });

        test("Traite un ProblemDetails avec errors comme string[]", () => {
            const error = createHTTPError(422);
            const problemDetails: ProblemDetails = {
                status: 422,
                errors: ["Erreur 1", "Erreur 2", "Erreur 3"]
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(3);
            expect(result.$messages[0].message).toBe("Erreur 1");
            expect(result.$messages[1].message).toBe("Erreur 2");
            expect(result.$messages[2].message).toBe("Erreur 3");
        });

        test("Traite un ProblemDetails avec errors comme Record<string, string>", () => {
            const error = createHTTPError(422);
            const problemDetails: ProblemDetails = {
                status: 422,
                errors: {
                    email: "Email invalide",
                    password: "Mot de passe trop court",
                    global: "Erreur globale"
                }
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(3);
            expect(result.$messages.find(m => m.message === "email: Email invalide")).toBeDefined();
            expect(result.$messages.find(m => m.message === "password: Mot de passe trop court")).toBeDefined();
            expect(result.$messages.find(m => m.message === "Erreur globale")).toBeDefined();
        });

        test("Traite un ProblemDetails avec errors comme Record<string, string[]>", () => {
            const error = createHTTPError(422);
            const problemDetails: ProblemDetails = {
                status: 422,
                errors: {
                    email: "Email invalide",
                    globals: "Erreur globale"
                }
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(2);
            expect(result.$messages.find(m => m.message === "email: Email invalide")).toBeDefined();
            expect(result.$messages.find(m => m.message === "Erreur globale")).toBeDefined();
        });

        test("Traite des champs personnalisés comme string", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                warning: "Avertissement personnalisé",
                info: "Information personnalisée"
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(2);
            expect(
                result.$messages.find(m => m.type === "warning" && m.message === "Avertissement personnalisé")
            ).toBeDefined();
            expect(
                result.$messages.find(m => m.type === "info" && m.message === "Information personnalisée")
            ).toBeDefined();
        });

        test("Traite des champs personnalisés comme string[]", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                success: ["Succès 1", "Succès 2"]
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(2);
            expect(result.$messages.filter(m => m.type === "success")).toHaveLength(2);
        });

        test("Traite des champs personnalisés comme Record<string, string>", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                warning: {
                    field1: "Avertissement 1",
                    global: "Avertissement global"
                }
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(2);
            expect(result.$messages.find(m => m.message === "field1: Avertissement 1")).toBeDefined();
            expect(result.$messages.find(m => m.message === "Avertissement global")).toBeDefined();
        });

        test("Traite des champs personnalisés comme Record<string, string[]>", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                info: {
                    field1: ["Info 1", "Info 2"],
                    globals: "Info globale"
                }
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(3);
            expect(result.$messages.find(m => m.message === "field1: Info 1")).toBeDefined();
            expect(result.$messages.find(m => m.message === "field1: Info 2")).toBeDefined();
            expect(result.$messages.find(m => m.message === "Info globale")).toBeDefined();
        });

        test("Ignore les champs standards (type, status, title, detail, instance)", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                type: "about:blank",
                status: 400,
                title: "Titre",
                detail: "Détail",
                instance: "/api/endpoint",
                errors: "Erreur"
            };

            const result = handleProblemDetails(error, problemDetails);

            // Seul errors et detail devraient être traités
            expect(result.$messages).toHaveLength(2);
            expect(result.$messages.find(m => m.message === "Détail")).toBeDefined();
            expect(result.$messages.find(m => m.message === "Erreur")).toBeDefined();
        });

        test("Ignore les tableaux vides", () => {
            const error = createHTTPError(400);
            const problemDetails: ProblemDetails = {
                status: 400,
                errors: []
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.$messages).toHaveLength(0);
        });

        test("Préserve les propriétés de l'erreur HTTP originale", () => {
            const error = createHTTPError(500, "https://api.example.com/users");
            const problemDetails: ProblemDetails = {
                status: 500,
                detail: "Erreur serveur"
            };

            const result = handleProblemDetails(error, problemDetails);

            expect(result.response).toBe(error.response);
            expect(result.request).toBe(error.request);
            expect(result.options).toBe(error.options);
            expect(result.message).toBe(error.message);
        });
    });

    describe("HTTPDetailedError", () => {
        test("Hérite correctement de HTTPError", () => {
            const error = createHTTPError(404);
            const problemDetails: ProblemDetails = {
                status: 404,
                title: "Not Found"
            };
            const messages = [{type: "error", message: "Not Found"}];

            const detailedError = new HTTPDetailedError(error, problemDetails, messages);

            expect(detailedError).toBeInstanceOf(HTTPError);
            expect(detailedError).toBeInstanceOf(HTTPDetailedError);
            expect(detailedError.details).toEqual(problemDetails);
            expect(detailedError.$messages).toEqual(messages);
        });

        test("Préserve toutes les propriétés de l'erreur originale", () => {
            const error = createHTTPError(500, "https://example.com/test");
            const problemDetails: ProblemDetails = {
                status: 500,
                detail: "Internal Server Error"
            };
            const messages = [{type: "error", message: "Internal Server Error"}];

            const detailedError = new HTTPDetailedError(error, problemDetails, messages);

            expect(detailedError.response).toBe(error.response);
            expect(detailedError.request).toBe(error.request);
            expect(detailedError.options).toBe(error.options);
            expect(detailedError.message).toBe(error.message);
        });
    });

    describe("isAbortError", () => {
        test("Retourne true pour un DOMException AbortError", () => {
            const abortError = new DOMException("The operation was aborted.", "AbortError");

            expect(isAbortError(abortError)).toBe(true);
        });

        test("Retourne false pour un DOMException avec un autre nom", () => {
            const otherError = new DOMException("Other error", "NetworkError");

            expect(isAbortError(otherError)).toBe(false);
        });

        test("Retourne false pour une Error standard", () => {
            const standardError = new Error("Standard error");

            expect(isAbortError(standardError)).toBe(false);
        });

        test("Retourne false pour un HTTPError", () => {
            const httpError = createHTTPError(400);

            expect(isAbortError(httpError)).toBe(false);
        });

        test("Retourne false pour null", () => {
            expect(isAbortError(null)).toBe(false);
        });

        test("Retourne false pour undefined", () => {
            expect(isAbortError(undefined)).toBe(false);
        });

        test("Retourne false pour un objet simple", () => {
            expect(isAbortError({name: "AbortError"})).toBe(false);
        });
    });
});
