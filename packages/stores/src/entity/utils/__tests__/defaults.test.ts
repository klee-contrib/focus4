import {describe, expect, test} from "vitest";
import z from "zod";

import {getDefaultFormatter, UndefinedComponent} from "../defaults";

describe("default entity helpers", () => {
    test("fournit le composant vide", () => {
        const undefinedComponent = UndefinedComponent;
        expect(undefinedComponent()).toBeNull();
    });

    test.each([
        {schema: z.boolean(), expected: "focus.boolean"},
        {schema: z.iso.date(), expected: "focus.date"},
        {schema: z.iso.datetime(), expected: "focus.datetime"}
    ])("retourne le formatter Focus pour $expected", ({schema, expected}) => {
        expect(getDefaultFormatter(schema)).toBe(expected);
    });

    test.each([z.number(), z.int()])("retourne des options numériques stables", schema => {
        const formatter = getDefaultFormatter(schema);

        expect(formatter).toEqual({});
        expect(getDefaultFormatter(schema)).toBe(formatter);
    });

    test("retourne un formatter texte pour les autres schémas", () => {
        const formatter = getDefaultFormatter(z.string());

        expect(typeof formatter).toBe("function");
        if (typeof formatter === "function") {
            expect(formatter(42)).toBe("42");
            expect(formatter(null)).toBe("");
        }
    });
});
