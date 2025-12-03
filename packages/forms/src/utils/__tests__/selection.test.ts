import {describe, expect, test} from "vitest";

import {getInputSelection} from "../selection";

describe("selection", () => {
    describe("getInputSelection", () => {
        test("retourne la sélection d'un input", () => {
            const input = document.createElement("input");
            input.value = "test";
            input.setSelectionRange(1, 3);

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
});
