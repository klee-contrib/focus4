import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {FieldEntry} from "@focus4/entities";
import {EntityField, makeField, UndefinedComponent} from "@focus4/stores";

import {setupComponentTest} from "../../__tests__/test-utils";
import {domain} from "../../domain";
import {Field} from "../field";
import {FormCore} from "../form";

const fieldTheme = {
    field: "field-root",
    label: "field-label",
    value: "field-value"
};

const formTheme = {
    form: "form-root"
};

setupComponentTest();

const LabelComponent = ({id, label}: {id: string; label?: string}) => (
    <label data-testid={`label-${id}`}>{label}</label>
);
const InputComponent = ({value}: {value?: unknown}) => (
    <input data-testid="field-input" defaultValue={`${value ?? ""}`} />
);
const DisplayComponent = ({value}: {value?: unknown}) => <div data-testid="field-display">{`${value ?? ""}`}</div>;

type TestField = EntityField<FieldEntry> & {
    _isEdit: boolean;
    errors: string[];
};

function createField(options: {isEdit?: boolean; fieldProps?: FieldOptions<FieldEntry>} = {}): TestField {
    const textDomain = domain(z.string(), {
        className: "domain-class",
        fieldProps: options.fieldProps,
        LabelComponent,
        InputComponent,
        DisplayComponent,
        AutocompleteComponent: UndefinedComponent,
        SelectComponent: UndefinedComponent
    });

    const field = makeField("name", f => f.domain(textDomain).metadata({label: "Label"}).value("Value")) as TestField;
    field._isEdit = options.isEdit ?? true;
    field.errors = [];
    return field;
}

describe("Field", () => {
    test("applique classes et variables CSS", () => {
        const field = createField({isEdit: true});

        const {container} = render(<Field field={field} labelWidth="120px" theme={fieldTheme} valueWidth="240px" />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("domain-class");
        expect(root.style.getPropertyValue("--field-label-width")).toBe("120px");
        expect(root.style.getPropertyValue("--field-value-width")).toBe("240px");
        expect(screen.getByTestId("label-name").textContent).toBe("Label");
        expect(screen.getByTestId("field-input")).toBeTruthy();
    });

    test("utilise labelWidth/valueWidth depuis fieldProps", () => {
        const field = createField({
            fieldProps: {
                labelWidth: "100px",
                valueWidth: "200px"
            }
        });

        const {container} = render(<Field field={field} theme={fieldTheme} />);
        const root = container.firstElementChild as HTMLElement;

        expect(root.style.getPropertyValue("--field-label-width")).toBe("100px");
        expect(root.style.getPropertyValue("--field-value-width")).toBe("200px");
    });

    test("affiche le display en mode lecture", () => {
        const field = createField({isEdit: false});

        render(<Field field={field} theme={fieldTheme} />);

        expect(screen.getByTestId("field-display").textContent).toBe("Value");
    });
});

describe("FormCore", () => {
    test("render un form quand save est fourni et noForm=false", () => {
        const save = vi.fn();

        render(
            <FormCore labelWidth="10rem" save={save} theme={formTheme} valueWidth="20rem">
                <button type="submit">Submit</button>
            </FormCore>
        );

        const form = document.querySelector("form") as HTMLFormElement;
        expect(form).toBeTruthy();
        expect(form.style.getPropertyValue("--field-label-width")).toBe("10rem");
        expect(form.style.getPropertyValue("--field-value-width")).toBe("20rem");

        fireEvent.submit(form);

        expect(save).toHaveBeenCalledTimes(1);
    });

    test("render un div quand noForm=true", () => {
        const save = vi.fn();

        const {container} = render(
            <FormCore noForm save={save} theme={formTheme}>
                <span data-testid="content">x</span>
            </FormCore>
        );

        expect(container.querySelector("form")).toBeNull();
        expect(container.querySelector("div")).toBeTruthy();
        expect(screen.getByTestId("content")).toBeTruthy();
    });

    test("render un div quand save est absent", () => {
        const {container} = render(
            <FormCore theme={formTheme}>
                <span>plain</span>
            </FormCore>
        );

        expect(container.querySelector("form")).toBeNull();
        expect(container.querySelector("div")).toBeTruthy();
    });
});
