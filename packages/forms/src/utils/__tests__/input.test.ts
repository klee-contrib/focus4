import {renderHook} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import {z} from "zod";

import {useInput} from "../input";

describe("useInput", () => {
    describe("string schema", () => {
        test("retourne la valeur string", () => {
            const onChange = () => {};
            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    value: "test",
                    onChange
                })
            );

            expect(result.current.stringValue).toBe("test");
        });

        test("retourne chaîne vide si valeur undefined", () => {
            const onChange = () => {};
            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    value: undefined,
                    onChange
                })
            );

            expect(result.current.stringValue).toBe("");
        });

        test("appelle onChange avec undefined pour chaîne vide", () => {
            let changedValue: string | undefined;
            const onChange = (value?: string) => {
                changedValue = value;
            };

            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    value: undefined,
                    onChange
                })
            );

            const input = document.createElement("input");
            const event = {currentTarget: input} as any;
            input.value = "";

            result.current.handleChange("", event);

            expect(changedValue).toBeUndefined();
        });
    });

    describe("number schema", () => {
        test("formate un nombre", () => {
            const onChange = () => {};
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: 1234.56,
                    onChange
                })
            );

            expect(result.current.stringValue).toBeTruthy();
            expect(result.current.stringValue).toContain("1234");
        });

        test("retourne chaîne vide si valeur undefined", () => {
            const onChange = () => {};
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: undefined,
                    onChange
                })
            );

            expect(result.current.stringValue).toBe("");
        });

        test("appelle onChange avec undefined pour chaîne vide", () => {
            let changedValue: number | undefined;
            const onChange = (value?: number) => {
                changedValue = value;
            };

            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: undefined,
                    onChange
                })
            );

            const input = document.createElement("input");
            const event = {currentTarget: input} as any;
            input.value = "";

            result.current.handleChange("", event);

            expect(changedValue).toBeUndefined();
        });

        test("gère les séparateurs de milliers", () => {
            const onChange = () => {};
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: 1000,
                    hasThousandsSeparator: true,
                    onChange
                })
            );

            expect(result.current.stringValue).toEqual("1,000");
        });

        test("gère maxDecimals", () => {
            const onChange = () => {};
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: 123.456_789,
                    maxDecimals: 2,
                    onChange
                })
            );

            expect(result.current.stringValue).toEqual("123.46");
        });

        test("interdit les nombres négatifs si noNegativeNumbers", () => {
            let changedValue: number | undefined;
            const onChange = (value?: number) => {
                changedValue = value;
            };

            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: undefined,
                    noNegativeNumbers: true,
                    onChange
                })
            );

            const input = document.createElement("input");
            const event = {currentTarget: input} as any;
            input.value = "-123";

            result.current.handleChange("-123", event);

            expect(changedValue).toBeUndefined();
        });
    });

    describe("avec masque", () => {
        test("utilise le masque pour string", () => {
            const onChange = () => {};
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
});
