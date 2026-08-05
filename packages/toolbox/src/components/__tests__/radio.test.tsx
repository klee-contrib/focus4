import {fireEvent, render} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {RadioButton, RadioGroup} from "../radio";

const radioTheme = {
    dot: "rb-dot",
    input: "rb-input",
    label: "rb-label",
    outline: "rb-outline",
    radio: "rb",
    state: "rb-state"
};

describe("Radio components", () => {
    setupComponentTest();

    test("Rend un input[type=radio] par bouton", () => {
        const {container} = render(
            <RadioGroup onChange={() => undefined} value="A">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
                <RadioButton label="Beta" theme={radioTheme} value="B" />
            </RadioGroup>
        );

        const inputs = container.querySelectorAll("input[type='radio']");
        expect(inputs).toHaveLength(2);
    });

    test("Le bouton dont value = valeur du groupe est coché", () => {
        const {container} = render(
            <RadioGroup onChange={() => undefined} value="B">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
                <RadioButton label="Beta" theme={radioTheme} value="B" />
            </RadioGroup>
        );

        const inputs = container.querySelectorAll<HTMLInputElement>("input[type='radio']");
        expect(inputs[0].checked).toBe(false);
        expect(inputs[1].checked).toBe(true);
    });

    test("Appelle onChange avec la valeur du bouton cliqué", () => {
        const onChange = vi.fn();
        const {container} = render(
            <RadioGroup onChange={onChange} value="A">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
                <RadioButton label="Beta" theme={radioTheme} value="B" />
            </RadioGroup>
        );

        const inputs = container.querySelectorAll<HTMLInputElement>("input[type='radio']");
        fireEvent.click(inputs[1]);
        expect(onChange).toHaveBeenCalledWith("B");
    });

    test("allowUndefined=true permet de désélectionner le bouton coché", () => {
        const onChange = vi.fn();
        const {container} = render(
            <RadioGroup allowUndefined onChange={onChange} value="A">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
            </RadioGroup>
        );

        fireEvent.click(container.querySelector("input")!);
        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test("allowUndefined=false garde la valeur au clic sur le bouton coché", () => {
        const onChange = vi.fn();
        const {container} = render(
            <RadioGroup onChange={onChange} value="A">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
            </RadioGroup>
        );

        fireEvent.click(container.querySelector("input")!);
        expect(onChange).toHaveBeenCalledWith("A");
    });

    test("disabled sur le groupe désactive tous les boutons", () => {
        const onChange = vi.fn();
        const {container} = render(
            <RadioGroup disabled onChange={onChange} value="A">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
                <RadioButton label="Beta" theme={radioTheme} value="B" />
            </RadioGroup>
        );

        const inputs = container.querySelectorAll<HTMLInputElement>("input[type='radio']");
        expect(inputs[0].disabled).toBe(true);
        expect(inputs[1].disabled).toBe(true);
        fireEvent.click(inputs[1]);
        expect(onChange).not.toHaveBeenCalled();
    });

    test("disabled sur un bouton unique ne désactive que celui-là", () => {
        const {container} = render(
            <RadioGroup onChange={() => undefined} value="A">
                <RadioButton disabled label="Alpha" theme={radioTheme} value="A" />
                <RadioButton label="Beta" theme={radioTheme} value="B" />
            </RadioGroup>
        );

        const inputs = container.querySelectorAll<HTMLInputElement>("input[type='radio']");
        expect(inputs[0].disabled).toBe(true);
        expect(inputs[1].disabled).toBe(false);
    });

    test("Affiche le libellé de chaque bouton", () => {
        const {container} = render(
            <RadioGroup onChange={() => undefined} value="A">
                <RadioButton label="Alpha" theme={radioTheme} value="A" />
                <RadioButton label="Beta" theme={radioTheme} value="B" />
            </RadioGroup>
        );

        expect(container.textContent).toContain("Alpha");
        expect(container.textContent).toContain("Beta");
    });
});

