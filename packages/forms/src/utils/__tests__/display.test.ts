import {act, renderHook, waitFor} from "@testing-library/react";
import {createInstance} from "i18next";
import {createElement, PropsWithChildren} from "react";
import {I18nextProvider, initReactI18next} from "react-i18next";
import {beforeEach, describe, expect, test, vi} from "vitest";
import {z} from "zod";

import {makeReferenceList} from "@focus4/stores";

import {useDisplay} from "../display";

const i18next = createInstance();
const wrapper = ({children}: PropsWithChildren) => createElement(I18nextProvider, {i18n: i18next}, children);

describe("useDisplay", () => {
    beforeEach(async () => {
        await i18next.use(initReactI18next).init({
            lng: "fr",
            resources: {
                fr: {
                    translation: {
                        beta: "Beta",
                        amount: "Valeur : {{value}}"
                    }
                }
            }
        });
    });

    test.each([
        {label: "par défaut", formatter: undefined, value: 1234.5, expected: "1\u202F234,5"},
        {label: "avec options vides", formatter: {}, value: 1234.5, expected: "1\u202F234,5"},
        {label: "sans groupement", formatter: {useGrouping: false}, value: 1234.5, expected: "1234,5"},
        {
            label: "avec arrondi et décimales fixes",
            formatter: {minimumFractionDigits: 2, maximumFractionDigits: 2},
            value: 12.345,
            expected: "12,35"
        },
        {label: "en pourcentage", formatter: {style: "percent" as const}, value: 0.25, expected: "25\u00A0%"},
        {label: "avec zéro", formatter: {}, value: 0, expected: "0"},
        {label: "sans valeur", formatter: {}, value: undefined, expected: ""}
    ])("formate un nombre $label", async ({formatter, value, expected}) => {
        const {result} = renderHook(() => useDisplay({schema: z.number(), formatter, value}), {wrapper});

        await waitFor(() => {
            expect(result.current).toBe(expected);
        });
    });

    test("ignore une valeur non numérique avec les options numériques", async () => {
        const formatter = {};
        const {result} = renderHook(() => useDisplay({schema: z.string(), formatter, value: "12"}), {wrapper});

        await waitFor(() => {
            expect(result.current).toBe("");
        });
    });

    test("formate un tableau de nombres", async () => {
        const value = [1234.5, 0];
        const formatter = {useGrouping: false};
        const {result} = renderHook(() => useDisplay({schema: z.array(z.number()), formatter, value}), {wrapper});

        await waitFor(() => {
            expect(result.current).toEqual(["1234,5", "0"]);
        });
    });

    test("met à jour le format numérique quand la langue change", async () => {
        const {result} = renderHook(() => useDisplay({schema: z.number(), value: 1234.5}), {wrapper});

        await waitFor(() => {
            expect(result.current).toBe("1\u202F234,5");
        });

        await act(async () => {
            await i18next.changeLanguage("en-US");
        });

        await waitFor(() => {
            expect(result.current).toBe("1,234.5");
        });
    });

    test("met à jour le format numérique quand les options changent", async () => {
        const initialFormatter: Intl.NumberFormatOptions = {useGrouping: false};
        const {result, rerender} = renderHook(
            ({formatter}: {formatter: Intl.NumberFormatOptions}) =>
                useDisplay({schema: z.number(), value: 1234.5, formatter}),
            {wrapper, initialProps: {formatter: initialFormatter}}
        );

        await waitFor(() => {
            expect(result.current).toBe("1234,5");
        });

        rerender({formatter: {style: "percent", useGrouping: false}});

        await waitFor(() => {
            expect(result.current).toBe("123450\u00A0%");
        });
    });

    test.each([
        {value: 0, expected: "Valeur : 0"},
        {value: 12.5, expected: "Valeur : 12.5"},
        {value: undefined, expected: "Valeur : "}
    ])("interpole la valeur $value dans une clé de traduction", async ({value, expected}) => {
        const {result} = renderHook(() => useDisplay({schema: z.number(), value, formatter: "amount"}), {wrapper});

        await waitFor(() => {
            expect(result.current).toBe(expected);
        });
    });

    test("formate une valeur simple avec le formatter", async () => {
        const {result} = renderHook(
            () =>
                useDisplay({
                    schema: z.string(),
                    value: "alpha",
                    formatter: value => `label-${value ?? ""}`
                }),
            {wrapper}
        );

        await waitFor(() => {
            expect(result.current).toBe("label-alpha");
        });
    });

    test("résout le libellé depuis une liste de référence", async () => {
        const values = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"}
        ]);

        const {result} = renderHook(
            () =>
                useDisplay({
                    schema: z.string(),
                    value: "B",
                    values
                }),
            {wrapper}
        );

        await waitFor(() => {
            expect(result.current).toBe("Beta");
        });
    });

    test("gère les tableaux avec keyResolver et fallback", async () => {
        const value = ["A", "B"];
        const keyResolver = vi.fn().mockImplementation((v: string) => Promise.resolve(v === "B" ? "Bravo" : undefined));

        const {result} = renderHook(
            () =>
                useDisplay({
                    schema: z.array(z.string()),
                    value,
                    keyResolver
                }),
            {wrapper}
        );

        await waitFor(() => {
            expect(result.current).toEqual(["A", "Bravo"]);
        });
        expect(keyResolver).toHaveBeenCalledWith("A");
        expect(keyResolver).toHaveBeenCalledWith("B");
    });

    test("gère une valeur simple avec keyResolver et fallback", async () => {
        const keyResolver = vi
            .fn()
            .mockImplementation((value: string) => Promise.resolve(value === "B" ? "Bravo" : undefined));

        const {result} = renderHook(
            () =>
                useDisplay({
                    schema: z.string(),
                    value: "B",
                    keyResolver
                }),
            {wrapper}
        );

        await waitFor(() => {
            expect(result.current).toBe("Bravo");
        });
        expect(keyResolver).toHaveBeenCalledWith("B");
    });

    test("formate un tableau sans liste de référence", async () => {
        const formatter = (value?: string) => `fmt-${value ?? ""}`;
        const value = ["A", "B"];

        const {result} = renderHook(
            () =>
                useDisplay({
                    schema: z.array(z.string()),
                    value,
                    formatter
                }),
            {wrapper}
        );

        await waitFor(() => {
            expect(result.current).toEqual(["fmt-A", "fmt-B"]);
        });
    });

    test("retourne undefined avec keyResolver quand la valeur est absente", async () => {
        const keyResolver = vi.fn();

        const {result} = renderHook(
            () =>
                useDisplay({
                    schema: z.string(),
                    value: undefined,
                    keyResolver
                }),
            {wrapper}
        );

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });
        expect(keyResolver).not.toHaveBeenCalled();
    });
});
