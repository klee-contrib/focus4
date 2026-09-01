import {setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {makeLocalCollectionStore, makeServerCollectionStore} from "@focus4/stores";

import {i18nCollections} from "../../../translation";
import {BottomRow, type BottomRowProps} from "../bottom-row";
import type {PaginationState} from "../pagination";

setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});

interface Item {
    id: number;
}

const theme = {
    bottomRow: "bottom-row",
    items: "bottom-row-items",
    loading: "bottom-row-loading",
    navigation: "bottom-row-navigation"
};

function createState(overrides: Partial<PaginationState<Item>["state"]> = {}) {
    return {
        data: [{id: 1}, {id: 2}, {id: 3}],
        displayedData: [{id: 1}],
        displayedStart: 0,
        displayedEnd: 1,
        hasMoreAfter: true,
        hasMoreBefore: false,
        hasMoreToLoad: false,
        isLoading: false,
        ...overrides
    };
}

function renderBottomRow(props: Partial<BottomRowProps<Item>> = {}) {
    const pagination: PaginationState<Item> = {
        getDomRef: () => undefined,
        handleFirst: vi.fn(),
        handleLast: vi.fn(),
        handleNext: vi.fn(),
        handlePrevious: vi.fn(),
        state: createState()
    };
    render(<BottomRow {...pagination} theme={theme} {...props} />);
    return pagination;
}

describe("BottomRow", () => {
    test("affiche et déclenche le bouton de pagination manuelle", () => {
        const {handleNext} = renderBottomRow({paginationMode: "single-manual"});

        fireEvent.click(screen.getByRole("button", {name: /Voir plus/}));
        expect(handleNext).toHaveBeenCalledTimes(1);
    });

    test("affiche le bouton Voir tout pendant le chargement", () => {
        const showAllHandler = vi.fn();
        renderBottomRow({
            paginationMode: "single-manual",
            showAllHandler,
            state: createState({hasMoreAfter: false, isLoading: true})
        });

        const showAllButton = screen.getByRole("button", {name: /arrow_forwardVoir tout/});
        expect(showAllButton.textContent).toBe("arrow_forwardVoir tout");
        fireEvent.click(showAllButton);
        expect(showAllHandler).toHaveBeenCalledTimes(1);
    });

    test("affiche la navigation multiple et déclenche ses contrôles", () => {
        const {handleFirst, handleLast, handleNext, handlePrevious} = renderBottomRow({
            paginationMode: "multiple",
            state: createState({displayedData: [{id: 1}, {id: 2}], displayedEnd: 2, hasMoreBefore: true})
        });

        expect(screen.getByText("1 - 2 sur 3 éléments").textContent).toBe("1 - 2 sur 3 éléments");
        fireEvent.click(screen.getByRole("button", {name: "first_page"}));
        fireEvent.click(screen.getByRole("button", {name: "keyboard_arrow_left"}));
        fireEvent.click(screen.getByRole("button", {name: "keyboard_arrow_right"}));
        fireEvent.click(screen.getByRole("button", {name: "last_page"}));
        expect(handleFirst).toHaveBeenCalledTimes(1);
        expect(handlePrevious).toHaveBeenCalledTimes(1);
        expect(handleNext).toHaveBeenCalledTimes(1);
        expect(handleLast).toHaveBeenCalledTimes(1);
    });

    test("masque la dernière page pour un store serveur", () => {
        const store = makeServerCollectionStore<Item, any>(() =>
            Promise.resolve({facets: [], list: [], totalCount: 3})
        );
        renderBottomRow({
            paginationMode: "multiple",
            state: createState({displayedData: [{id: 1}, {id: 2}], displayedEnd: 2}),
            store
        });

        expect(screen.queryByRole("button", {name: "last_page"})).toBeNull();
    });

    test("utilise le total du store local dans le libellé", () => {
        const store = makeLocalCollectionStore<Item>({});
        store.list = [{id: 1}, {id: 2}, {id: 3}, {id: 4}];
        renderBottomRow({
            paginationMode: "multiple",
            state: createState({data: store.list, displayedData: store.list.slice(0, 2), displayedEnd: 2}),
            store
        });

        expect(screen.getByText("1 - 2 sur 4 éléments").textContent).toBe("1 - 2 sur 4 éléments");
    });
});
