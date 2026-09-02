import {defaultAppTheme, renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {type CollectionStore, makeLocalCollectionStore} from "@focus4/stores";
import {ThemeProvider} from "@focus4/styling";

import {i18nCollections} from "../../translation";
import {AdvancedSearch} from "../advanced-search";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    category: string;
    name: string;
}

const items: Item[] = [
    {category: "A", name: "Alpha"},
    {category: "B", name: "Beta"}
];

const advancedSearchTheme = {
    actions: "advanced-actions",
    facetContainer: "advanced-facets",
    resultContainer: "advanced-results",
    search: "advanced-search",
    stickyContainer: "advanced-sticky",
    topRow: "advanced-top-row",
    "topRow--withFacetBox": "advanced-top-row-with-facets"
};
const summaryTheme = {chip: "summary-chip", print: "summary-print", summary: "summary"};
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
const facetTheme = {
    checkbox: "facet-checkbox",
    "checkbox--selected": "facet-checkbox-selected",
    count: "facet-count",
    facet: "facet",
    icon: "facet-icon",
    label: "facet-label",
    "label--excluded": "facet-label-excluded",
    show: "facet-show"
};
const facetBoxTheme = {facetBox: "facet-box", section: "facet-section"};
const lateralMenuTheme = {button: "lateral-button", menu: "lateral-menu"};

const store = makeLocalCollectionStore<Item>({
    facetDefinitions: [{code: "category", fieldName: "category", isMultiSelectable: true, label: "Category"}],
    searchFields: ["name"]
});
store.list = items;

function ListComponent({store: listStore}: {store: CollectionStore<Item>}) {
    return <div data-testid="advanced-list">{listStore.list.map(item => item.name).join(", ")}</div>;
}

const listProps = {} as any;

describe("AdvancedSearch", () => {
    test("affiche les facettes dans un menu initialement rétracté", () => {
        renderWithTheme(
            <ThemeProvider
                appTheme={{
                    ...defaultAppTheme,
                    facet: facetTheme,
                    lateralMenu: lateralMenuTheme
                }}
            >
                <AdvancedSearch
                    facetBoxPosition="left-initiallyRetracted"
                    facetBoxTheme={facetBoxTheme}
                    hideActionBar
                    listProps={listProps}
                    ListComponent={ListComponent}
                    searchOnMount={false}
                    store={store}
                    summaryTheme={summaryTheme}
                    theme={advancedSearchTheme}
                />
            </ThemeProvider>
        );

        expect(screen.getByText("keyboard_arrow_right")).toBeTruthy();
        fireEvent.click(screen.getByText("keyboard_arrow_right").closest("button")!);
        expect(screen.getByText("keyboard_arrow_left")).toBeTruthy();
    });

    test("assemble la recherche et met à jour la requête", () => {
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
                <AdvancedSearch
                    actionBarTheme={actionBarTheme}
                    facetBoxPosition="none"
                    hasSearchBar
                    listProps={listProps}
                    ListComponent={ListComponent}
                    searchOnMount={false}
                    store={store}
                    summaryTheme={summaryTheme}
                    theme={advancedSearchTheme}
                />
            </ThemeProvider>
        );

        expect(screen.getByTestId("advanced-list").textContent).toBe("Alpha, Beta");
        fireEvent.change(screen.getByRole("textbox"), {target: {value: "Alpha"}});
        expect(store.query).toBe("Alpha");
    });

    test("affiche le bouton d'ajout et masque la barre d'action", () => {
        const addItemHandler = vi.fn();
        renderWithTheme(
            <AdvancedSearch
                addItemHandler={addItemHandler}
                facetBoxPosition="none"
                hideActionBar
                listProps={listProps}
                ListComponent={ListComponent}
                searchOnMount={false}
                store={store}
                summaryTheme={summaryTheme}
                theme={advancedSearchTheme}
            />
        );

        fireEvent.click(screen.getByRole("button", {name: /Ajouter/}));
        expect(addItemHandler).toHaveBeenCalledOnce();
        expect(screen.queryByRole("textbox")).toBeNull();
    });
});
