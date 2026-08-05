import {describe, expect, test} from "vitest";

import {buildQueryMap, buildQueryString, parseSearchString} from "../query";

describe("buildQueryString", () => {
    test.each([
        [{}, ""],
        [{name: "test"}, "?name=test"],
        [{name: "test", age: "25"}, "?name=test&age=25"],
        [{name: "test", age: undefined}, "?name=test"],
        [{name: "test value"}, "?name=test%20value"],
        [{age: 25}, "?age=25"],
        [{active: true}, "?active=true"]
    ])("%o -> %s", (input, expected) => {
        expect(buildQueryString(input as any)).toBe(expected);
    });
});

describe("parseSearchString", () => {
    test.each([
        ["?name=test", {name: "test"}],
        ["?name=test&age=25", {name: "test", age: "25"}],
        ["name=test", {name: "test"}],
        ["?name=&age=25", {name: "", age: "25"}]
    ])("%s -> %o", (input, expected) => {
        expect(parseSearchString(input)).toEqual(expected);
    });
});

describe("buildQueryMap", () => {
    test("construit une map pour les query params string", () => {
        const object: {name: string | undefined} = {name: undefined};
        const map = buildQueryMap({name: "string" as const}, object);

        map.name("test");
        expect(object.name).toBe("test");
    });

    test("construit une map pour les query params number", () => {
        const object: {age: number | undefined} = {age: undefined};
        const map = buildQueryMap({age: "number" as const}, object);

        map.age("25");
        expect(object.age).toBe(25);
    });

    test("construit une map pour les query params boolean", () => {
        const object: {active: boolean | undefined} = {active: undefined};
        const map = buildQueryMap({active: "boolean" as const}, object);

        map.active("true");
        expect(object.active).toBe(true);

        map.active("false");
        expect(object.active).toBe(false);
    });

    test("gère les valeurs undefined", () => {
        const object: {name: string | undefined} = {name: "test"};
        const map = buildQueryMap({name: "string" as const}, object);

        map.name(undefined);
        expect(object.name).toBeUndefined();
    });

    test("retourne NaN pour boolean invalide", () => {
        const object: {active: boolean | undefined} = {active: undefined};
        const map = buildQueryMap({active: "boolean" as const}, object);

        expect(Number.isNaN(map.active("invalid"))).toBe(true);
    });
});
