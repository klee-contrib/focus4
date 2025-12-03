import {renderHook} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {useMask} from "../mask";

describe("useMask", () => {
    test("retourne la valeur sans masque si pattern non défini", () => {
        const {result} = renderHook(() =>
            useMask({
                value: "test",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("test");
    });

    test("formate avec un masque simple", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "123",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("123");
    });

    test("formate avec placeholder", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "1",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("1__");
    });

    test("formate avec caractères statiques", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "(111)",
                value: "123",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("(123)");
    });

    test("formate avec masque révélant", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "12",
                isRevealingMask: true,
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("12");
    });

    test("transforme en majuscules avec A", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "AAA",
                value: "abc",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("ABC");
    });

    test("transforme en majuscules avec #", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "###",
                value: "a1b",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("A1B");
    });

    test("gère les caractères échappés", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "\\111",
                value: "123",
                onChange: () => {}
            })
        );

        expect(result.current.stringValue).toBe("123");
    });

    test("lance une erreur si placeholderChar trop long", () => {
        expect(() => {
            renderHook(() =>
                useMask({
                    pattern: "111",
                    placeholderChar: "ab",
                    onChange: () => {}
                })
            );
        }).toThrow();
    });

    test("lance une erreur si pattern sans caractères éditables", () => {
        expect(() => {
            renderHook(() =>
                useMask({
                    pattern: "---",
                    onChange: () => {}
                })
            );
        }).toThrow();
    });
});
