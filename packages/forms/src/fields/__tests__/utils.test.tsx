import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {e} from "@focus4/entities";
import {makeField, makeReferenceList} from "@focus4/stores";

import {autocompleteFor, fieldFor, registerFieldComponent, selectFor} from "../utils";

describe("fields utils", () => {
    const field = makeField("", e.field({schema: z.string()} as Domain));

    test("fieldFor crée un champ input avec les options", () => {
        const FieldComponent = vi.fn(() => null);
        registerFieldComponent(FieldComponent);

        const options = {className: "input-field", inputProps: {maxLength: 10}};
        const element = fieldFor(field, options);

        expect(element.props.field).toBe(field);
        expect(element.props.inputType).toBe("input");
        expect(element.props.className).toBe("input-field");
        expect(element.props.inputProps).toEqual({maxLength: 10});
    });

    test("autocompleteFor injecte keyResolver et querySearcher", () => {
        const FieldComponent = vi.fn(() => null);
        registerFieldComponent(FieldComponent);

        const keyResolver = vi.fn();
        const querySearcher = vi.fn();

        const element = autocompleteFor(field, {
            autocompleteProps: {size: "small"},
            keyResolver,
            querySearcher
        });

        expect(element.props.inputType).toBe("autocomplete");
        expect(element.props.autocompleteProps).toEqual({
            size: "small",
            keyResolver,
            querySearcher
        });
    });

    test("selectFor fusionne selectProps avec values", () => {
        const FieldComponent = vi.fn(() => null);
        registerFieldComponent(FieldComponent);

        const values = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"}
        ]);

        const element = selectFor(field, values, {
            selectProps: {multiple: true}
        });

        expect(element.props.inputType).toBe("select");
        expect(element.props.selectProps).toEqual({
            multiple: true,
            values
        });
    });
});
