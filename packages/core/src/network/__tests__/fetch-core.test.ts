import i18next from "i18next";
import {createServer, IncomingMessage, Server, ServerResponse} from "node:http";
import {AddressInfo} from "node:net";
import {afterAll, beforeAll, beforeEach, describe, expect, test, vi} from "vitest";

import {coreConfig} from "../../config";
import {HTTPDetailedError} from "../error-parsing";
import {coreFetch} from "../fetch";
import {requestStore} from "../store";

function handleRequest(req: IncomingMessage, res: ServerResponse) {
    const url = req.url ?? "/";

    if (url === "/ok") {
        res.writeHead(200, {"content-type": "application/json"});
        res.end(JSON.stringify({ok: true}));
        return;
    }

    if (url === "/echo-accept-language") {
        res.writeHead(200, {"content-type": "application/json"});
        res.end(JSON.stringify({acceptLanguage: req.headers["accept-language"] ?? null}));
        return;
    }

    if (url === "/slow") {
        setTimeout(() => {
            res.writeHead(200, {"content-type": "application/json"});
            res.end(JSON.stringify({ok: true}));
        }, 100);
        return;
    }

    if (url === "/problem") {
        res.writeHead(400, {"content-type": "application/problem+json"});
        res.end(
            JSON.stringify({
                status: 400,
                title: "Invalid request",
                detail: "Validation failed"
            })
        );
        return;
    }

    if (url === "/json-error") {
        res.writeHead(400, {"content-type": "application/json"});
        res.end(JSON.stringify({foo: "bar"}));
        return;
    }

    if (url === "/text-error") {
        res.writeHead(500, {"content-type": "text/plain"});
        res.end("Internal error");
        return;
    }

    res.writeHead(404, {"content-type": "application/json"});
    res.end(JSON.stringify({error: "not found"}));
}

describe("coreFetch integration hooks", () => {
    let server: Server;
    let baseUrl = "";

    beforeAll(async () => {
        await i18next.init({lng: "fr", resources: {fr: {translation: {}}, de: {translation: {}}}});

        server = createServer(handleRequest);
        await new Promise<void>(resolve => {
            server.listen(0, "127.0.0.1", () => resolve());
        });

        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    });

    beforeEach(() => {
        vi.restoreAllMocks();
        coreConfig.useI18nextAcceptHeader = false;
    });

    test("ajoute Accept-Language quand useI18nextAcceptHeader est activé", async () => {
        coreConfig.useI18nextAcceptHeader = true;
        await i18next.changeLanguage("de");

        const data = await coreFetch.get(`${baseUrl}/echo-accept-language`).json<{acceptLanguage: string | null}>();

        expect(data.acceptLanguage).toContain("de");
    });

    test("n'ajoute pas Accept-Language quand useI18nextAcceptHeader est désactivé", async () => {
        coreConfig.useI18nextAcceptHeader = false;
        await i18next.changeLanguage("de");

        const data = await coreFetch.get(`${baseUrl}/echo-accept-language`).json<{acceptLanguage: string | null}>();

        expect(data.acceptLanguage).not.toContain("de");
    });

    test("démarre puis termine la requête via requestStore", async () => {
        const startSpy = vi.spyOn(requestStore, "startRequest").mockResolvedValue("req-test");
        const endSpy = vi.spyOn(requestStore, "endRequest").mockImplementation(() => undefined);

        const data = await coreFetch.get(`${baseUrl}/ok`).json<{ok: boolean}>();

        expect(data.ok).toBe(true);
        expect(startSpy).toHaveBeenCalledWith("GET", `${baseUrl}/ok`);
        expect(endSpy).toHaveBeenCalledWith("req-test");
    });

    test("n'ouvre pas de tracking si le signal est déjà annulé", async () => {
        const startSpy = vi.spyOn(requestStore, "startRequest").mockResolvedValue("req-abort");
        const controller = new AbortController();
        controller.abort();

        const request = coreFetch.get(`${baseUrl}/slow`, {signal: controller.signal}).json<{ok: boolean}>();

        await expect(request).rejects.toThrow();
        expect(startSpy).not.toHaveBeenCalled();
    });

    test("transforme application/problem+json en HTTPDetailedError", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        await expect(coreFetch.get(`${baseUrl}/problem`).json()).rejects.toBeInstanceOf(HTTPDetailedError);

        expect(consoleError).toHaveBeenCalled();
    });

    test("transforme application/json en ProblemDetails", async () => {
        const request = coreFetch.get(`${baseUrl}/json-error`).json();

        await expect(request).rejects.toMatchObject({
            details: expect.objectContaining({
                status: 400,
                type: "about:blank",
                foo: "bar"
            })
        });
    });

    test("préserve une erreur HTTP non JSON avec un message enrichi", async () => {
        await expect(coreFetch.get(`${baseUrl}/text-error`).text()).rejects.toThrow("Une erreur 500 est survenue");
    });

    test("gère une erreur réseau avec message technique", async () => {
        const endSpy = vi.spyOn(requestStore, "endRequest").mockImplementation(() => undefined);

        await expect(coreFetch.get("http://127.0.0.1:1/network-error").json()).rejects.toThrow(
            "Une erreur technique non gérée"
        );

        expect(endSpy).toHaveBeenCalled();
    });
});
