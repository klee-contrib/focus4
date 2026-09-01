import {act, renderHook} from "@testing-library/react";
import {createElement} from "react";
import {describe, expect, test, vi} from "vitest";

import {ScrollableContext} from "@focus4/layout";

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
        const registerIntersect = vi.fn(
            (_node: HTMLElement, _onIntersect: (ratio: number, isIntersecting: boolean) => void) => () => undefined
        );
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
