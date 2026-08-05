import {describe, expect, test} from "vitest";

import {themeable} from "../themeable";

type ThemeInput = Record<string, string | undefined | (() => string)>;
type ThemeObject = Record<string, string>;

describe("themeable", () => {
    test("fusionne des classes sans doublons", () => {
        const result = themeable({root: "a b"}, {root: "b c"});

        expect(result).toEqual({root: "a b c"});
    });

    test("ignore les clés undefined et fonctions", () => {
        const result = themeable(
            {
                root: "base",
                helper: () => "x"
            } as unknown as ThemeObject,
            {
                root: "addon",
                helper: () => "y",
                optional: undefined
            } as unknown as ThemeObject
        );

        expect(result).toEqual({root: "base addon"});
    });

    test("ajoute les nouvelles clés du mixin", () => {
        const result = themeable({root: "a"}, {item: "b"} as unknown as ThemeObject);

        expect(result).toEqual({root: "a", item: "b"});
    });

    test("préserve les clés existantes si mixin vide", () => {
        const result = themeable({root: "a"}, {} as ThemeInput as unknown as ThemeObject);

        expect(result).toEqual({root: "a"});
    });

    test("retire les classes vides pendant la fusion", () => {
        const result = themeable({root: "a  "}, {root: " b  "});

        expect(result).toEqual({root: "a b"});
    });
});
