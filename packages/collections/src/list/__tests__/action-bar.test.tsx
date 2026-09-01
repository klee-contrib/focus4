import {defaultAppTheme, renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {makeLocalCollectionStore} from "@focus4/stores";
import {ThemeProvider} from "@focus4/styling";

import {i18nCollections} from "../../translation";
import {ActionBar} from "../action-bar";

const actionBarTheme = {
    bar: "action-bar",
    buttons: "action-bar-buttons",
    container: "action-bar-container",
    facetBox: "action-bar-facet-box",
    facetBoxContainer: "action-bar-facet-box-container",
    searchBar: "action-bar-search",
    selectionToggle: "action-bar-selection",
    "bar--selection": "action-bar-selection"
};

function createStore() {
    const store = makeLocalCollectionStore<{category: string; name: string}>({
        facetDefinitions: [{code: "category", fieldName: "category", isMultiSelectable: true, label: "Category"}],
        searchFields: ["name"]
    });
    store.list = [
        {category: "A", name: "Alpha"},
        {category: "B", name: "Beta"}
    ];
    return store;
}

describe("ActionBar", () => {
    setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

    test("met à jour la requête et ouvre le menu de tri", () => {
        const store = createStore();
        renderWithTheme(
            <ActionBar
                hasSearchBar
                orderableColumnList={[{label: "Name", sort: [{fieldName: "name"}]}]}
                searchBarPlaceholder="Search"
                store={store}
                theme={actionBarTheme}
            />
        );

        fireEvent.click(screen.getByRole("button", {name: /Trier/}));
        fireEvent.click(screen.getByText("Name"));
        expect(store.sort).toEqual([{fieldName: "name"}]);
        fireEvent.change(screen.getByRole("textbox"), {target: {value: "alpha"}});
        expect(store.query).toBe("alpha");
    });

    test("ouvre le menu de groupement et applique une clé de groupement", () => {
        const store = createStore();
        renderWithTheme(<ActionBar hasGrouping store={store} theme={actionBarTheme} />);

        fireEvent.click(screen.getByRole("button", {name: /Grouper/}));
        fireEvent.click(screen.getByText("Category"));
        expect(store.groupingKey).toBe("category");
    });

    test("affiche le nombre de sélections et exécute une opération", () => {
        const store = createStore();
        const operation = vi.fn();
        store.selectedItems.add(store.list[0]);
        renderWithTheme(
            <ThemeProvider
                appTheme={{
                    ...defaultAppTheme,
                    contextualActions: {
                        fab: "contextual-actions-fab",
                        item: "contextual-actions-item",
                        text: "contextual-actions-text"
                    }
                }}
            >
                <ActionBar
                    hasSelection
                    operationList={[{action: operation, label: "Archive", type: "label"}]}
                    store={store}
                    theme={actionBarTheme}
                />
            </ThemeProvider>
        );

        expect(screen.getByText(/1 élément sélectionné/).textContent).toBe("1 élément sélectionné");
        fireEvent.click(screen.getByRole("button", {name: "Archive"}));
        expect(operation).toHaveBeenCalledWith([store.list[0]]);
    });

    test("bascule la sélection lorsque le contrôle est activé", () => {
        const store = createStore();
        renderWithTheme(<ActionBar hasSelection store={store} theme={actionBarTheme} />);

        fireEvent.click(screen.getByRole("checkbox"));
        expect(store.selectedItems.size).toBe(2);
        fireEvent.click(screen.getByRole("checkbox"));
        expect(store.selectedItems.size).toBe(0);
    });

    test("affiche le libellé et le nombre du groupe courant", () => {
        const store = createStore();
        renderWithTheme(
            <ActionBar
                group={{code: "category", label: "Category", totalCount: 2}}
                store={store}
                theme={actionBarTheme}
            />
        );

        expect(screen.getByText("Category (2)").textContent).toBe("Category (2)");
    });

    test("filtre les options de groupement et les masque pour les éléments sélectionnés", () => {
        const store = createStore();
        renderWithTheme(<ActionBar groupableFacets={[]} hasGrouping store={store} theme={actionBarTheme} />);
        expect(screen.queryByRole("button", {name: /Grouper/})).toBeNull();

        store.selectedItems.add(store.list[0]);
        expect(screen.queryByRole("button", {name: /Grouper/})).toBeNull();
    });
});
