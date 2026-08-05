import {renderHook, waitFor} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {makeStoreNode, ReferenceDefinition, ReferenceStore} from "@focus4/stores";

import {useLoad, useReferenceTracking} from "../load";

const DO_STRING = {
    schema: z.string()
} as Domain;

const DO_NUMBER = {
    schema: z.number()
} as Domain;

const TestEntity = entity({
    id: e.field(DO_NUMBER, f => f.optional()),
    name: e.field(DO_STRING)
});

describe("useLoad", () => {
    test("retourne isLoading et trackingId", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result} = renderHook(() =>
            useLoad(store.test, b => b.params().load(() => Promise.resolve({id: 1, name: "Test"})))
        );

        expect(result.current[0]).toBeDefined();
        expect(result.current[1]).toBeDefined();
        expect(typeof result.current[1]).toBe("string");
    });

    test("charge les données avec un service", async () => {
        const store = makeStoreNode({test: TestEntity});
        const loadService = async () => ({id: 1, name: "Test"});

        renderHook(() => useLoad(store.test, b => b.params().load(loadService)));

        await waitFor(() => {
            expect(store.test.id.value).toBe(1);
            expect(store.test.name.value).toBe("Test");
        });
    });

    test("reconfigure le load quand les dépendances changent", async () => {
        const store = makeStoreNode({test: TestEntity});
        const loadService = vi.fn(async (name: string) => ({id: 1, name}));

        const {rerender} = renderHook(
            ({name}) => useLoad(store.test, b => b.params().load(() => loadService(name)), [name]),
            {
                initialProps: {name: "Test-1"}
            }
        );

        await waitFor(() => {
            expect(store.test.name.value).toBe("Test-1");
        });

        rerender({name: "Test-2"});

        await waitFor(() => {
            expect(store.test.name.value).toBe("Test-2");
        });

        expect(loadService).toHaveBeenCalledTimes(2);
    });
});

describe("useReferenceTracking", () => {
    type TestReferenceStore = ReferenceStore<Record<string, ReferenceDefinition>>;

    test("accepte un trackingId simple", () => {
        const dispose = vi.fn();
        const track = vi.fn(() => dispose);
        const referenceStore = {track} as unknown as TestReferenceStore;

        renderHook(() => useReferenceTracking("form", referenceStore));

        expect(track).toHaveBeenCalledWith("form");
    });

    test("réenregistre le tracking avec ids multiples et références", () => {
        const dispose1 = vi.fn();
        const dispose2 = vi.fn();
        const track = vi.fn().mockReturnValueOnce(dispose1).mockReturnValueOnce(dispose2);
        const referenceStore = {track} as unknown as TestReferenceStore;

        const {rerender} = renderHook(
            ({ids, names}) => useReferenceTracking(ids, referenceStore, ...(names as ["roles"])),
            {
                initialProps: {ids: ["a", "b"], names: ["roles"]}
            }
        );

        expect(track).toHaveBeenCalledWith(["a", "b"], "roles");

        rerender({ids: ["a", "c"], names: ["roles"]});

        expect(dispose1).toHaveBeenCalledTimes(1);
        expect(track).toHaveBeenLastCalledWith(["a", "c"], "roles");
    });
});
