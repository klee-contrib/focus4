import {ClipboardEvent, ClipboardEventHandler, KeyboardEvent, KeyboardEventHandler, useCallback, useMemo} from "react";

import {getInputSelection, InputSelection, setInputSelection} from "./selection";

export interface InputMaskFormatOptions {
    transform?: (char: string) => string;
    validate: (char: string) => boolean;
}

/** Définition d'un masque de saisie. */
export interface MaskDefinition {
    /** Formatters personnalisés par caractère. */
    formatCharacters?: Record<string, InputMaskFormatOptions>;
    /** Affiche le masque au fur et à mesure de la saisie. */
    isRevealingMask?: boolean;
    /** Le masque de saisie */
    pattern: string;
    /** Caractère utilisé pour les caractères manquant. Par défaut : "_". */
    placeholderChar?: string;
}

const escapeChar = "\\";
const digitRegex = /^\d$/;
const letterRegex = /^[A-Za-z]$/;
const alphanumericRegex = /^[\dA-Za-z]$/;
const defaultFormatCharacters: Record<string, InputMaskFormatOptions> = {
    "*": {
        validate(char: string) {
            return alphanumericRegex.test(char);
        }
    },
    1: {
        validate(char: string) {
            return digitRegex.test(char);
        }
    },
    a: {
        validate(char: string) {
            return letterRegex.test(char);
        }
    },
    A: {
        validate(char: string) {
            return letterRegex.test(char);
        },
        transform(char: string) {
            return char.toUpperCase();
        }
    },
    "#": {
        validate(char: string) {
            return alphanumericRegex.test(char);
        },
        transform(char: string) {
            return char.toUpperCase();
        }
    }
};

