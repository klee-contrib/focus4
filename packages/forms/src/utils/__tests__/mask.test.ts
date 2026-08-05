import {renderHook} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {useMask} from "../mask";

import {asKeyboardEvent, asPasteEvent, createInput} from "./test-utils";

describe("useMask", () => {
    test.each([
        {label: "sans masque si pattern non défini", pattern: undefined, value: "test", expected: "test"},
        {label: "avec un masque simple", pattern: "111", value: "123", expected: "123"},
        {label: "avec placeholder", pattern: "111", value: "1", expected: "1__"},
        {label: "avec caractères statiques", pattern: "(111)", value: "123", expected: "(123)"},
        {
            label: "avec masque révélant",
            pattern: "111",
            value: "12",
            expected: "12",
            opts: {isRevealingMask: true}
        },
        {label: "transforme en majuscules avec A", pattern: "AAA", value: "abc", expected: "ABC"},
        {label: "transforme en majuscules avec #", pattern: "###", value: "a1b", expected: "A1B"},
        {label: "gère les caractères échappés", pattern: "\\111", value: "123", expected: "123"}
    ])("formate $label", ({pattern, value, expected, opts}) => {
        const {result} = renderHook(() =>
            useMask({
                pattern,
                value,
                onChange: () => {
                    /** */
                },
                ...opts
            })
        );

        expect(result.current.stringValue).toBe(expected);
    });

    test.each([
        {label: "placeholderChar trop long", opts: {pattern: "111", placeholderChar: "ab"}},
        {label: "pattern sans caractères éditables", opts: {pattern: "---"}},
        {label: "pattern se termine par un caractère d'échappement", opts: {pattern: "11\\"}},
        {label: "un caractère de formatage est retiré", opts: {pattern: "1", formatCharacters: {1: null}}}
    ])("lance une erreur si $label", ({opts}) => {
        expect(() => {
            renderHook(() =>
                useMask({
                    ...opts,
                    onChange: () => {
                        /** */
                    }
                } as Parameters<typeof useMask>[0])
            );
        }).toThrow();
    });

    test("désactive le masque sur mobile", () => {
        const userAgentSpy = vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Android");

        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "12",
                onChange: () => {
                    /** */
                }
            })
        );

        expect(result.current.stringValue).toBe("12");
        userAgentSpy.mockRestore();
    });

    test("supporte des formatCharacters personnalisés", () => {
        const {result} = renderHook(() =>
            useMask({
                pattern: "Z1",
                value: "x2",
                formatCharacters: {
                    Z: {
                        transform: c => c.toUpperCase(),
                        validate: c => c === "x"
                    }
                },
                onChange: () => {
                    /** */
                }
            })
        );

        expect(result.current.stringValue).toBe("X2");
    });

    test("handleKeyDown saisit un caractère valide et appelle onChange", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "11",
                value: "",
                onChange
            })
        );
        const input = createInput("__", 0, 0);
        const preventDefault = vi.fn();

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "5",
                metaKey: false,
                preventDefault
            })
        );

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("5_");
    });

    test("handlePaste invalide conserve la valeur et appelle onPaste", () => {
        const onChange = vi.fn();
        const onPaste = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "(11)",
                value: "",
                onChange,
                onPaste
            })
        );
        const input = createInput("", 0, 0);
        const preventDefault = vi.fn();

        result.current.handlePaste?.(
            asPasteEvent({
                clipboardData: {
                    getData: () => "x1"
                },
                currentTarget: input,
                preventDefault
            })
        );

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();
        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    test("handlePaste valide met à jour la valeur", () => {
        const onChange = vi.fn();
        const onPaste = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "(11)",
                value: "",
                onChange,
                onPaste
            })
        );
        const input = createInput("", 0, 0);
        const preventDefault = vi.fn();

        result.current.handlePaste?.(
            asPasteEvent({
                clipboardData: {
                    getData: () => "(12)"
                },
                currentTarget: input,
                preventDefault
            })
        );

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("(12)");
        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    test("handleKeyDown delete supprime le caractère suivant", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "123",
                onChange
            })
        );
        const input = createInput("123", 1, 1);
        const preventDefault = vi.fn();

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "Delete",
                metaKey: false,
                preventDefault
            })
        );

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("1_3");
    });

    test("handleKeyDown cut copie et supprime la sélection", () => {
        const onChange = vi.fn();
        const originalClipboard = navigator.clipboard;
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: {writeText}
        });

        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "123",
                onChange
            })
        );
        const input = createInput("123", 0, 2);
        const preventDefault = vi.fn();

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: true,
                currentTarget: input,
                key: "x",
                metaKey: false,
                preventDefault
            })
        );

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(writeText).toHaveBeenCalledWith("12");
        expect(onChange).toHaveBeenCalledWith("__3");

        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: originalClipboard
        });
    });

    test("ignore les touches de navigation", () => {
        const onChange = vi.fn();
        const onKeyDown = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "123",
                onChange,
                onKeyDown
            })
        );
        const input = createInput("123", 1, 1);
        const preventDefault = vi.fn();

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "ArrowLeft",
                metaKey: false,
                preventDefault
            })
        );

        expect(preventDefault).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    test("paste accepte les caractères statiques déjà présents", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "1-1",
                value: "",
                onChange
            })
        );
        const input = createInput("", 0, 0);

        result.current.handlePaste?.(
            asPasteEvent({
                clipboardData: {
                    getData: () => "1-2"
                },
                currentTarget: input,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).toHaveBeenCalledWith("1-2");
    });

    test("backspace au début ne modifie pas la valeur", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "123",
                onChange
            })
        );
        const input = createInput("123", 0, 0);

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "Backspace",
                metaKey: false,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    test("input invalide est ignoré", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "",
                onChange
            })
        );
        const input = createInput("___", 0, 0);

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "A",
                metaKey: false,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    test("ignore la saisie quand le curseur est en fin de masque", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "11",
                value: "12",
                onChange
            })
        );
        const input = createInput("12", 2, 2);

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "3",
                metaKey: false,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    test("backspace sur un caractère statique ne remplace rien", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "(11)",
                value: "12",
                onChange
            })
        );
        const input = createInput("(12)", 1, 1);

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "Backspace",
                metaKey: false,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).toHaveBeenCalledWith("(12)");
    });

    test("backspace en mode révélant tronque après le premier placeholder", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "111",
                value: "12",
                isRevealingMask: true,
                onChange
            })
        );
        const input = createInput("12", 2, 2);

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "Backspace",
                metaKey: false,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).toHaveBeenCalledWith("1");
    });

    test("paste invalide sans position statique antérieure est rejeté", () => {
        const onChange = vi.fn();
        const onPaste = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "11",
                value: "",
                onChange,
                onPaste
            })
        );
        const input = createInput("", 0, 0);

        result.current.handlePaste?.(
            asPasteEvent({
                clipboardData: {
                    getData: () => "A"
                },
                currentTarget: input,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).not.toHaveBeenCalled();
        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    test("paste invalide après caractère statique non correspondant est rejeté", () => {
        const onChange = vi.fn();
        const onPaste = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "1-1",
                value: "",
                onChange,
                onPaste
            })
        );
        const input = createInput("", 0, 0);

        result.current.handlePaste?.(
            asPasteEvent({
                clipboardData: {
                    getData: () => "1A"
                },
                currentTarget: input,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).not.toHaveBeenCalled();
        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    test("paste identique à la valeur courante ne déclenche pas onChange", () => {
        const onChange = vi.fn();
        const onPaste = vi.fn();
        const {result} = renderHook(() =>
            useMask({
                pattern: "11",
                value: "12",
                onChange,
                onPaste
            })
        );
        const input = createInput("12", 0, 2);

        result.current.handlePaste?.(
            asPasteEvent({
                clipboardData: {
                    getData: () => "12"
                },
                currentTarget: input,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).not.toHaveBeenCalled();
        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    test.each([
        {label: "Enter", modifiers: {}, key: "Enter"},
        {label: "Tab", modifiers: {}, key: "Tab"},
        {label: "les raccourcis meta", modifiers: {metaKey: true}, key: "a"},
        {label: "les raccourcis alt", modifiers: {altKey: true}, key: "a"}
    ])("ignore $label", ({modifiers, key}) => {
        const onChange = vi.fn();
        const onKeyDown = vi.fn();
        const {result} = renderHook(() => useMask({pattern: "111", value: "123", onChange, onKeyDown}));
        const input = createInput("123", 1, 1);
        const preventDefault = vi.fn();

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                metaKey: false,
                ...modifiers,
                currentTarget: input,
                key,
                preventDefault
            })
        );

        expect(preventDefault).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    test("insère au prochain caractère éditable quand la sélection démarre sur un statique", () => {
        const onChange = vi.fn();
        const {result} = renderHook(() => useMask({pattern: "(11)", value: "", onChange}));
        const input = createInput("(__)", 0, 0);

        result.current.handleKeyDown?.(
            asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "7",
                metaKey: false,
                preventDefault: vi.fn()
            })
        );

        expect(onChange).toHaveBeenCalledWith("(7_)");
    });
});
