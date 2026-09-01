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
    test.each([
        ["string", "test", "test"],
        ["number", "25", 25],
        ["boolean", "true", true],
        ["boolean", "false", false],
        ["boolean", "invalid", Number.NaN],
        ["string", undefined, undefined]
    ] as const)("convertit %s depuis %s en %s", (type, input, expected) => {
        const object = {value: undefined};
        const map = buildQueryMap({value: type}, object);

        expect(map.value(input)).toEqual(expected);
        expect(object.value).toEqual(expected);
    });
});