export function useMask({
    value,
    onChange,
    onKeyDown,
    onPaste,
    pattern: sourcePattern,
    formatCharacters: pFormatCharacters,
    isRevealingMask = false,
    placeholderChar = "_"
}: Partial<MaskDefinition> & {
    value?: string;
    onChange?: (value: string) => void;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onPaste?: ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
    if (placeholderChar.length > 1) {
        throw new Error("InputMask: placeholderChar should be a single character or an empty string.");
    }

    const formatCharacters = useMemo(() => {
        if (pFormatCharacters) {
            const merged = {...defaultFormatCharacters};
            const chars = Object.keys(pFormatCharacters);
            for (let i = 0, l = chars.length; i < l; i++) {
                const char = chars[i];
                if (!pFormatCharacters[char]) {
                    delete merged[char];
                } else {
                    merged[char] = pFormatCharacters[char];
                }
            }
            return merged;
        } else {
            return defaultFormatCharacters;
        }
    }, [pFormatCharacters]);

    const {pattern, firstEditableIndex, lastEditableIndex, editableIndices} = useMemo(() => {
        if (!sourcePattern) {
            return {pattern: [], firstEditableIndex: 0, lastEditableIndex: 0, editableIndices: {}};
        }

        const sourceChars = sourcePattern.split("");
        let patternIndex = 0;
        const p = [];

        let fei;
        let lei;
        const ei: Record<string, boolean> = {};

        for (let i = 0, l = sourceChars.length; i < l; i++) {
            let char = sourceChars[i];
            if (char === escapeChar) {
                if (i === l - 1) {
                    throw new Error(`InputMask: pattern ends with a raw ${escapeChar}`);
                }
                char = sourceChars[++i];
            } else if (char in formatCharacters) {
                if (fei === undefined) {
                    fei = patternIndex;
                }
                lei = patternIndex;
                ei[patternIndex] = true;
            }

            p.push(char);
            patternIndex++;
        }

        if (fei === undefined || lei === undefined) {
            throw new Error(`InputMask: pattern "${sourcePattern}" does not contain any editable characters.`);
        }

        return {pattern: p, firstEditableIndex: fei, lastEditableIndex: lei, editableIndices: ei};
    }, [formatCharacters, sourcePattern]);

    const isEditableIndex = useCallback(
        function isEditableIndex(index: number) {
            return !!editableIndices[index];
        },
        [editableIndices]
    );

    const isValidAtIndex = useCallback(
        function isValidAtIndex(char: string, index: number) {
            return (
                (!isRevealingMask && char === placeholderChar) ||
                (formatCharacters[pattern[index]]?.validate(char) ?? false)
            );
        },
        [formatCharacters, isRevealingMask, pattern, placeholderChar]
    );

    const transform = useCallback(
        function transform(char: string, index: number) {
            const format = formatCharacters[pattern[index]];
            return typeof format?.transform === "function" ? format.transform(char) : char;
        },
        [formatCharacters, pattern]
    );

    const format = useCallback(
        function format(v: string[]) {
            const valueBuffer: string[] = new Array(pattern.length);
            let valueIndex = 0;

            for (let i = 0, l = pattern.length; i < l; i++) {
                if (isEditableIndex(i)) {
                    if (isRevealingMask && v.length <= valueIndex && !isValidAtIndex(v[valueIndex], i)) {
                        break;
                    }
                    valueBuffer[i] =
                        v.length > valueIndex && isValidAtIndex(v[valueIndex], i)
                            ? transform(v[valueIndex], i)
                            : placeholderChar;
                    valueIndex++;
                } else {
                    valueBuffer[i] = pattern[i];
                    /*
                     * Also allow the value to contain static values from the pattern by
                     * advancing its index.
                     */
                    if (v.length > valueIndex && v[valueIndex] === pattern[i]) {
                        valueIndex++;
                    }
                }
            }

            return valueBuffer;
        },
        [isEditableIndex, transform, placeholderChar, isValidAtIndex, isRevealingMask, pattern]
    );

    const emptyValue = useMemo(() => format([]).join(""), [format]);

    const characters = useMemo(() => format(value?.split("") ?? []), [format, value]);

    const rawValue = useMemo(() => {
        const rv = [];
        for (let i = 0; i < characters.length; i++) {
            if (editableIndices[i]) {
                rv.push(characters[i]);
            }
        }
        return rv.join("");
    }, [characters, editableIndices]);

    const stringValue = useMemo(
        () => (isRevealingMask ? format(rawValue.split("")) : characters).join(""),
        [characters, format, isRevealingMask, rawValue]
    );

    const input = useCallback(
        function input(char: string, chars: string[], selection: InputSelection) {
            // Ignore additional input if the cursor's at the end of the pattern
            if (selection.start === selection.end && selection.start === pattern.length) {
                return false;
            }

            let inputIndex = selection.start;

            /*
             * If the cursor or selection is prior to the first editable character, make
             * sure any input given is applied to it.
             */
            if (inputIndex < firstEditableIndex) {
                inputIndex = firstEditableIndex;
            }

            const newCharacters = [...chars];

            let index = inputIndex;

            while (!(isEditableIndex(index) || char === characters[index]) && index < pattern.length) {
                index++;
            }

            if (index === pattern.length || (!isValidAtIndex(char, index) && char !== characters[index])) {
                return false;
            }

            newCharacters[index] = transform(char, index);

            /*
             * If multiple characters were selected, blank the remainder out based on the
             * pattern.
             */
            let end = selection.end - 1;
            while (end > index) {
                if (isEditableIndex(end)) {
                    newCharacters[end] = placeholderChar;
                }
                end--;
            }

            // Advance the cursor to the next character
            return {characters: newCharacters, selection: {start: index + 1, end: index + 1}};
        },
        [characters, firstEditableIndex, isEditableIndex, isValidAtIndex, onChange, pattern, placeholderChar]
    );

    const backspace = useCallback(
        function backspace(selection: InputSelection) {
            // If the cursor is at the start there's nothing to do
            if (selection.start === 0 && selection.end === 0) {
                return false;
            }

            let newCharacters = [...characters];

            // No range selected - work on the character preceding the cursor
            if (selection.start === selection.end) {
                if (isEditableIndex(selection.start - 1)) {
                    newCharacters[selection.start - 1] = placeholderChar;
                }
                selection.start--;
                selection.end--;
            }

            // Range selected - delete characters and leave the cursor at the start of the selection
            else {
                let end = selection.end - 1;
                while (end >= selection.start) {
                    if (isEditableIndex(end)) {
                        newCharacters[end] = placeholderChar;
                    }
                    end--;
                }
                selection.end = selection.start;
            }

            if (isRevealingMask) {
                const firstPlaceholderCharIndex = newCharacters.findIndex(c => c === placeholderChar);
                if (firstPlaceholderCharIndex >= 0) {
                    newCharacters = newCharacters.slice(0, firstPlaceholderCharIndex);
                }
            }

            return {characters: newCharacters, selection};
        },
        [characters, isEditableIndex, isRevealingMask, placeholderChar]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            let result: ReturnType<typeof input> = false;
            const selection = getInputSelection(e.currentTarget);
            const selectedText = e.currentTarget.value.substring(selection.start, selection.end);
            const isCut = e.ctrlKey && e.key === "x" && selectedText;
            if (e.key === "Backspace" || e.key === "Delete" || isCut) {
                e.preventDefault();

                if (e.key === "Delete") {
                    selection.start++;
                    selection.end++;
                }

                result = backspace(selection);

                if (isCut) {
                    navigator.clipboard.writeText(selectedText);
                }
            } else if (!(e.metaKey || e.altKey || e.ctrlKey || e.key === "Enter" || e.key.startsWith("Arrow"))) {
                e.preventDefault();
                result = input(e.key || (e as any).data, characters, selection);
            }

            if (result) {
                const newValue = result.characters.join("");
                setInputSelection(e.currentTarget, result.selection);
                if (newValue !== value) {
                    onChange?.(newValue);
                }
            }

            onKeyDown?.(e);
        },
        [backspace, characters, input, onChange, onKeyDown, value]
    );

    const handlePaste = useCallback(
        (e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            e.preventDefault();
            let selection = getInputSelection(e.currentTarget);
            let text = e.clipboardData.getData("Text");

            /*
             * If there are static characters at the start of the pattern and the cursor
             * or selection is within them, the static characters must match for a valid
             * paste.
             */
            if (selection.start < firstEditableIndex) {
                for (let i = 0, l = firstEditableIndex - selection.start; i < l; i++) {
                    if (text.charAt(i) !== pattern[i]) {
                        onPaste?.(e);
                        return;
                    }
                }

                /*
                 * Continue as if the selection and input started from the editable part of
                 * the pattern.
                 */
                text = text.substring(firstEditableIndex - selection.start);
                selection.start = firstEditableIndex;
            }

            let newCharacters = [...characters];

            for (let i = 0, l = text.length; i < l && selection.start <= lastEditableIndex; i++) {
                const valid = input(text.charAt(i), newCharacters, selection);

                /*
                 * Allow static parts of the pattern to appear in pasted input - they will
                 * already have been stepped over by input(), so verify that the value
                 * deemed invalid by input() was the expected static character.
                 */
                if (!valid) {
                    if (selection.start > 0) {
                        // This only allows for one static character to be skipped
                        const patternIndex = selection.start - 1;
                        if (!isEditableIndex(patternIndex) && text.charAt(i) === pattern[patternIndex]) {
                            continue;
                        }
                    }
                    onPaste?.(e);
                    return;
                }

                newCharacters = valid.characters;
                // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                selection = valid.selection;
            }

            const newValue = newCharacters.join("");
            setInputSelection(e.currentTarget, selection);
            if (newValue !== value) {
                onChange?.(newValue);
            }

            onPaste?.(e);
        },
        [characters, firstEditableIndex, lastEditableIndex, input, onChange, onPaste, pattern]
    );

    if (!sourcePattern) {
        return {stringValue: value, handleKeyDown: onKeyDown, handlePaste: onPaste};
    }

    return {
        stringValue: !stringValue || stringValue === emptyValue ? "" : stringValue,
        handleKeyDown,
        handlePaste
    };
}
