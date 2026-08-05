import {render} from "@testing-library/react";
import i18next from "i18next";
import {createElement, PropsWithChildren} from "react";
import {I18nextProvider} from "react-i18next";
import {describe, expect, test} from "vitest";
import z from "zod";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Display} from "../display";

const displayTheme = {
    display: "display-root",
    lists: "display-lists"
};

const wrapper = ({children}: PropsWithChildren) => createElement(I18nextProvider, {i18n: i18next}, children);

describe("Display component", () => {
    setupComponentTest({beta: "Beta"});

    test("Affiche la valeur retournée par le formatter", () => {
        const {container} = render(
            <Display formatter={value => `v-${value ?? ""}`} schema={z.string()} theme={displayTheme} value="a" />,
            {wrapper}
        );

        expect(container.textContent).toBe("v-a");
    });

    test("Ajoute l'attribut data-name quand le prop name est fourni", () => {
        const {container} = render(<Display name="mon-champ" schema={z.string()} theme={displayTheme} value="a" />, {
            wrapper
        });

        expect(container.querySelector("[data-name='mon-champ']")).toBeTruthy();
    });

    test.each([
        {mode: "lists" as const, values: ["a", "b"], expectHasUl: true},
        {mode: "lists-if-multiple" as const, values: ["a", "b"], expectHasUl: true},
        {mode: "lists-if-multiple" as const, values: ["a"], expectHasUl: false},
        {mode: "inline" as const, values: ["a", "b"], expectHasUl: false}
    ])(
        "Affiche les valeurs multiples en $mode (avec $values.length éléments) — <ul> présent: $expectHasUl",
        ({mode, values, expectHasUl}) => {
            const {container} = render(
                <Display
                    formatter={v => v as string}
                    multiValueDisplay={mode}
                    schema={z.array(z.string())}
                    theme={displayTheme}
                    value={values as any}
                />,
                {wrapper}
            );

            expect(container.querySelector("ul") !== null).toBe(expectHasUl);
        }
    );

    test("En mode inline, les valeurs multiples sont jointes par ', '", () => {
        const {container} = render(
            <Display
                formatter={v => v as string}
                multiValueDisplay="inline"
                schema={z.array(z.string())}
                theme={displayTheme}
                value={["x", "y", "z"] as any}
            />,
            {wrapper}
        );

        expect(container.textContent).toBe("x, y, z");
    });

    test("En mode lists avec liste vide, aucune <ul> n'est rendue", () => {
        const {container} = render(
            <Display
                formatter={v => v as string}
                multiValueDisplay="lists"
                schema={z.array(z.string())}
                theme={displayTheme}
                value={[] as any}
            />,
            {wrapper}
        );

        expect(container.querySelector("ul")).toBeNull();
    });

    test("listChunkSize découpe la liste en plusieurs <ul>", () => {
        const {container} = render(
            <Display
                formatter={v => v as string}
                listChunkSize={2}
                multiValueDisplay="lists"
                schema={z.array(z.string())}
                theme={displayTheme}
                value={["a", "b", "c", "d", "e"] as any}
            />,
            {wrapper}
        );

        expect(container.querySelectorAll("ul").length).toBe(3);
    });
});
