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

        expect((container.firstElementChild as HTMLElement).dataset.name).toBe("mon-champ");
    });

    test.each([
        {mode: "lists" as const, values: ["a", "b"], expectedLists: 1},
        {mode: "lists" as const, values: [], expectedLists: 0},
        {mode: "lists-if-multiple" as const, values: ["a", "b"], expectedLists: 1},
        {mode: "lists-if-multiple" as const, values: ["a"], expectedLists: 0},
        {mode: "inline" as const, values: ["a", "b"], expectedLists: 0}
    ])(
        "Affiche les valeurs multiples en $mode (avec $values.length éléments) — listes: $expectedLists",
        ({mode, values, expectedLists}) => {
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

            expect(container.querySelectorAll("ul")).toHaveLength(expectedLists);
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
