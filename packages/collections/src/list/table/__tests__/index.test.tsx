import {defaultAppTheme, renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {makeLocalCollectionStore} from "@focus4/stores";
import {ThemeProvider} from "@focus4/styling";

import {i18nCollections} from "../../../translation";
import {Table, tableFor, type TableProps} from "../index";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    id: number;
    name: string;
}

const items: Item[] = [
    {id: 1, name: "Alpha"},
    {id: 2, name: "Beta"}
];

const tableTheme = {
    actions: "table-actions",
    cell: "table-cell",
    checkbox: "table-checkbox",
    "checkbox--all": "table-checkbox-all",
    focus: "table-focus",
    header: "table-header",
    heading: "table-heading",
    "heading--multipleSort": "table-heading-multiple-sort",
    "heading--sortable": "table-heading-sortable",
    "heading--sorted": "table-heading-sorted",
    label: "table-label",
    row: "table-row",
    "row--clickable": "table-row-clickable",
    "row--selected": "table-row-selected",
    sortCount: "table-sort-count",
    sortIcon: "table-sort-icon",
    table: "table",
    "table--empty": "table-empty",
    "table--selected": "table-selected",
    "table--sticky": "table-sticky"
};

const baseTheme = {
    bottomRow: "table-bottom-row",
    items: "table-items",
    loading: "table-loading",
    navigation: "table-navigation"
};

const columns = [
    {content: (item: Item) => item.name, sortKey: "name", title: "Name"},
    {content: (item: Item) => item.id, title: "Identifiant"}
];

function createStore() {
    const store = makeLocalCollectionStore<Item>({});
    store.list = items;
    return store;
}

function renderTable(props: TableProps<Item>) {
    return renderWithTheme(<Table baseTheme={baseTheme} theme={tableTheme} {...props} />);
}

describe("Table", () => {
    test("affiche les colonnes, les lignes et transmet le clic", () => {
        const onLineClick = vi.fn();
        renderTable({
            baseTheme,
            columns,
            data: items,
            itemKey: item => item.id,
            lineClassName: item => `ligne-${item.id}`,
            onLineClick,
            stickyHeader: true,
            theme: tableTheme
        });

        expect(screen.getByRole("columnheader", {name: "Name"}).textContent).toBe("Name");
        const alphaCell = screen.getByRole("cell", {name: "Alpha"});
        const alphaRow = alphaCell.closest("tr");
        expect(alphaRow).not.toBeNull();
        expect(alphaRow!.classList.contains("ligne-1")).toBe(true);
        fireEvent.click(alphaCell);
        expect(onLineClick).toHaveBeenCalledWith(items[0], expect.anything());
    });

    test("gère la sélection et les actions globales et par ligne", () => {
        const store = createStore();
        const globalAction = vi.fn();
        const lineAction = vi.fn();
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
                <Table
                    baseTheme={baseTheme}
                    columns={columns}
                    hasSelectAll
                    hasSelection
                    itemKey={item => item.id}
                    lineOperationList={() => [{action: lineAction, label: "Modifier", type: "label"}]}
                    operationList={[{action: globalAction, label: "Archiver", type: "label"}]}
                    store={store}
                    theme={tableTheme}
                />
            </ThemeProvider>
        );

        fireEvent.click(screen.getAllByRole("checkbox")[0]);
        expect(store.selectedItems.size).toBe(2);
        fireEvent.click(screen.getByRole("button", {name: "Archiver"}));
        expect(globalAction).toHaveBeenCalledWith(items);
        fireEvent.click(screen.getAllByRole("button", {name: "Modifier"})[0]);
        expect(lineAction).toHaveBeenCalledWith(items[0]);
    });

    test("affiche un tableau vide et accepte le wrapper tableFor", () => {
        const props: TableProps<Item> = {baseTheme, columns, data: [], itemKey: item => item.id, theme: tableTheme};
        renderWithTheme(tableFor(props));

        expect(screen.getByRole("table").classList.contains("table-empty")).toBe(true);
        expect(screen.queryByRole("row", {name: /Alpha/})).toBeNull();
    });
});
