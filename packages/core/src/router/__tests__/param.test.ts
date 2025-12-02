import {describe, expect, test} from "vitest";

import {param} from "../param";

describe("param", () => {
    test("crée un paramètre string par défaut", () => {
        const result = param("id", b => b.string());
        expect(result[0]).toBe("id");
        expect(result[1].type).toBe("string");
        expect(result[1].required).toBe(false);
    });

    test("crée un paramètre number par défaut", () => {
        const result = param("id", b => b.number());
        expect(result[0]).toBe("id");
        expect(result[1].type).toBe("number");
        expect(result[1].required).toBe(false);
    });

    test("crée un paramètre string requis", () => {
        const result = param("id", b => b.string(true));
        expect(result[0]).toBe("id");
        expect(result[1].type).toBe("string");
        expect(result[1].required).toBe(true);
    });

    test("crée un paramètre number requis", () => {
        const result = param("id", b => b.number(true));
        expect(result[0]).toBe("id");
        expect(result[1].type).toBe("number");
        expect(result[1].required).toBe(true);
    });

    test("accepte une suite de route", () => {
        const next = {posts: {}};
        const result = param("userId", b => b.string(), next);
        expect(result[2]).toBe(next);
    });
});
