import {setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {makeLocalCollectionStore} from "@focus4/stores";
import {toBem, type ToBem} from "@focus4/styling";

import {i18nCollections} from "../../../translation";
import {type TableColumn, TableHeader} from "../header";

import type {TableCss} from "../../__style__/table.css";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

const theme = toBem({
    heading: "table-heading",
    label: "table-label",
    sortCount: "table-sort-count",
    sortIcon: "table-sort-icon"
}) as ToBem<TableCss>;

interface Item {
    category: string;
    name: string;
}

function createStore() {
    const store = makeLocalCollectionStore<Item>({});
    store.list = [
        {category: "A", name: "Alpha"},
        {category: "B", name: "Beta"}
    ];
    return store;
}

function renderHeader(store = createStore(), column?: TableColumn<Item>, maxSort = 1) {
    const headerColumn = column ?? {content: (data: Item) => data.name, sortKey: "name", title: "Name"};
    render(
        <table>
            <thead>
                <tr>
                    <TableHeader
                        column={headerColumn}
                        i18nPrefix="focus"
                        maxSort={maxSort}
                        store={store}
                        theme={theme}
                    />
                </tr>
            </thead>
        </table>
    );
    return store;
}

describe("TableHeader", () => {
    test("fait alterner le tri croissant, décroissant puis aucun tri", () => {
        const store = renderHeader();
        const header = screen.getByRole("columnheader");

        fireEvent.click(header);
        expect(store.sort).toEqual([{fieldName: "name"}]);
        fireEvent.click(header);
        expect(store.sort).toEqual([{fieldName: "name", sortDesc: true}]);
        fireEvent.click(header);
        expect(store.sort).toEqual([]);
    });

    test("remplace le tri existant quand le nombre maximal est atteint", () => {
        const store = createStore();
        store.sort = [{fieldName: "category"}];
        renderHeader(store);

        fireEvent.click(screen.getByRole("columnheader"));
        expect(store.sort).toEqual([{fieldName: "name"}]);
    });

    test("affiche la position pour un tri multiple et accepte la touche espace", () => {
        const store = createStore();
        store.sort = [{fieldName: "category"}, {fieldName: "name"}];
        renderHeader(store, undefined, 2);

        const header = screen.getByRole("columnheader");
        expect(screen.getByText("2").textContent).toBe("2");
        fireEvent.keyDown(header, {code: "Space"});
        fireEvent.keyUp(header, {code: "Space"});
        expect(store.sort).toEqual([{fieldName: "category"}, {fieldName: "name", sortDesc: true}]);
    });

    test("ne rend pas une colonne sans store, clé de tri ou résultats triable", () => {
        render(
            <table>
                <thead>
                    <tr>
                        <TableHeader
                            column={{content: (data: Item) => data.name, title: "Name"}}
                            i18nPrefix="focus"
                            maxSort={1}
                            theme={theme}
                        />
                    </tr>
                </thead>
            </table>
        );
        const header = screen.getByRole("columnheader");
        expect(header.tabIndex).toBe(-1);

        const emptyStore = makeLocalCollectionStore<Item>({});
        renderHeader(emptyStore);
        expect(screen.getAllByRole("columnheader")[1].tabIndex).toBe(-1);
    });
});
