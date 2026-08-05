import {renderHook} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import {z} from "zod";

import {useInput} from "../input";

import {asInputChangeEvent, createInput} from "./test-utils";

describe("useInput", () => {
    test.each([
        {schema: z.string(), label: "string"},
        {schema: z.number(), label: "number"}
    ])("retourne chaîne vide si valeur undefined ($label)", ({schema}) => {
        const {result} = renderHook(() =>
            useInput({
                schema,
                value: undefined,
                onChange: () => {
                    /** */
                }
            })
        );

        expect(result.current.stringValue).toBe("");
    });

    test.each([
        {schema: z.string(), label: "string"},
        {schema: z.number(), label: "number"}
    ])("appelle onChange avec undefined pour chaîne vide ($label)", ({schema}) => {
        let changedValue: string | number | undefined = "initial";
        const {result} = renderHook(() =>
            useInput({
                schema: schema as any,
                value: undefined,
                onChange: (value?: any) => {
                    changedValue = value;
                }
            })
        );

        result.current.handleChange("", asInputChangeEvent(createInput("")));

        expect(changedValue).toBeUndefined();
    });

    describe("string schema", () => {
        test("retourne la valeur string", () => {
            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    value: "test",
                    onChange: () => {
                        /** */
                    }
                })
            );

            expect(result.current.stringValue).toBe("test");
        });
    });

    describe("number schema", () => {
        test("formate un nombre", () => {
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: 1234.56,
                    onChange: () => {
                        /** */
                    }
                })
            );

            expect(result.current.stringValue).toBeTruthy();
            expect(result.current.stringValue).toContain("1234");
        });

        test.each([
            {label: "séparateurs de milliers", opts: {hasThousandsSeparator: true}, value: 1000, expected: "1,000"},
            {label: "maxDecimals", opts: {maxDecimals: 2}, value: 123.456789, expected: "123.46"}
        ])("gère $label", ({opts, value, expected}) => {
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value,
                    ...opts,
                    onChange: () => {
                        /** */
                    }
                })
            );

            expect(result.current.stringValue).toEqual(expected);
        });

        test.each([
            {label: "interdit", noNegativeNumbers: true, expected: undefined as number | undefined},
            {label: "accepte", noNegativeNumbers: false, expected: -123 as number | undefined}
        ])("$label les nombres négatifs selon noNegativeNumbers", ({noNegativeNumbers, expected}) => {
            let changedValue: number | undefined;
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: undefined,
                    noNegativeNumbers,
                    onChange: (value?: number) => {
                        changedValue = value;
                    }
                })
            );

            result.current.handleChange("-123", asInputChangeEvent(createInput("-123", 4, 4)));

            expect(changedValue).toBe(expected);
        });

        test("ignore les caractères invalides", () => {
            const onChange = vi.fn();

            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: undefined,
                    onChange
                })
            );

            const input = createInput("12x", 3, 3);
            const event = asInputChangeEvent(input);

            result.current.handleChange("12x", event);

            expect(onChange).not.toHaveBeenCalled();
        });

        test("supporte le séparateur décimal français", () => {
            let changedValue: number | undefined;
            const onChange = (value?: number) => {
                changedValue = value;
            };
            const languageSpy = vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");

            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: undefined,
                    onChange
                })
            );

            const input = createInput("12.5", 4, 4);
            const event = asInputChangeEvent(input);

            result.current.handleChange("12.5", event);

            expect(changedValue).toBe(12.5);
            languageSpy.mockRestore();
        });
    });

    describe("avec masque", () => {
        test("utilise le masque pour string", () => {
            const onChange = () => {
                /** */
            };
            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    value: "123",
                    mask: {
                        pattern: "111"
                    },
                    onChange
                })
            );

            expect(result.current.stringValue).toEqual("123");
        });
    });

    describe("autres schémas", () => {
        test("retourne une string pour un schéma non string/number", () => {
            const {result} = renderHook(() =>
                useInput({
                    schema: z.boolean(),
                    value: true,
                    onChange: () => {
                        /** */
                    }
                })
            );

            expect(result.current.stringValue).toBe("true");
        });
    });
});
