import {act, renderHook} from "@testing-library/react";
import {createElement} from "react";
import {describe, expect, test, vi} from "vitest";

import {ScrollableContext} from "@focus4/layout";
import {makeServerCollectionStore, QueryInput, QueryOutput} from "@focus4/stores";

import {usePagination} from "../pagination";

interface Item {
    id: number;
}

const data = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}];

describe("usePagination", () => {
    test("gère les pages manuelles et réinitialise les données affichées", async () => {
        const {result, rerender} = renderHook(
            ({items, loading}) => usePagination<Item>({data: items, isLoading: loading, perPage: 2}),
            {
                initialProps: {items: data, loading: false}
            }
        );

        expect(result.current.state.displayedData).toEqual(data.slice(0, 2));
        expect(result.current.state.hasMoreAfter).toBe(true);
        expect(result.current.state.hasMoreBefore).toBe(false);
        expect(result.current.state.isLoading).toBe(false);
        expect(result.current.getDomRef(1)).toBeTypeOf("function");
        expect(result.current.getDomRef(0)).toBeUndefined();

        await act(() => result.current.handleNext());
        expect(result.current.state.displayedEnd).toBe(4);
        expect(result.current.state.displayedData).toEqual(data.slice(0, 4));

        act(() => result.current.handlePrevious());
        expect(result.current.state.displayedStart).toBe(0);
        expect(result.current.state.displayedEnd).toBe(2);

        await act(() => result.current.handleNext());
        await act(() => result.current.handleNext());
        expect(result.current.state.displayedEnd).toBe(6);

        rerender({items: data.slice(0, 2), loading: true});
        expect(result.current.state.displayedStart).toBe(0);
        expect(result.current.state.displayedEnd).toBe(2);
        expect(result.current.state.isLoading).toBe(true);
        expect(result.current.state.hasMoreAfter).toBe(false);
    });

    test("navigue entre la première et la dernière page en mode multiple", () => {
        const {result} = renderHook(() => usePagination<Item>({data, paginationMode: "multiple", perPage: 2}));

        act(() => result.current.handleLast());
        expect(result.current.state.displayedStart).toBe(3);
        expect(result.current.state.displayedEnd).toBe(5);
        expect(result.current.state.hasMoreBefore).toBe(true);

        act(() => result.current.handleFirst());
        expect(result.current.state.displayedStart).toBe(0);
        expect(result.current.state.displayedEnd).toBe(2);
    });

    test("enregistre le sentinel pour la pagination automatique", () => {
        let onIntersect: ((ratio: number, isIntersecting: boolean) => void) | undefined;
        const unregister = vi.fn();
        const registerIntersect = vi.fn((_node: HTMLElement, callback: typeof onIntersect) => {
            onIntersect = callback;
            return unregister;
        });
        const {result} = renderHook(() => usePagination<Item>({data, paginationMode: "single-auto", perPage: 2}), {
            wrapper: ({children}) =>
                createElement(
                    ScrollableContext.Provider,
                    {
                        value: {
                            headerHeight: 0,
                            level: 0,
                            portal: () => null,
                            registerHeaderElement: () => () => undefined,
                            registerIntersect: registerIntersect as unknown as (
                                node: HTMLElement,
                                onIntersect: (ratio: number, isIntersecting: boolean) => void
                            ) => () => void,
                            scrollTo: () => undefined
                        }
                    },
                    children
                )
        });

        const sentinelRef = result.current.getDomRef(1);
        const node = document.createElement("div");
        sentinelRef?.(node);

        expect(registerIntersect).toHaveBeenCalledWith(node, expect.any(Function));
        act(() => result.current.getDomRef(1)?.(null));
        act(() => onIntersect?.(0, false));
        act(() => onIntersect?.(0, true));
        expect(unregister).toHaveBeenCalled();
    });

    test("charge la page suivante pour un store serveur", async () => {
        const service = vi
            .fn<(input: QueryInput) => Promise<QueryOutput<Item>>>()
            .mockResolvedValueOnce({facets: [], list: data.slice(0, 2), totalCount: data.length})
            .mockResolvedValueOnce({facets: [], list: data.slice(0, 4), totalCount: data.length});
        const store = makeServerCollectionStore(service);
        await store.search();
        const search = vi.spyOn(store, "search");
        const {result} = renderHook(() => usePagination<Item>({paginationMode: "single-manual", perPage: 2, store}));

        expect(result.current.state.hasMoreToLoad).toBe(true);
        await act(() => result.current.handleNext());

        expect(search).toHaveBeenCalledWith(true);
        expect(result.current.state.displayedEnd).toBe(4);
    });

    test("ne pagine pas sans perPage", async () => {
        const {result} = renderHook(() => usePagination<Item>({data}));

        expect(result.current.state.displayedData).toEqual(data);
        expect(result.current.state.displayedEnd).toBeUndefined();
        expect(result.current.state.hasMoreAfter).toBe(false);
        await act(async () => {
            result.current.handleFirst();
            result.current.handlePrevious();
            result.current.handleLast();
            await result.current.handleNext();
        });
        expect(result.current.state.displayedStart).toBe(0);
    });
});
