import {describe, expect, test, vi} from "vitest";

import {NodeLoadBuilder} from "../load-builder";

describe("NodeLoadBuilder", () => {
    test("params() sans argument retourne un tableau vide", () => {
        const builder = new NodeLoadBuilder().params();

        expect(builder.getLoadParams?.()).toEqual([]);
    });

    test("params() accepte une fonction", () => {
        const getter = vi.fn(() => [1, "abc"] as const);
        const builder = new NodeLoadBuilder().params(getter);

        expect(builder.getLoadParams?.()).toEqual([1, "abc"]);
        expect(getter).toHaveBeenCalledTimes(1);
    });

    test("params() accepte une valeur fixe", () => {
        const builder = new NodeLoadBuilder().params(["x", 2] as const);

        expect(builder.getLoadParams?.()).toEqual(["x", 2]);
    });

    test("load() enregistre le service", () => {
        const service = vi.fn(async () => ({ok: true}));
        const builder = new NodeLoadBuilder().params().load(service);

        expect(builder.loadService).toBe(service);
    });

    test("on() gère un évènement unique", () => {
        const handler = vi.fn((_event: "load", _data: unknown) => undefined);
        const builder = new NodeLoadBuilder().on("load", handler);

        expect(builder.handlers.load).toHaveLength(1);
        expect(builder.handlers.load?.[0]).toBe(handler);
    });

    test("on() gère plusieurs évènements et cumule les handlers", () => {
        const h1 = vi.fn((_event: "load" | "error", _data: unknown, _error: unknown) => undefined);
        const h2 = vi.fn((_event: "load", _data: unknown) => undefined);
        const builder = new NodeLoadBuilder();

        builder.on(["load", "error"], h1).on("load", h2);

        expect(builder.handlers.load).toHaveLength(2);
        expect(builder.handlers.error).toHaveLength(1);
        expect(builder.handlers.load?.[0]).toBe(h1);
        expect(builder.handlers.load?.[1]).toBe(h2);
    });

    test("trackingId() enregistre tous les ids", () => {
        const builder = new NodeLoadBuilder().trackingId("a", "b", "c");

        expect(builder.trackingIds).toEqual(["a", "b", "c"]);
    });
});
