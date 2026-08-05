import type {ChangeEvent, ClipboardEvent, KeyboardEvent} from "react";

export function createInput(value = "", start?: number, end?: number) {
    const input = document.createElement("input");
    input.value = value;

    if (start !== undefined) {
        input.setSelectionRange(start, end ?? start);
    }

    return input;
}

export const asInputChangeEvent = (input: HTMLInputElement) =>
    ({
        currentTarget: input
    }) as ChangeEvent<HTMLInputElement>;

export const asKeyboardEvent = (event: {
    altKey: boolean;
    ctrlKey: boolean;
    currentTarget: HTMLInputElement;
    key: string;
    metaKey: boolean;
    preventDefault: () => void;
}) => event as unknown as KeyboardEvent<HTMLInputElement>;

export const asPasteEvent = (event: {
    clipboardData: {
        getData: (format: string) => string;
    };
    currentTarget: HTMLInputElement;
    preventDefault: () => void;
}) => event as unknown as ClipboardEvent<HTMLInputElement>;
