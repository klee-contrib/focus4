import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {makeLocalCollectionStore} from "@focus4/stores";

import {i18nCollections} from "../../translation";
import {Summary} from "../summary";

const summaryTheme = {chip: "summary-chip", print: "summary-print", summary: "summary"};

function createStore() {
    const store = makeLocalCollectionStore<{category: string}>({
        facetDefinitions: [{code: "category", fieldName: "category", isMultiSelectable: true, label: "Category"}]
    });
    store.list = [{category: "A"}, {category: "B"}];
    store.query = "alpha";
    store.addFacetValue("category", "A", "selected");
    store.groupingKey = "category";
    store.sort = [{fieldName: "category"}];
    return store;
}

describe("Summary", () => {
    setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

    test("affiche les résultats, la requête, la facette, le groupe, le tri et l'export", () => {
        const store = createStore();
        const exportAction = vi.fn();
        renderWithTheme(
            <Summary
                exportAction={exportAction}
                orderableColumnList={[{label: "Category", sort: [{fieldName: "category"}]}]}
                store={store}
                theme={summaryTheme}
            />
        );

        expect(screen.getByText("résultat").textContent).toBe("1 résultat");
        for (const text of ['pour "alpha"', 'Category : "A"', "Category"]) {
            expect(screen.getByText(text).textContent).toBe(text);
        }
        fireEvent.click(screen.getByRole("button", {name: "Exporter"}));
        expect(exportAction).toHaveBeenCalledTimes(1);
    });

    test("supprime les chips de groupe et de facette", () => {
        const store = createStore();
        store.groupingKey = undefined;
        renderWithTheme(
            <Summary
                orderableColumnList={[{label: "Category", sort: [{fieldName: "category"}]}]}
                store={store}
                theme={summaryTheme}
            />
        );

        const buttons = screen.getAllByRole("button");
        for (const button of buttons) {
            fireEvent.click(button);
        }
        expect(store.groupingKey).toBeUndefined();
        expect(store.inputFacets).toEqual({});
    });

    test("affiche et supprime une chip de tri", () => {
        const store = makeLocalCollectionStore<{category: string}>();
        store.list = [{category: "A"}, {category: "B"}];
        store.sort = [{fieldName: "category"}];
        renderWithTheme(
            <Summary
                orderableColumnList={[{label: "Category", sort: [{fieldName: "category"}]}]}
                store={store}
                theme={summaryTheme}
            />
        );

        fireEvent.click(screen.getAllByRole("button")[0]);
        expect(store.sort).toEqual([]);
    });

    test("gère le masquage par liste et un tri non supprimable", () => {
        const store = makeLocalCollectionStore<{category: string}>();
        store.list = [{category: "A"}, {category: "B"}];
        store.sort = [{fieldName: "category"}];
        renderWithTheme(
            <Summary
                canRemoveSort={false}
                hideCriteria={[]}
                orderableColumnList={[{label: "Category", sort: [{fieldName: "category"}]}]}
                store={store}
                theme={summaryTheme}
            />
        );

        expect(screen.getByText("Category").textContent).toBe("Category");
        expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    test("respecte les options de visibilité", () => {
        const store = createStore();
        renderWithTheme(
            <Summary
                hideCriteria
                hideFacets
                hideGroup
                hideQuery
                hideResults
                hideSort
                store={store}
                theme={summaryTheme}
            />
        );

        expect(screen.queryByText(/result/)).toBeNull();
        expect(screen.queryByText(/alpha/)).toBeNull();
        expect(screen.queryByText("A")).toBeNull();
    });
});
