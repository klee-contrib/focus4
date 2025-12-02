import {renderHook} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {makeEntityStore} from "@focus4/stores";

import {useFormActions, useFormNode} from "../form";

const DO_STRING = {
    schema: z.string()
} as Domain;

const DO_NUMBER = {
    schema: z.number()
} as Domain;

const TestEntity = entity({
    id: e.field(DO_NUMBER, f => f.optional()),
    name: e.field(DO_STRING),
    email: e.field(DO_STRING, f => f.optional())
});

const TestListEntity = entity({
    id: e.field(DO_NUMBER),
    label: e.field(DO_STRING)
});

describe("useFormNode", () => {
    describe("avec StoreNode", () => {
        test("crée un FormNode à partir d'un StoreNode", () => {
            const store = makeEntityStore({test: TestEntity});
            const {result} = renderHook(() => useFormNode(store.test));

            expect(result.current.form).toBeDefined();
            expect(result.current.form.isEdit).toBe(false);
            expect(result.current.form.isEmpty).toBe(true);
            expect(result.current.sourceNode).toBe(store.test);
        });

        test("initialise avec initialData", () => {
            const store = makeEntityStore({test: TestEntity});
            const {result} = renderHook(() =>
                useFormNode(store.test, undefined, {id: 1, name: "Test", email: "test@test.com"})
            );

            expect(result.current.id.value).toBe(1);
            expect(result.current.name.value).toBe("Test");
            expect(result.current.email.value).toBe("test@test.com");
            expect(result.current.form.isEmpty).toBe(false);
        });

        test("initialise avec initialData = true", () => {
            const store = makeEntityStore({test: TestEntity});
            store.test.replace({id: 1, name: "Test"});
            const {result} = renderHook(() => useFormNode(store.test, undefined, true));

            expect(result.current.id.value).toBe(1);
            expect(result.current.name.value).toBe("Test");
        });

        test("initialise avec fonction initialData", () => {
            const store = makeEntityStore({test: TestEntity});
            const {result} = renderHook(() => useFormNode(store.test, undefined, () => ({id: 2, name: "Test2"})));

            expect(result.current.id.value).toBe(2);
            expect(result.current.name.value).toBe("Test2");
        });
    });

    describe("avec StoreListNode", () => {
        test("crée un FormListNode à partir d'un StoreListNode", () => {
            const store = makeEntityStore({testList: [TestListEntity]});
            const {result} = renderHook(() => useFormNode(store.testList));

            expect(result.current.form).toBeDefined();
            expect(result.current.form.isEdit).toBe(false);
            expect(result.current.form.isEmpty).toBe(true);
            expect(result.current.sourceNode).toBe(store.testList);
        });

        test("initialise avec initialData", () => {
            const store = makeEntityStore({testList: [TestListEntity]});
            const {result} = renderHook(() =>
                useFormNode(store.testList, undefined, [
                    {id: 1, label: "Item 1"},
                    {id: 2, label: "Item 2"}
                ])
            );

            expect(result.current.length).toBe(2);
            expect(result.current[0].id.value).toBe(1);
            expect(result.current[0].label.value).toBe("Item 1");
            expect(result.current.form.isEmpty).toBe(false);
        });
    });

    describe("avec entity", () => {
        test("crée un FormNode à partir d'une entité", () => {
            const {result} = renderHook(() => useFormNode(TestEntity));

            expect(result.current.form).toBeDefined();
            expect(result.current.id).toBeDefined();
            expect(result.current.name).toBeDefined();
        });

        test("initialise avec initialData", () => {
            const {result} = renderHook(() => useFormNode(TestEntity, undefined, {name: "Test"}));

            expect(result.current.name.value).toBe("Test");
        });
    });

    describe("avec entity liste", () => {
        test("crée un FormListNode à partir d'une entité liste", () => {
            const {result} = renderHook(() => useFormNode([TestListEntity]));

            expect(result.current.form).toBeDefined();
            expect(Array.isArray(result.current)).toBe(true);
        });

        test("initialise avec initialData", () => {
            const {result} = renderHook(() => useFormNode([TestListEntity], undefined, [{id: 1, label: "Test"}]));

            expect(result.current.length).toBe(1);
            expect(result.current[0].id.value).toBe(1);
        });
    });

    describe("avec builder", () => {
        test("utilise le builder pour configurer le FormNode", () => {
            const store = makeEntityStore({test: TestEntity});
            const {result} = renderHook(() =>
                useFormNode(store.test, s => s.patch("name", f => f.metadata({label: "Nom"})))
            );

            expect(result.current.name.$field.label).toBe("Nom");
        });
    });
});

describe("useFormActions", () => {
    test("crée des FormActions", () => {
        const store = makeEntityStore({test: TestEntity});
        const {result: formNodeResult} = renderHook(() => useFormNode(store.test));
        const {result} = renderHook(() => useFormActions(formNodeResult.current, s => s, []));

        expect(result.current).toBeDefined();
        expect(result.current.save).toBeDefined();
        expect(result.current.load).toBeDefined();
    });

    test("crée des FormActions avec builder", () => {
        const store = makeEntityStore({test: TestEntity});
        const {result: formNodeResult} = renderHook(() => useFormNode(store.test));
        const {result} = renderHook(() =>
            useFormActions(formNodeResult.current, s => s.save(() => Promise.resolve()), [])
        );

        expect(result.current.save).toBeDefined();
    });
});
