import i18next from "i18next";
import {beforeEach, describe, expect, test} from "vitest";
import z from "zod";

import {domain} from "../../../__tests__/test-utils";
import {makeReferenceList} from "../../../reference";
import {makeField} from "../field";
import {stringFor} from "../string-for";

describe("stringFor", () => {
    beforeEach(async () => {
        await i18next.init({
            lng: "fr",
            nsSeparator: "🤷‍♂️",
            resources: {fr: {translation: {amount: "Valeur : {{value}}"}}}
        });
    });

    test.each([
        {label: "par défaut", displayFormatter: undefined, value: 1234.5, expected: "1\u202F234,5"},
        {label: "avec options vides", displayFormatter: {}, value: 1234.5, expected: "1\u202F234,5"},
        {label: "sans groupement", displayFormatter: {useGrouping: false}, value: 1234.5, expected: "1234,5"},
        {
            label: "avec décimales fixes",
            displayFormatter: {minimumFractionDigits: 2, maximumFractionDigits: 2},
            value: 12.345,
            expected: "12,35"
        },
        {label: "en pourcentage", displayFormatter: {style: "percent" as const}, value: 0.25, expected: "25\u00A0%"},
        {label: "avec zéro", displayFormatter: {}, value: 0, expected: "0"},
        {label: "sans valeur", displayFormatter: {}, value: undefined, expected: ""}
    ])("formate un nombre $label", ({displayFormatter, value, expected}) => {
        const field = makeField(value, {domain: domain(z.number()), displayFormatter});

        expect(stringFor(field)).toBe(expected);
    });

    test("utilise la langue courante à chaque appel", async () => {
        const field = makeField(1234.5, {domain: domain(z.number())});

        expect(stringFor(field)).toBe("1\u202F234,5");

        await i18next.changeLanguage("en-US");

        expect(stringFor(field)).toBe("1,234.5");
    });

    test("ignore les options numériques pour un schéma texte", () => {
        const field = makeField("12", {domain: domain(z.string()), displayFormatter: {}});

        expect(stringFor(field)).toBe("");
    });

    test.each([
        {value: 0, expected: "Valeur : 0"},
        {value: 12.5, expected: "Valeur : 12.5"},
        {value: undefined, expected: "Valeur : "}
    ])("interpole la valeur $value dans une clé de traduction", ({value, expected}) => {
        const field = makeField(value, {domain: domain(z.number()), displayFormatter: "amount"});

        expect(stringFor(field)).toBe(expected);
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

        expect(stringFor(field, makeReferenceList([{code: "a", label: "Alpha"}]))).toBe("Alpha");
    });

    test("formate une valeur absente sans liste de référence", () => {
        const field = makeField(undefined, {
            displayFormatter: value => `${value ?? "empty"}`,
            domain: domain(z.string())
        });

        expect(stringFor(field)).toBe("empty");
    });
});
