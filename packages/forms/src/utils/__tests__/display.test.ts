import {renderHook, waitFor} from "@testing-library/react";
import i18next from "i18next";
import {createElement, PropsWithChildren} from "react";
import {I18nextProvider, initReactI18next} from "react-i18next";
import {beforeAll, describe, expect, test, vi} from "vitest";
import {z} from "zod";

import {makeReferenceList} from "@focus4/stores";

import {useDisplay} from "../display";

const wrapper = ({children}: PropsWithChildren) => createElement(I18nextProvider, {i18n: i18next}, children);

describe("useDisplay", () => {
    beforeAll(async () => {
        await i18next.use(initReactI18next).init({
            lng: "fr",
            resources: {
                fr: {
                    translation: {
                        beta: "Beta"
                    }
                }
            }
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
