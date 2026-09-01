import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {setupComponentTest} from "../../__tests__/test-utils";
import {AutocompleteSearch} from "../autocomplete";

describe("AutocompleteSearch component", () => {
    setupComponentTest();

    test("Rend un input", () => {
        render(<AutocompleteSearch onChange={() => undefined} querySearcher={async () => []} schema={z.string()} />);

        expect(screen.getByRole("combobox")).toBeInstanceOf(HTMLInputElement);
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <AutocompleteSearch
                error="Champ invalide"
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        expect(screen.getByText("Champ invalide").textContent).toBe("Champ invalide");
    });

    test("querySearcher est appelé lors de la saisie", async () => {
        const querySearcher = vi.fn(async () => [{key: "A", label: "Alpha"}]);
        render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
            />
        );

        const input = screen.getByRole("combobox") as HTMLInputElement;
        fireEvent.change(input, {target: {value: "al"}});

        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(querySearcher).toHaveBeenCalled();
    });

    test("onQueryChange est appelé lors de la saisie", () => {
        const onQueryChange = vi.fn();
        render(
            <AutocompleteSearch
                onChange={() => undefined}
                onQueryChange={onQueryChange}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        const input = screen.getByRole("combobox") as HTMLInputElement;
        fireEvent.change(input, {target: {value: "abc"}});
        expect(onQueryChange).toHaveBeenCalledWith("abc");
    });

    test("keyResolver est appelé pour la valeur initiale", async () => {
        const keyResolver = vi.fn(async () => "Alpha");
        render(
            <AutocompleteSearch
                keyResolver={keyResolver}
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
                value="A"
            />
        );

        await new Promise(resolve => {
            setTimeout(resolve, 50);
        });
        expect(keyResolver).toHaveBeenCalledWith("A");
    });

    test("Réinitialise la query quand value passe à undefined", async () => {
        const {rerender} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                query="hello"
                querySearcher={async () => []}
                schema={z.string()}
                value="X"
            />
        );

        rerender(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
                value={undefined}
            />
        );
        expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
    });

    test("searchOnEmptyQuery lance la recherche au focus", async () => {
        const querySearcher = vi.fn(async () => []);
        render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
                searchOnEmptyQuery
            />
        );

        const input = screen.getByRole("combobox") as HTMLInputElement;
        fireEvent.focus(input);
        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(querySearcher).toHaveBeenCalled();
    });

    test("Ne lance pas la recherche pour une query vide sans searchOnEmptyQuery", async () => {
        const querySearcher = vi.fn(async () => []);
        render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
            />
        );

        const input = screen.getByRole("combobox") as HTMLInputElement;
        fireEvent.change(input, {target: {value: "  "}});
        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(querySearcher).not.toHaveBeenCalled();
    });

    test.each([
        {disabled: ["A", "B"], expected: false},
        {disabled: true, expected: true}
    ])("disabled=$disabled définit l'état natif de l'input à $expected", ({disabled, expected}) => {
        render(
            <AutocompleteSearch
                disabled={disabled}
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        expect((screen.getByRole("combobox") as HTMLInputElement).disabled).toBe(expected);
    });

    test("Query vide efface les résultats quand pas de searchOnEmptyQuery", async () => {
        const querySearcher = vi.fn(async () => [{key: "A", label: "Alpha"}]);
        render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
            />
        );

        const input = screen.getByRole("combobox") as HTMLInputElement;
        fireEvent.change(input, {target: {value: "a"}});
        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        fireEvent.change(input, {target: {value: ""}});
        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(input.value).toBe("");
    });

    test("supportingText est affiché en l'absence d'erreur", () => {
        render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
                supportingText="Aide"
            />
        );

        expect(screen.getByText("Aide").textContent).toBe("Aide");
    });
});
