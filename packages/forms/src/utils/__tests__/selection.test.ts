import {afterEach, describe, expect, test, vi} from "vitest";

import {getInputSelection, setInputSelection} from "../selection";

import {createInput} from "./test-utils";

function runAnimationFrameImmediately() {
    return vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(callback => {
        callback(0);
        return 0;
    });
}

describe("selection", () => {
    afterEach(() => vi.restoreAllMocks());

    describe("getInputSelection", () => {
        test("retourne la sélection d'un input", () => {
            const input = createInput("test", 1, 3);

            const selection = getInputSelection(input);

            expect(selection).toEqual({start: 1, end: 3});
        });

        test("fonctionne avec textarea", () => {
            const textarea = document.createElement("textarea");
            textarea.value = "test";
            textarea.setSelectionRange(2, 4);

            const selection = getInputSelection(textarea);

            expect(selection).toEqual({start: 2, end: 4});
        });
    });

    describe("setInputSelection", () => {
        test("applique la sélection via setSelectionRange", () => {
            const requestAnimationFrame = runAnimationFrameImmediately();
            const input = createInput();
            const setSelectionRange = vi.spyOn(input, "setSelectionRange");

            setInputSelection(input, {start: 1, end: 3});

            expect(requestAnimationFrame).toHaveBeenCalledOnce();
            expect(setSelectionRange).toHaveBeenCalledWith(1, 3);
        });

        test("ignore un second appel tant que le frame est en attente", () => {
            let scheduled: FrameRequestCallback | undefined;
            vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(cb => {
                scheduled = cb;
                return 0;
            });

            const input = createInput();
            const setSelectionRange = vi.spyOn(input, "setSelectionRange");

            setInputSelection(input, {start: 1, end: 2});
            setInputSelection(input, {start: 3, end: 4});

            expect(setSelectionRange).not.toHaveBeenCalled();

            scheduled?.(0);

            expect(setSelectionRange).toHaveBeenCalledTimes(1);
            expect(setSelectionRange).toHaveBeenCalledWith(1, 2);
        });

        test("n'échoue pas si setSelectionRange lève une erreur", () => {
            runAnimationFrameImmediately();
            const input = createInput();
            vi.spyOn(input, "setSelectionRange").mockImplementation(() => {
                throw new Error("not focused");
            });

            expect(() => setInputSelection(input, {start: 0, end: 1})).not.toThrow();
        });
    });
});
