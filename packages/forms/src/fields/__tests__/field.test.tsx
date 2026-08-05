import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, beforeAll, describe, expect, test, vi} from "vitest";
import z from "zod";

import {FieldEntry} from "@focus4/entities";
import {EntityField, makeField, UndefinedComponent} from "@focus4/stores";

import {useField} from "../field";
import {FormContext} from "../form";

const LabelComponent = vi.fn((props: {id: string; label: string}) => (
    <label data-testid={`label-${props.id}`}>{props.label}</label>
));
const InputComponent = vi.fn((props: {error?: string; value?: unknown}) => (
    <input data-testid="input" data-error={props.error ?? ""} defaultValue={`${props.value ?? ""}`} />
));
const SelectComponent = vi.fn((props: {value?: unknown}) => <div data-testid="select">{`${props.value ?? ""}`}</div>);
const AutocompleteComponent = vi.fn((props: {value?: unknown}) => (
    <div data-testid="autocomplete">{`${props.value ?? ""}`}</div>
));
const DisplayComponent = vi.fn((props: {value?: unknown}) => <div data-testid="display">{`${props.value ?? ""}`}</div>);

const domain = {
    schema: z.string(),
    AutocompleteComponent,
    DisplayComponent,
    LabelComponent,
    InputComponent,
    SelectComponent
};

type TestField = EntityField<FieldEntry> & {
    _isEdit: boolean;
    errors: string[];
};

function makeFormField(value = "abc", options: {errors?: string[]; isEdit?: boolean; name?: string} = {}): TestField {
    const field = makeField(options.name ?? "testName", f => f.domain(domain).metadata({label: "Test"}).value(value));
    const formField = field as unknown as TestField;
    formField._isEdit = options.isEdit ?? true;
    formField.errors = options.errors ?? [];
    return formField;
}

function InnerHarness({
    field,
    inputType = "input",
    hasLabel = true,
    showErrorWhenFocused = false
}: {
    field: TestField;
    inputType?: "input" | "select" | "autocomplete";
    hasLabel?: boolean;
    showErrorWhenFocused?: boolean;
}) {
    const {label, value, valueRef} = useField({field, inputType, hasLabel, showErrorWhenFocused});

    return (
        <>
            <div>{label}</div>
            <div ref={valueRef} data-testid="value-container">
                {value}
            </div>
        </>
    );
}

function Harness({
    field,
    inputType = "input",
    errorDisplay = "after-focus",
    hasLabel = true,
    showErrorWhenFocused = false
}: {
    field: TestField;
    inputType?: "input" | "select" | "autocomplete";
    errorDisplay?: "after-focus" | "always" | "never";
    hasLabel?: boolean;
    showErrorWhenFocused?: boolean;
}) {
    return (
        <FormContext value={{errorDisplay}}>
            <InnerHarness
                field={field}
                hasLabel={hasLabel}
                inputType={inputType}
                showErrorWhenFocused={showErrorWhenFocused}
            />
        </FormContext>
    );
}

beforeAll(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("useField", () => {
    test.each([
        ["input", "input"],
        ["select", "select"],
        ["autocomplete", "autocomplete"]
    ] as const)("render %s en mode édition", (inputType, testId) => {
        const field = makeFormField("value", {isEdit: true});
        render(<Harness field={field} inputType={inputType} />);

        expect(screen.getByTestId(testId)).toBeTruthy();
    });

    test("render display en mode consultation", () => {
        const field = makeFormField("value", {isEdit: false});
        render(<Harness field={field} inputType="input" />);

        expect(screen.getByTestId("display")).toBeTruthy();
    });

    test("masque le label si hasLabel=false", () => {
        const field = makeFormField("value", {isEdit: true});
        const view = render(<Harness field={field} hasLabel={false} />);

        expect(view.queryByTestId(/^label-/u)).toBeNull();
    });

    test("affiche l'erreur en mode always", () => {
        const field = makeFormField("value", {isEdit: true, errors: ["err.test"]});
        const view = render(<Harness field={field} errorDisplay="always" />);

        expect(within(view.container).getByTestId("input").dataset.error).toContain("err.test");
    });

    test("n'affiche pas l'erreur en mode never", () => {
        const field = makeFormField("value", {isEdit: true, errors: ["err.test"]});
        const view = render(<Harness field={field} errorDisplay="never" />);

        expect(within(view.container).getByTestId("input").dataset.error).toBe("");
    });

    test("after-focus affiche l'erreur après focus puis blur", () => {
        const field = makeFormField("value", {isEdit: true, errors: ["err.test"]});
        const view = render(<Harness field={field} errorDisplay="after-focus" />);

        const container = within(view.container).getByTestId("value-container");
        expect(within(view.container).getByTestId("input").dataset.error).toBe("");

        fireEvent.focusIn(container);
        fireEvent.focusOut(container);

        expect(within(view.container).getByTestId("input").dataset.error).toContain("err.test");
    });

    test("showErrorWhenFocused garde l'erreur visible pendant le focus", () => {
        const field = makeFormField("value", {isEdit: true, errors: ["err.test"]});
        const view = render(<Harness field={field} errorDisplay="always" showErrorWhenFocused />);

        const container = within(view.container).getByTestId("value-container");
        fireEvent.focusIn(container);

        expect(within(view.container).getByTestId("input").dataset.error).toContain("err.test");
    });

    test("génère des ids uniques pour deux champs de même nom", () => {
        const field1 = makeFormField("a", {name: "shared"});
        const field2 = makeFormField("b", {name: "shared"});

        render(
            <>
                <Harness field={field1} />
                <Harness field={field2} />
            </>
        );

        expect(screen.getByTestId("label-shared")).toBeTruthy();
        expect(screen.getByTestId("label-shared_2")).toBeTruthy();
    });

    test("log des warnings quand les composants ne sont pas définis", () => {
        const field = makeField("warnField", f =>
            f
                .domain({
                    schema: z.string(),
                    AutocompleteComponent: UndefinedComponent,
                    DisplayComponent: UndefinedComponent,
                    LabelComponent: UndefinedComponent,
                    InputComponent: UndefinedComponent,
                    SelectComponent: UndefinedComponent
                } as Domain)
                .metadata({label: "Warn"})
                .value("x")
        ) as unknown as TestField;
        field._isEdit = true;
        field.errors = [];

        render(<Harness field={field} inputType="input" />);
        render(<Harness field={field} inputType="select" />);
        render(<Harness field={field} inputType="autocomplete" />);

        field._isEdit = false;
        render(<Harness field={field} inputType="input" />);

        expect(console.warn).toHaveBeenCalled();
    });
});
