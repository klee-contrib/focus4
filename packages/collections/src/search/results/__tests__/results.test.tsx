import {defaultAppTheme, renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {makeLocalCollectionStore} from "@focus4/stores";
import {ThemeProvider} from "@focus4/styling";

import {Results} from "..";

describe("Results", () => {
    setupComponentTest();

    test("affiche la liste injectée lorsqu'il n'y a pas de groupes", () => {
        const store = makeLocalCollectionStore<{name: string}>();
        store.list = [{name: "Alpha"}];

        renderWithTheme(
            <Results
                ListComponent={() => <div data-testid="result-list">results</div>}
                listProps={{
                    itemKey: item => item.name,
                    LineComponent: ({data}) => <span>{data.name}</span>
                }}
                store={store}
            />
        );

        expect(screen.getByTestId("result-list").textContent).toBe("results");
    });

    test("affiche les groupes et respecte les groupes pliés par défaut", () => {
        const store = makeLocalCollectionStore<{category: string; name: string}>({
            facetDefinitions: [{code: "category", fieldName: "category", isMultiSelectable: true, label: "Category"}]
        });
        store.list = [
            {category: "A", name: "Alpha"},
            {category: "B", name: "Beta"}
        ];
        store.groupingKey = "category";

        render(
            <ThemeProvider
                appTheme={{
                    ...defaultAppTheme,
                    list: {
                        actions: "list-actions",
                        checkbox: "list-checkbox",
                        detail: "list-detail",
                        detailWrapper: "list-detail-wrapper",
                        line: "list-line",
                        "line--selected": "list-line-selected",
                        list: "list",
                        "list--mosaic": "list-mosaic",
                        "list--selected": "list-selected",
                        mosaic: "list-mosaic-item",
                        "mosaic--selected": "list-mosaic-selected",
                        triangle: "list-triangle"
                    },
                    group: {
                        header: "group-header",
                        selectionToggle: "group-selection"
                    },
                    listBase: {
                        bottomRow: "list-bottom-row",
                        items: "list-items",
                        loading: "list-loading",
                        navigation: "list-navigation"
                    }
                }}
            >
                <Results
                    defaultFoldedGroups={{category: ["A"]}}
                    listProps={{
                        itemKey: item => item.name,
                        LineComponent: ({data}) => <span>{data.name}</span>
                    }}
                    store={store}
                />
            </ThemeProvider>
        );

        expect(screen.getByText("A (1)")).toBeTruthy();
        expect(screen.getByText("B (1)")).toBeTruthy();
        expect(screen.queryByText("Alpha")).toBeNull();
    });
});
