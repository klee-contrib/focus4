import {act, renderHook as renderHookWithOptions} from "@testing-library/react";
import {createInstance} from "i18next";
import {createElement, PropsWithChildren} from "react";
import {I18nextProvider} from "react-i18next";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import {z} from "zod";

import {useInput} from "../input";

import {asInputChangeEvent, asKeyboardEvent, asPasteEvent, createInput} from "./test-utils";

const i18n = createInstance();
const wrapper = ({children}: PropsWithChildren) => createElement(I18nextProvider, {i18n}, children);
const renderHook: typeof renderHookWithOptions = (render, options) =>
    renderHookWithOptions(render, {wrapper, ...options});

describe("useInput", () => {
    beforeEach(async () => {
        await i18n.init({lng: "en-US", resources: {}});
        vi.useFakeTimers();
    });

    afterEach(() => {
        act(() => vi.runOnlyPendingTimers());
        vi.useRealTimers();
    });

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
        {schema: z.string(), value: "initial", label: "string"},
        {schema: z.number(), value: 12, label: "number"}
    ])("efface la valeur et appelle onChange avec undefined pour chaîne vide ($label)", ({schema, value}) => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useInput({
                schema,
                value,
                onChange
            })
        );

        act(() => result.current.handleChange("", asInputChangeEvent(createInput(""))));

        expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
        if (schema.type === "number") {
            expect(result.current.stringValue).toBe("");
        }
    });

    describe("string schema", () => {
        test("conserve la chaîne saisie et affiche les mises à jour de valeur", () => {
            const onChange = vi.fn();
            const {result, rerender} = renderHook(
                ({value}: {value?: string}) =>
                    useInput({
                        schema: z.string(),
                        value,
                        onChange
                    }),
                {initialProps: {value: "initial" as string | undefined}}
            );

            expect(result.current.stringValue).toBe("initial");

            act(() => result.current.handleChange("  hello  ", asInputChangeEvent(createInput("  hello  "))));

            expect(onChange).toHaveBeenCalledExactlyOnceWith("  hello  ");
            expect(result.current.stringValue).toBe("initial");
            rerender({value: "updated"});
            expect(result.current.stringValue).toBe("updated");
            rerender({value: undefined});
            expect(result.current.stringValue).toBe("");
        });

        test("transmet les événements de clavier et de collage sans masque", () => {
            const onChange = vi.fn();
            const onKeyDown = vi.fn();
            const onPaste = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    onChange,
                    onKeyDown,
                    onPaste
                })
            );
            const input = createInput();
            const keyEvent = asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "a",
                metaKey: false,
                preventDefault: vi.fn()
            });
            const pasteEvent = asPasteEvent({
                clipboardData: {getData: () => "abc"},
                currentTarget: input,
                preventDefault: vi.fn()
            });

            act(() => result.current.handleKeyDown?.(keyEvent));
            act(() => result.current.handlePaste?.(pasteEvent));

            expect(onKeyDown).toHaveBeenCalledExactlyOnceWith(keyEvent);
            expect(onPaste).toHaveBeenCalledExactlyOnceWith(pasteEvent);
            expect(onChange).not.toHaveBeenCalled();
            expect(keyEvent.preventDefault).not.toHaveBeenCalled();
            expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe("number schema", () => {
        test.each([
            {language: "en-US", text: "1234.50", display: "1,234.50", expected: 1234.5},
            {language: "en-US", text: "1,234.50", display: "1,234.50", expected: 1234.5},
            {language: "fr-FR", text: "1234,50", display: "1\u202F234,50", expected: 1234.5},
            {language: "fr-FR", text: "1234.50", display: "1\u202F234,50", expected: 1234.5},
            {language: "fr-FR", text: "1\u202F234,50", display: "1\u202F234,50", expected: 1234.5},
            {language: "fr-FR", text: "0,5", display: "0,5", expected: 0.5},
            {language: "fr-FR", text: "-0,50", display: "-0,50", expected: -0.5},
            {language: "fr-FR", text: "12.5", display: "12,5", expected: 12.5, hasThousandsSeparator: false},
            {language: "de-DE", text: "1.234,50", display: "1.234,50", expected: 1234.5}
        ])(
            "parse et formate $text en $language",
            async ({language, text, display, expected, hasThousandsSeparator = true}) => {
                await i18n.changeLanguage(language);
                const onChange = vi.fn();
                const {result} = renderHook(() =>
                    useInput({
                        schema: z.number(),
                        hasThousandsSeparator,
                        onChange
                    })
                );

                act(() => result.current.handleChange(text, asInputChangeEvent(createInput(text, text.length))));

                expect(result.current.stringValue).toBe(display);
                expect(onChange).toHaveBeenCalledExactlyOnceWith(expected);
            }
        );

        test.each([
            {text: "1234", caret: 4, display: "1,234", expectedCaret: 5},
            {text: "1234", caret: 2, display: "1,234", expectedCaret: 3},
            {text: "-1234", caret: 5, display: "-1,234", expectedCaret: 6},
            {text: "001234", caret: 6, display: "001,234", expectedCaret: 7}
        ])(
            "conserve le curseur à la position $caret lors du formatage de $text",
            ({text, caret, display, expectedCaret}) => {
                const {result} = renderHook(() =>
                    useInput({
                        schema: z.number(),
                        hasThousandsSeparator: true,
                        onChange: vi.fn()
                    })
                );
                const input = createInput(text, caret);

                act(() => result.current.handleChange(text, asInputChangeEvent(input)));
                input.value = result.current.stringValue;
                act(() => vi.runOnlyPendingTimers());

                expect(result.current.stringValue).toBe(display);
                expect(input.selectionStart).toBe(expectedCaret);
                expect(input.selectionEnd).toBe(expectedCaret);
            }
        );

        test("met à jour le format quand la langue change sans appeler onChange", async () => {
            const onChange = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    value: 1234.5,
                    hasThousandsSeparator: true,
                    onChange
                })
            );

            expect(result.current.stringValue).toBe("1,234.5");
            await act(() => i18n.changeLanguage("fr-FR"));

            expect(result.current.stringValue).toBe("1\u202F234,5");
            expect(onChange).not.toHaveBeenCalled();
        });

        test("utilise le nouveau onChange après un rerender", () => {
            const firstOnChange = vi.fn();
            const nextOnChange = vi.fn();
            const {result, rerender} = renderHook(
                ({onChange}) =>
                    useInput({
                        schema: z.number(),
                        onChange
                    }),
                {initialProps: {onChange: firstOnChange}}
            );

            rerender({onChange: nextOnChange});
            act(() => result.current.handleChange("42", asInputChangeEvent(createInput("42", 2))));

            expect(firstOnChange).not.toHaveBeenCalled();
            expect(nextOnChange).toHaveBeenCalledExactlyOnceWith(42);
        });

        test.each([
            {text: "0", expected: 0},
            {text: "00012", expected: 12},
            {text: "12.", expected: 12},
            {text: "12.00", expected: 12},
            {text: "12.3400", expected: 12.34},
            {text: "0.", expected: 0},
            {text: "0.5", expected: 0.5},
            {text: "0.00", expected: 0},
            {text: "-", expected: undefined},
            {text: "-0", expected: -0},
            {text: "-12.00", expected: -12},
            {text: "-0.5", expected: -0.5},
            {text: "0.1234567890", expected: 0.123456789}
        ])("conserve la saisie $text et appelle onChange avec $expected", ({text, expected}) => {
            const onChange = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    onChange
                })
            );

            act(() => result.current.handleChange(text, asInputChangeEvent(createInput(text, text.length))));

            expect(result.current.stringValue).toBe(text);
            expect(onChange).toHaveBeenCalledExactlyOnceWith(expected);
        });

        test.each(["12x", "1.2.3", "1e3", " 12", "+12", "12-", "1,234", "0.12345678901"])(
            "ignore la saisie invalide %s et restaure le curseur sans changer la valeur",
            text => {
                const onChange = vi.fn();
                const {result} = renderHook(() =>
                    useInput({
                        schema: z.number(),
                        value: 12,
                        onChange
                    })
                );
                const input = createInput(text, text.length);

                act(() => result.current.handleChange(text, asInputChangeEvent(input)));
                act(() => vi.runOnlyPendingTimers());

                expect(result.current.stringValue).toBe("12");
                expect(onChange).not.toHaveBeenCalled();
                expect(input.selectionStart).toBe(2);
                expect(input.selectionEnd).toBe(2);
            }
        );

        test.each([
            {label: "entier", schema: z.int(), text: "12", accepted: true},
            {label: "entier", schema: z.int(), text: "12.5", accepted: false},
            {label: "minimum nul", schema: z.number().min(0), text: "-12", accepted: false},
            {label: "minimum positif", schema: z.number().min(1), text: "-12", accepted: false},
            {label: "minimum négatif", schema: z.number().min(-1), text: "-12", accepted: true},
            {label: "maximum seul", schema: z.number().max(100), text: "-12", accepted: true}
        ])("applique les restrictions du schéma ($label) à la saisie $text", ({schema, text, accepted}) => {
            const onChange = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema,
                    onChange
                })
            );

            act(() => result.current.handleChange(text, asInputChangeEvent(createInput(text, text.length))));

            expect(result.current.stringValue).toBe(accepted ? text : "");
            if (accepted) {
                expect(onChange).toHaveBeenCalledExactlyOnceWith(Number(text));
            } else {
                expect(onChange).not.toHaveBeenCalled();
            }
        });

        test("permet aux options explicites de remplacer les restrictions du schéma", () => {
            const onChange = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema: z.int().min(0),
                    maxDecimals: 2,
                    noNegativeNumbers: false,
                    onChange
                })
            );

            act(() => result.current.handleChange("-12.50", asInputChangeEvent(createInput("-12.50", 6))));

            expect(result.current.stringValue).toBe("-12.50");
            expect(onChange).toHaveBeenCalledExactlyOnceWith(-12.5);
        });

        test("limite les décimales sans arrondir la valeur saisie", () => {
            const onChange = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema: z.number(),
                    maxDecimals: 2,
                    onChange
                })
            );

            act(() => result.current.handleChange("12.34", asInputChangeEvent(createInput("12.34", 5))));
            act(() => result.current.handleChange("12.345", asInputChangeEvent(createInput("12.345", 6))));

            expect(result.current.stringValue).toBe("12.34");
            expect(onChange).toHaveBeenCalledExactlyOnceWith(12.34);
        });

        test("synchronise la valeur et les options de formatage sans appeler onChange", () => {
            const onChange = vi.fn();
            const {result, rerender} = renderHook(
                props =>
                    useInput({
                        schema: z.number(),
                        onChange,
                        ...props
                    }),
                {initialProps: {value: 1234.567 as number | undefined, hasThousandsSeparator: false, maxDecimals: 3}}
            );

            rerender({value: 1234.567, hasThousandsSeparator: true, maxDecimals: 2});
            expect(result.current.stringValue).toBe("1,234.57");

            rerender({value: 0, hasThousandsSeparator: true, maxDecimals: 2});
            expect(result.current.stringValue).toBe("0");

            rerender({value: undefined, hasThousandsSeparator: true, maxDecimals: 2});
            expect(result.current.stringValue).toBe("");
            expect(onChange).not.toHaveBeenCalled();
        });

        test.each([
            {label: "le format par défaut", opts: {}, value: 1234.56, expected: "1234.56"},
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
    });

    describe("avec masque", () => {
        test("applique les options du masque aux mises à jour de valeur", () => {
            const {result, rerender} = renderHook(
                ({value, isRevealingMask}) =>
                    useInput({
                        schema: z.string(),
                        value,
                        mask: {
                            pattern: "AA-11",
                            placeholderChar: "?",
                            isRevealingMask
                        },
                        onChange: vi.fn()
                    }),
                {initialProps: {value: "ab1", isRevealingMask: false}}
            );

            expect(result.current.stringValue).toBe("AB-1?");
            rerender({value: "cd", isRevealingMask: true});
            expect(result.current.stringValue).toBe("CD-");
            rerender({value: "ef12", isRevealingMask: false});
            expect(result.current.stringValue).toBe("EF-12");
        });

        test("appelle onChange et transmet les événements lors de la saisie et du collage avec masque", () => {
            const onChange = vi.fn();
            const onKeyDown = vi.fn();
            const onPaste = vi.fn();
            const {result} = renderHook(() =>
                useInput({
                    schema: z.string(),
                    mask: {
                        pattern: "(11)"
                    },
                    onChange,
                    onKeyDown,
                    onPaste
                })
            );
            const input = createInput("(__)", 1);
            const keyEvent = asKeyboardEvent({
                altKey: false,
                ctrlKey: false,
                currentTarget: input,
                key: "5",
                metaKey: false,
                preventDefault: vi.fn()
            });

            act(() => result.current.handleKeyDown?.(keyEvent));
            expect(onChange).toHaveBeenLastCalledWith("(5_)");
            expect(onKeyDown).toHaveBeenCalledExactlyOnceWith(keyEvent);
            expect(keyEvent.preventDefault).toHaveBeenCalledOnce();
            act(() => vi.runOnlyPendingTimers());

            input.setSelectionRange(0, 4);
            const pasteEvent = asPasteEvent({
                clipboardData: {getData: () => "(12)"},
                currentTarget: input,
                preventDefault: vi.fn()
            });
            act(() => result.current.handlePaste?.(pasteEvent));

            expect(onChange).toHaveBeenLastCalledWith("(12)");
            expect(onChange).toHaveBeenCalledTimes(2);
            expect(onPaste).toHaveBeenCalledExactlyOnceWith(pasteEvent);
            expect(pasteEvent.preventDefault).toHaveBeenCalledOnce();
        });
    });

    describe("autres schémas", () => {
        test.each([
            {value: true, expected: "true"},
            {value: false, expected: "false"},
            {value: undefined, expected: ""}
        ])("affiche la valeur booléenne $value sous forme de chaîne $expected", ({value, expected}) => {
            const {result} = renderHook(() =>
                useInput({
                    schema: z.boolean(),
                    value,
                    onChange: vi.fn()
                })
            );

            expect(result.current.stringValue).toBe(expected);
        });
    });
});
