import i18next from "i18next";
import {beforeAll, describe, expect, test} from "vitest";
import z from "zod";

import {domain} from "../../../__tests__/test-utils";
import {ReferenceList} from "../../../reference/types";
import {makeField} from "../field";
import {stringFor} from "../string-for";

interface Item {
    code: string;
    label: string;
}

function makeReferenceList(): ReferenceList<Item, "code", "label"> {
    return Object.assign([{code: "a", label: "Alpha"}], {
        $labelKey: "label" as const,
        $valueKey: "code" as const,
        getLabel: (value: string) => (value === "a" ? "Alpha" : undefined)
    }) as ReferenceList<Item, "code", "label">;
}

describe("stringFor", () => {
    beforeAll(async () => {
        await i18next.init({
            keySeparator: false,
            lng: "fr",
            nsSeparator: "🤷‍♂️",
            resources: {fr: {translation: {}}}
        });
    });

    test("utilise le displayFormatter fonctionnel", () => {
        const field = makeField("hello", {
            displayFormatter: value => `format:${value ?? ""}`,
            domain: domain(z.string())
        });

        expect(stringFor(field)).toBe("format:hello");
    });

    test("résout le libellé d'une liste de référence", () => {
        const field = makeField("a", {domain: domain(z.string())});

        expect(stringFor(field, makeReferenceList())).toBe("Alpha");
    });

    test("formate une valeur absente sans liste de référence", () => {
        const field = makeField(undefined, {
            displayFormatter: value => `${value ?? "empty"}`,
            domain: domain(z.string())
        });

        expect(stringFor(field)).toBe("empty");
    });
});
