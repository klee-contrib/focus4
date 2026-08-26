import {fireEvent, render} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {setupComponentTest} from "../../__tests__/test-utils";
import {AutocompleteSearch} from "../autocomplete";

describe("AutocompleteSearch component", () => {
    setupComponentTest();

    test("Rend un input", () => {
        const {container} = render(
            <AutocompleteSearch onChange={() => undefined} querySearcher={async () => []} schema={z.string()} />
        );

        expect(container.querySelector("input")).toBeTruthy();
    });

    test("Affiche l'erreur en supportingText", () => {
        const {container} = render(
            <AutocompleteSearch
                error="Champ invalide"
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        expect(container.textContent).toContain("Champ invalide");
    });

    test("querySearcher est appelé lors de la saisie", async () => {
        const querySearcher = vi.fn(async () => [{key: "A", label: "Alpha"}]);
        const {container} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
            />
        );

        const input = container.querySelector("input")!;
        fireEvent.change(input, {target: {value: "al"}});

        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(querySearcher).toHaveBeenCalled();
    });

    test("onQueryChange est appelé lors de la saisie", () => {
        const onQueryChange = vi.fn();
        const {container} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                onQueryChange={onQueryChange}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        const input = container.querySelector("input")!;
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
        const {container, rerender} = render(
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
        expect(container.querySelector("input")?.value).toBe("");
    });

    test("searchOnEmptyQuery lance la recherche au focus", async () => {
        const querySearcher = vi.fn(async () => []);
        const {container} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
                searchOnEmptyQuery
            />
        );

        const input = container.querySelector("input")!;
        fireEvent.focus(input);
        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(querySearcher).toHaveBeenCalled();
    });

    test("Ne lance pas la recherche pour une query vide sans searchOnEmptyQuery", async () => {
        const querySearcher = vi.fn(async () => []);
        const {container} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
            />
        );

        const input = container.querySelector("input")!;
        fireEvent.change(input, {target: {value: "  "}});
        await new Promise(resolve => {
            setTimeout(resolve, 30);
        });
        expect(querySearcher).not.toHaveBeenCalled();
    });

    test("disabled peut être une liste de valeurs sans désactiver l'input global", () => {
        const {container} = render(
            <AutocompleteSearch
                disabled={["A", "B"]}
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        // Une liste de valeurs désactivées ne rend pas l'input désactivé.
        expect(container.querySelector("input")?.disabled).toBe(false);
    });

    test("disabled=true désactive l'input", () => {
        const {container} = render(
            <AutocompleteSearch
                disabled
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
            />
        );

        expect(container.querySelector("input")?.disabled).toBe(true);
    });

    test("Query vide efface les résultats quand pas de searchOnEmptyQuery", async () => {
        const querySearcher = vi.fn(async () => [{key: "A", label: "Alpha"}]);
        const {container} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={querySearcher}
                schema={z.string()}
                searchDelay={0}
            />
        );

        const input = container.querySelector("input")!;
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
        const {container} = render(
            <AutocompleteSearch
                onChange={() => undefined}
                querySearcher={async () => []}
                schema={z.string()}
                supportingText="Aide"
            />
        );

        expect(container.textContent).toContain("Aide");
    });
});
