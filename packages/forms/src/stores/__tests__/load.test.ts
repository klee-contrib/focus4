import {renderHook, waitFor} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {makeEntityStore} from "@focus4/stores";

import {useLoad} from "../load";

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
        const store = makeEntityStore({test: TestEntity});
        const {result} = renderHook(() =>
            useLoad(store.test, b => b.params().load(() => Promise.resolve({id: 1, name: "Test"})))
        );

        expect(result.current[0]).toBeDefined();
        expect(result.current[1]).toBeDefined();
        expect(typeof result.current[1]).toBe("string");
    });

    test("charge les données avec un service", async () => {
        const store = makeEntityStore({test: TestEntity});
        const loadService = async () => ({id: 1, name: "Test"});

        renderHook(() => useLoad(store.test, b => b.params().load(loadService)));

        await waitFor(() => {
            expect(store.test.id.value).toBe(1);
            expect(store.test.name.value).toBe("Test");
        });
    });
});
