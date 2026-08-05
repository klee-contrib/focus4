import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {RequestStore} from "../store";

describe("RequestStore", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("startRequest ajoute une requête en cours puis endRequest la retire", async () => {
        const store = new RequestStore();

        const requestIdPromise = store.startRequest("GET", "https://example.org/users");
        await vi.runAllTimersAsync();
        const requestId = await requestIdPromise;

        expect(store.loading).toBe(true);
        expect(store.pending).toHaveLength(1);
        expect(store.pending[0]).toEqual({
            id: requestId,
            method: "GET",
            url: "https://example.org/users"
        });

        store.endRequest(requestId);

        expect(store.loading).toBe(false);
        expect(store.pending).toHaveLength(0);
    });

    test("track enregistre puis supprime le suivi même en cas de callback", async () => {
        const store = new RequestStore();
        let resolveFetch: (value: number) => void = () => undefined;
        const fetchPromise = new Promise<number>(resolve => {
            resolveFetch = resolve;
        });
        const callback = vi.fn();

        const tracked = store.track(["users", "users", "details"], () => fetchPromise, callback);
        await vi.runAllTimersAsync();

        expect(store.isLoading("users")).toBe(true);
        expect(store.isLoading("details")).toBe(true);
        expect(store.getPendingCount("users")).toBe(1);

        resolveFetch(42);
        const value = await tracked;

        expect(value).toBe(42);
        expect(callback).toHaveBeenCalledWith(42);
        expect(store.isLoading("users")).toBe(false);
        expect(store.isLoading("details")).toBe(false);
        expect(store.getPendingCount("users")).toBe(0);
    });

    test("track supprime le suivi en cas d'erreur", async () => {
        const store = new RequestStore();
        const error = new Error("boom");

        const tracked = store.track("users", async () => {
            throw error;
        });
        const rejection = expect(tracked).rejects.toBe(error);
        await vi.runAllTimersAsync();

        await rejection;
        expect(store.isLoading("users")).toBe(false);
        expect(store.getPendingCount("users")).toBe(0);
    });
});
