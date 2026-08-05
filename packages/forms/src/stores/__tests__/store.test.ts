import {renderHook} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";

import {useStoreNode} from "../store";

const DO_NUMBER = {
    schema: z.number()
} as Domain;

const TestEntity = entity({
    id: e.field(DO_NUMBER),
    label: e.field({schema: z.string()} as Domain)
});

describe("useStoreNode", () => {
    test("crée un StoreNode à partir d'une entité", () => {
        const {result} = renderHook(() => useStoreNode(TestEntity, {id: 1, label: "A"}));

        expect(result.current.id.value).toBe(1);
        expect(result.current.label.value).toBe("A");
    });

    test("crée un StoreListNode à partir d'un tuple d'entité", () => {
        const {result} = renderHook(() => useStoreNode([TestEntity], [{id: 2, label: "B"}]));

        expect(result.current.length).toBe(1);
        expect(result.current[0].id.value).toBe(2);
        expect(result.current[0].label.value).toBe("B");
    });
});
