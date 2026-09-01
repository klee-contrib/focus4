import {setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {i18nCollections} from "../../../translation";
import {List} from "../index";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    id: number;
    name: string;
}

const items = [
    {id: 1, name: "Alpha"},
    {id: 2, name: "Beta"}
];

const listTheme = {
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
};

const baseTheme = {
    bottomRow: "list-bottom-row",
    items: "list-items",
    loading: "list-loading",
    navigation: "list-navigation"
};

function Line({data, toggleDetail}: {data: Item; toggleDetail?: () => void}) {
    return (
        <button onClick={toggleDetail} type="button">
            {data.name}
        </button>
    );
}

function Detail({data}: {data: Item}) {
    return <div>Détail: {data.name}</div>;
}

function Empty() {
    return <div>Aucun élément</div>;
}

function AddItem({addItemHandler}: {addItemHandler: () => void}) {
    return (
        <button onClick={addItemHandler} type="button">
            Ajouter
        </button>
    );
}

describe("List", () => {
    test("affiche les lignes et ouvre puis ferme le détail", async () => {
        render(
            <List
                baseTheme={baseTheme}
                data={items}
                DetailComponent={Detail}
                itemKey={item => item.id}
                LineComponent={Line}
                theme={listTheme}
            />
        );

        fireEvent.click(screen.getByRole("button", {name: "Alpha"}));
        expect(screen.getByText("Détail: Alpha").textContent).toBe("Détail: Alpha");
        fireEvent.click(screen.getByRole("button", {name: "clear"}));
        await waitFor(() => expect(screen.queryByText("Détail: Alpha")).toBeNull());
    });

    test("affiche l'état vide lorsque les données sont absentes", () => {
        render(
            <List
                baseTheme={baseTheme}
                data={[]}
                EmptyComponent={Empty}
                itemKey={(item: Item) => item.id}
                LineComponent={Line}
                theme={listTheme}
            />
        );

        expect(screen.getByText("Aucun élément").textContent).toBe("Aucun élément");
    });

    test("affiche l'élément d'ajout et les mosaïques", () => {
        render(
            <List
                AddItemComponent={AddItem}
                addItemHandler={() => undefined}
                baseTheme={baseTheme}
                data={items}
                itemKey={item => item.id}
                mode="mosaic"
                MosaicComponent={Line}
                theme={listTheme}
            />
        );

        const addButton = screen.getByRole("button", {name: /Ajouter/});
        const alphaButton = screen.getByRole("button", {name: "Alpha"});
        const betaButton = screen.getByRole("button", {name: "Beta"});
        expect(screen.getAllByRole("button")).toEqual([addButton, alphaButton, betaButton]);
    });

    test("rejette une liste sans composant de ligne", () => {
        expect(() =>
            render(<List baseTheme={baseTheme} data={items} itemKey={item => item.id} theme={listTheme} />)
        ).toThrow("Aucun component de ligne ou de mosaïque n'a été précisé.");
    });
});
