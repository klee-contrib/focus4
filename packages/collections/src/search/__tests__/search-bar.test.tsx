import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {domain} from "@focus4/form-toolbox";
import {makeLocalCollectionStore, makeServerCollectionStore} from "@focus4/stores";

import {i18nCollections} from "../../translation";
import {SearchBar} from "../search-bar";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

const searchBarTheme = {
    bar: "search-bar",
    "bar--error": "search-bar-error",
    buttons: "search-bar-buttons",
    error: "search-bar-error-text",
    errors: "search-bar-errors",
    input: "search-bar-input",
    panel: "search-bar-panel",
    searchFields: "search-bar-fields",
    searchIcon: "search-bar-icon"
};

describe("SearchBar", () => {
    test("met à jour et vide la requête d'un store local", () => {
        const store = makeLocalCollectionStore<{name: string}>({searchFields: ["name"]});

        renderWithTheme(<SearchBar placeholder="Rechercher" store={store} theme={searchBarTheme} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, {target: {value: "alpha"}});
        expect(store.query).toBe("alpha");

        fireEvent.click(screen.getAllByRole("button")[0]);
        expect(store.query).toBe("");
    });

    test("parse les critères saisis dans un store serveur", () => {
        const criteria = entity({label: e.field(domain(z.string()))});
        const store = makeServerCollectionStore<{name: string}, any>(
            () => Promise.resolve({facets: [], list: [], totalCount: 0}),
            criteria
        );
        store.availableSearchFields = ["name"];

        renderWithTheme(<SearchBar enableInputCriteria store={store} theme={searchBarTheme} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, {target: {value: "label:alpha remaining "}});

        expect((store.criteria.label as any).value).toBe("alpha");
        expect(store.query).toBe("remaining ");
        expect((input as HTMLInputElement).value).toBe("label:alpha remaining ");

        fireEvent.click(screen.getAllByRole("button")[0]);
        expect((store.criteria.label as any).value).toBeUndefined();
        expect(store.query).toBe("");
    });

    test("affiche le panneau et permet de basculer tous les champs", () => {
        const store = makeLocalCollectionStore<{name: string; code: string}>({searchFields: ["name", "code"]});

        renderWithTheme(
            <SearchBar searchFieldNames={{name: "Nom", code: "Code"}} store={store} theme={searchBarTheme} />
        );

        fireEvent.click(screen.getByRole("button", {name: /\(2\/2\)/}));
        expect(screen.getByText("Critères de recherche").textContent).toBe("Critères de recherche");
        expect(store.searchFields).toBeUndefined();

        fireEvent.click(screen.getByRole("checkbox", {name: "checkTout sélectionner"}));
        expect(store.searchFields).toEqual([]);

        fireEvent.click(screen.getByRole("checkbox", {name: "checkTout sélectionner"}));
        expect(store.searchFields).toEqual(["name", "code"]);
    });
});
