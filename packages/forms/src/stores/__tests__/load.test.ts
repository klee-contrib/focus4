import {renderHook, waitFor} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {requestStore} from "@focus4/core";
import {e, entity} from "@focus4/entities";
import {makeReferenceStore, makeStoreNode} from "@focus4/stores";

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
    function createReferenceStore() {
        return makeReferenceStore(async () => [{code: "admin", label: "Admin"}], {
            roles: {valueKey: "code", labelKey: "label", type: {} as {code: string; label: string}},
            groups: {valueKey: "code", labelKey: "label", type: {} as {code: string; label: string}}
        });
    }

    test("accepte un trackingId simple et suit toutes les références", async () => {
        const referenceStore = createReferenceStore();
        const track = vi.spyOn(requestStore, "track");

        try {
            renderHook(() => useReferenceTracking("form", referenceStore));
            await referenceStore.get("groups");
            expect(track).toHaveBeenCalledWith(
                expect.arrayContaining(["form"]),
                expect.any(Function),
                expect.any(Function)
            );
        } finally {
            track.mockRestore();
        }
    });

    test("réenregistre le tracking avec ids multiples et références", async () => {
        const referenceStore = createReferenceStore();
        const track = vi.spyOn(requestStore, "track");

        try {
            const {rerender} = renderHook(({ids}) => useReferenceTracking(ids, referenceStore, "roles"), {
                initialProps: {ids: ["a", "b"]}
            });
            rerender({ids: ["a", "c"]});
            await referenceStore.get("roles");
            const ids = track.mock.calls.at(-1)![0];
            expect(ids).toEqual(expect.arrayContaining(["a", "c"]));
            expect(ids).not.toContain("b");

            await referenceStore.get("groups");
            expect(track.mock.calls.at(-1)![0]).not.toContain("a");
        } finally {
            track.mockRestore();
        }
    });

    test("nettoie le tracking à la destruction", async () => {
        const referenceStore = createReferenceStore();
        const track = vi.spyOn(requestStore, "track");

        try {
            const {unmount} = renderHook(() => useReferenceTracking(["a", "b"], referenceStore, "roles"));
            await referenceStore.get("roles");
            expect(track.mock.calls.at(-1)![0]).toEqual(expect.arrayContaining(["a", "b"]));
            await referenceStore.reload("roles");

            unmount();
            expect(referenceStore.roles).toHaveLength(1);
            await track.mock.results.at(-1)!.value;
            const ids = track.mock.calls.at(-1)![0];
            expect(ids).not.toContain("a");
            expect(ids).not.toContain("b");
        } finally {
            track.mockRestore();
        }
    });
});
