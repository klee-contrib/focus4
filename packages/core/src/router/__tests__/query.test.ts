import {describe, expect, test} from "vitest";

import {buildQueryMap, buildQueryString, parseSearchString} from "../query";

describe("buildQueryString", () => {
    test("retourne une chaîne vide pour un objet vide", () => {
        expect(buildQueryString({})).toBe("");
    });

    test("construit une query string simple", () => {
        expect(buildQueryString({name: "test"})).toBe("?name=test");
    });

    test("construit une query string avec plusieurs paramètres", () => {
        expect(buildQueryString({name: "test", age: "25"})).toBe("?name=test&age=25");
    });

    test("ignore les valeurs undefined", () => {
        expect(buildQueryString({name: "test", age: undefined})).toBe("?name=test");
    });

    test("encode les valeurs", () => {
        expect(buildQueryString({name: "test value"})).toBe("?name=test%20value");
    });

    test("gère les nombres", () => {
        expect(buildQueryString({age: 25})).toBe("?age=25");
    });

    test("gère les booléens", () => {
        expect(buildQueryString({active: true})).toBe("?active=true");
    });
});

describe("parseSearchString", () => {
    test("parse une query string simple", () => {
        expect(parseSearchString("?name=test")).toEqual({name: "test"});
    });

    test("parse plusieurs paramètres", () => {
        expect(parseSearchString("?name=test&age=25")).toEqual({name: "test", age: "25"});
    });

    test("gère les query strings sans ?", () => {
        expect(parseSearchString("name=test")).toEqual({name: "test"});
    });

    test("gère les valeurs vides", () => {
        expect(parseSearchString("?name=&age=25")).toEqual({name: "", age: "25"});
    });
});

describe("buildQueryMap", () => {
    test("construit une map pour les query params string", () => {
        const query = {name: "string" as const};
        const object = {name: undefined};
        const map = buildQueryMap(query, object);

        map.name("test");
        expect(object.name).toBe("test");
    });

    test("construit une map pour les query params number", () => {
        const query = {age: "number" as const};
        const object = {age: undefined};
        const map = buildQueryMap(query, object);

        map.age("25");
        expect(object.age).toBe(25);
    });

    test("construit une map pour les query params boolean", () => {
        const query = {active: "boolean" as const};
        const object = {active: undefined};
        const map = buildQueryMap(query, object);

        map.active("true");
        expect(object.active).toBe(true);

        map.active("false");
        expect(object.active).toBe(false);
    });

    test("gère les valeurs undefined", () => {
        const query = {name: "string" as const};
        const object = {name: "test"};
        const map = buildQueryMap(query, object);

        map.name(undefined);
        expect(object.name).toBeUndefined();
    });

    test("retourne NaN pour boolean invalide", () => {
        const query = {active: "boolean" as const};
        const object = {active: undefined};
        const map = buildQueryMap(query, object);

        const result = map.active("invalid");
        expect(Number.isNaN(result)).toBe(true);
    });
});
