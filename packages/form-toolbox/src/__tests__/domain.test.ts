import {describe, expect, test} from "vitest";
import z from "zod";

import {UndefinedComponent} from "@focus4/stores";

import {
    AutocompleteChips,
    AutocompleteSearch,
    BooleanRadio,
    Display,
    Input,
    InputDate,
    Label,
    Select,
    SelectChips
} from "../components";
import {domain} from "../domain";

describe("domain", () => {
    test("configure les composants par défaut", () => {
        const d = domain();

        expect(d.DisplayComponent).toBe(Display);
        expect(d.LabelComponent).toBe(Label);
    });

    test("choisit les composants single-value pour string", () => {
        const d = domain(z.string());

        expect(d.InputComponent).toBe(Input);
        expect(d.SelectComponent).toBe(Select);
        expect(d.AutocompleteComponent).toBe(AutocompleteSearch);
    });

    test("choisit BooleanRadio pour boolean", () => {
        const d = domain(z.boolean());

        expect(d.InputComponent).toBe(BooleanRadio);
        expect(d.SelectComponent).toBe(Select);
        expect(d.AutocompleteComponent).toBe(AutocompleteSearch);
    });

    test("choisit InputDate pour z.iso.date", () => {
        const d = domain(z.iso.date());

        expect(d.InputComponent).toBe(InputDate);
        expect(d.SelectComponent).toBe(Select);
        expect(d.AutocompleteComponent).toBe(AutocompleteSearch);
    });

    test("choisit Input pour z.iso.datetime", () => {
        const d = domain(z.iso.datetime());

        expect(d.InputComponent).toBe(Input);
        expect(d.SelectComponent).toBe(Select);
        expect(d.AutocompleteComponent).toBe(AutocompleteSearch);
    });

    test("choisit les composants multi-value pour array(string)", () => {
        const d = domain(z.array(z.string()));

        expect(d.InputComponent).toBe(UndefinedComponent);
        expect(d.SelectComponent).toBe(SelectChips);
        expect(d.AutocompleteComponent).toBe(AutocompleteChips);
    });

    test("retourne des composants undefined pour schéma non supporté", () => {
        const d = domain(z.object({id: z.string()}));

        expect(d.InputComponent).toBe(UndefinedComponent);
        expect(d.SelectComponent).toBe(UndefinedComponent);
        expect(d.AutocompleteComponent).toBe(UndefinedComponent);
    });

    test("merge les options de domaine", () => {
        const custom = () => null;
        const d = domain(z.string(), {
            className: "my-domain",
            DisplayComponent: custom
        });

        expect(d.className).toBe("my-domain");
        expect(d.DisplayComponent).toBe(custom);
    });
});
