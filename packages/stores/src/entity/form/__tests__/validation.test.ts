import {describe, expect, test} from "vitest";
import z from "zod";

import {domain} from "../../../__tests__/test-utils";
import {Validator} from "../../types";
import {makeField} from "../../utils";
import {BuildingFormEntityField} from "../builders";
import {validateField} from "../validation";

function makeTestField(options: {
    isRequired?: boolean;
    requiredErrorMessage?: string;
    schema?: z.ZodTypeAny;
    validator?: Validator<any> | Validator<any>[];
    value?: unknown;
}) {
    const baseDomain = domain<any>(options.schema ?? z.unknown(), {
        validator: options.validator
    });

    return makeField("test", f =>
        f
            .domain(baseDomain)
            .metadata({
                isRequired: options.isRequired ?? false,
                requiredErrorMessage: options.requiredErrorMessage
            })
            .value(options.value)
    ) as BuildingFormEntityField;
}

describe("validateField", () => {
    test("retourne l'erreur required pour un champ vide obligatoire", () => {
        const field = makeTestField({isRequired: true, requiredErrorMessage: "required.error", value: ""});

        expect(validateField(field)).toEqual(["required.error"]);
    });

    test("retourne les erreurs de schéma zod", () => {
        const field = makeTestField({schema: z.string().min(3, "min3"), value: "ab"});

        expect(validateField(field)).toContain("min3");
    });

    test("applique un validator fonction", () => {
        const field = makeTestField({
            value: 4,
            validator: (v: number) => (v % 2 === 0 ? "pair.interdit" : false)
        });

        expect(validateField(field)).toEqual(["pair.interdit"]);
    });

    test("applique un validator regex", () => {
        const field = makeTestField({
            value: "abc",
            validator: {regex: /^\d+$/u, errorMessage: "regex.error"}
        });

        expect(validateField(field)).toEqual(["regex.error"]);
    });

    test("applique un validator email", () => {
        const field = makeTestField({
            value: "invalid-mail",
            validator: {type: "email", errorMessage: "email.error"}
        });

        expect(validateField(field)).toEqual(["email.error"]);
    });

    test("applique un validator string sur longueur min/max", () => {
        const tooShort = makeTestField({
            value: "a",
            validator: {type: "string", minLength: 2, errorMessage: "string.error"}
        });
        const tooLong = makeTestField({
            value: "abcd",
            validator: {type: "string", maxLength: 3, errorMessage: "string.error"}
        });
        const ok = makeTestField({
            value: "abc",
            validator: {type: "string", minLength: 2, maxLength: 3, errorMessage: "string.error"}
        });

        expect(validateField(tooShort)).toEqual(["string.error"]);
        expect(validateField(tooLong)).toEqual(["string.error"]);
        expect(validateField(ok)).toEqual([]);
    });

    test("applique un validator date", () => {
        const invalidDate = makeTestField({
            value: "not-a-date",
            validator: {type: "date", errorMessage: "date.error"}
        });
        const validDate = makeTestField({
            value: "2020-01-02",
            validator: {type: "date", errorMessage: "date.error"}
        });

        expect(validateField(invalidDate)).toEqual(["date.error"]);
        expect(validateField(validDate)).toEqual([]);
    });

    test("applique un validator number", () => {
        const nanField = makeTestField({value: "abc", validator: {type: "number", errorMessage: "number.error"}});
        const minField = makeTestField({
            value: 1,
            validator: {type: "number", min: 2, errorMessage: "number.error"}
        });
        const maxField = makeTestField({
            value: 5,
            validator: {type: "number", max: 4, errorMessage: "number.error"}
        });
        const decimalsField = makeTestField({
            value: 1.234,
            validator: {type: "number", maxDecimals: 2, errorMessage: "number.error"}
        });
        const okField = makeTestField({
            value: 3.14,
            validator: {type: "number", min: 0, max: 10, maxDecimals: 2}
        });

        expect(validateField(nanField)).toEqual(["number.error"]);
        expect(validateField(minField)).toEqual(["number.error"]);
        expect(validateField(maxField)).toEqual(["number.error"]);
        expect(validateField(decimalsField)).toEqual(["number.error"]);
        expect(validateField(okField)).toEqual([]);
    });

    test("accepte une liste de validateurs", () => {
        const field = makeTestField({
            value: "a",
            validator: [
                {type: "string", minLength: 2, errorMessage: "string.error"},
                {regex: /^\d+$/u, errorMessage: "regex.error"}
            ]
        });

        expect(validateField(field)).toEqual(["string.error", "regex.error"]);
    });

    test("retourne [] pour une valeur undefined non obligatoire", () => {
        const field = makeTestField({isRequired: false, value: undefined});

        expect(validateField(field)).toEqual([]);
    });
});
