import {describe, expect, test} from "vitest";
import z from "zod";

import {domain} from "../../../__tests__/test-utils";
import {cloneField, fromField, makeField} from "../field";

interface EditableView {
    isEdit: boolean;
}

const asEditableView = <T>(value: T) => value as T & EditableView;

const DO_STRING = domain(z.string(), {
    displayProps: {size: "s"},
    labelProps: {position: "left"},
    fieldProps: {theme: {root: "a"}},
    displayFormatter: (v?: string) => `fmt:${v ?? ""}`
});

describe("field utils", () => {
    test("makeField en mode lecture crée un champ non éditable", () => {
        const field = makeField("hello", {
            className: "c1",
            comment: "comment",
            domain: DO_STRING,
            label: "Label",
            name: "name",
            displayProps: {color: "red"},
            fieldProps: {theme: {root: "b"}},
            labelProps: {weight: "bold"}
        });

        expect(field.value).toBe("hello");
        expect(asEditableView(field).isEdit).toBe(false);
        expect(field.$field.name).toBe("name");
        expect(field.$field.label).toBe("Label");
        expect(field.$field.domain.schema).toBe(DO_STRING.schema);
        expect(field.$field.domain.className).toBe("c1");
        expect(field.$field.domain.labelProps).toEqual(expect.objectContaining({position: "left", weight: "bold"}));
    });

    test("makeField en mode builder permet un champ éditable", () => {
        const field = makeField("name", f => f.domain(DO_STRING).value("abc"));

        expect(field.value).toBe("abc");
        expect(asEditableView(field).isEdit).toBe(true);
        expect(field.$field.name).toBe("name");
    });

    test("cloneField partage la valeur avec la source", () => {
        const source = makeField("name", f => f.domain(DO_STRING).value("x"));
        const cloned = cloneField(source, false);

        expect(asEditableView(cloned).isEdit).toBe(false);
        expect(cloned.value).toBe("x");

        cloned.value = "y";

        expect(source.value).toBe("y");
    });

    test("fromField conserve les métadonnées et permet override", () => {
        const source = makeField("value", {
            domain: DO_STRING,
            name: "code",
            label: "Original"
        });

        const copied = fromField(source, {
            label: "Copie",
            className: "copied"
        });

        expect(copied.value).toBe("value");
        expect(copied.$field.name).toBe("code");
        expect(copied.$field.label).toBe("Copie");
        expect(asEditableView(copied).isEdit).toBe(false);
    });
});
