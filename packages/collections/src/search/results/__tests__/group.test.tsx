import {setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {observable} from "mobx";
import {describe, expect, test} from "vitest";

import {type CollectionStore, makeLocalCollectionStore} from "@focus4/stores";

import {i18nCollections} from "../../../translation";
import {DefaultGroupHeader, Group, type GroupHeaderProps} from "../group";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    category: string;
    name: string;
}

const groupTheme = {header: "group-header", selectionToggle: "group-selection"};

function createStore() {
    const store = makeLocalCollectionStore<Item>({
        facetDefinitions: [{code: "category", fieldName: "category", isMultiSelectable: true, label: "Category"}]
    });
    store.list = [
        {category: "A", name: "Alpha"},
        {category: "A", name: "Another"},
        {category: "B", name: "Beta"}
    ];
    store.groupingKey = "category";
    return store;
}

function createGroup(): {code: string; label: string; list: Item[]; totalCount: number} {
    return {
        code: "A",
        label: "A",
        list: [{category: "A", name: "Alpha"}],
        totalCount: 2
    };
}

describe("Group", () => {
    test("ouvre et ferme l'en-tête de groupe par défaut", () => {
        const openedMap = observable.map<string, boolean>([["A", false]]);
        const props: GroupHeaderProps<Item> = {group: createGroup(), openedMap};
        render(<DefaultGroupHeader {...props} />);

        fireEvent.click(screen.getByRole("button"));
        expect(openedMap.get("A")).toBe(true);
        fireEvent.click(screen.getByRole("button"));
        expect(openedMap.get("A")).toBe(false);
        expect(screen.getByText("A (2)").textContent).toBe("A (2)");
    });

    test("affiche l'en-tête fermé sans sa liste", () => {
        const store = createStore();
        const openedMap = observable.map<string, boolean>([["A", false]]);
        render(
            <Group
                group={createGroup()}
                listProps={{itemKey: item => item.name}}
                openedMap={openedMap}
                store={store}
                theme={groupTheme}
            />
        );

        expect(screen.getByText("A (2)").textContent).toBe("A (2)");
        expect(screen.queryByTestId("group-list")).toBeNull();
    });

    test("affiche une liste ouverte et permet de sélectionner tout le groupe", () => {
        const store = createStore();
        const openedMap = observable.map<string, boolean>([["A", true]]);
        const ListComponent = ({
            showAllHandler,
            store: groupStore
        }: {
            showAllHandler?: () => void;
            store: CollectionStore<Item>;
        }) => (
            <div data-testid="group-list">
                <span>{groupStore.list.length}</span>
                {showAllHandler ? (
                    <button onClick={showAllHandler} type="button">
                        Voir tout le groupe
                    </button>
                ) : null}
            </div>
        );
        render(
            <Group
                group={createGroup()}
                hasSelection
                listProps={{itemKey: item => item.name}}
                ListComponent={ListComponent}
                openedMap={openedMap}
                store={store}
                theme={groupTheme}
            />
        );

        expect(screen.getByTestId("group-list").textContent).toBe("2Voir tout le groupe");
        fireEvent.click(screen.getByRole("checkbox"));
        expect(store.selectedItems.size).toBe(2);
        fireEvent.click(screen.getByRole("button", {name: "Voir tout le groupe"}));
        expect(store.groupingKey).toBeUndefined();
        expect(store.inputFacets.category?.selected).toEqual(["A"]);
    });
});
