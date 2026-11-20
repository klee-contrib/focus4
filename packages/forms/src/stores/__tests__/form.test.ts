import {renderHook} from "@testing-library/react";
import {describe, expect, test} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {makeStoreNode} from "@focus4/stores";

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
            const store = makeStoreNode({test: TestEntity});
            const {result} = renderHook(() => useFormNode(store.test));

            expect(result.current.form).toBeDefined();
            expect(result.current.form.isEdit).toBe(false);
            expect(result.current.form.isEmpty).toBe(true);
            expect(result.current.sourceNode).toBe(store.test);
        });

        test("initialise avec initialData", () => {
            const store = makeStoreNode({test: TestEntity});
            const {result} = renderHook(() =>
                useFormNode(store.test, undefined, {id: 1, name: "Test", email: "test@test.com"})
            );

            expect(result.current.id.value).toBe(1);
            expect(result.current.name.value).toBe("Test");
            expect(result.current.email.value).toBe("test@test.com");
            expect(result.current.form.isEmpty).toBe(false);
        });

        test.each([
            {
                label: "initialData = true",
                setup: (store: ReturnType<typeof makeStoreNode<{test: typeof TestEntity}>>) => {
                    store.test.replace({id: 1, name: "Test"});
                },
                initialData: true as const,
                expected: {id: 1, name: "Test"}
            },
            {
                label: "fonction initialData",
                setup: () => {
                    /** */
                },
                initialData: () => ({id: 2, name: "Test2"}),
                expected: {id: 2, name: "Test2"}
            }
        ])("initialise avec $label", ({setup, initialData, expected}) => {
            const store = makeStoreNode({test: TestEntity});
            setup(store);
            const {result} = renderHook(() => useFormNode(store.test, undefined, initialData));

            expect(result.current.id.value).toBe(expected.id);
            expect(result.current.name.value).toBe(expected.name);
        });

        test("détecte les modifications locales d'un StoreNode prérempli avec true", () => {
            const storeValues = {
                name: "Parent",
                profile: {name: "Profil"},
                children: [
                    {id: 1, label: "Item 1"},
                    {id: 2, label: "Item 2"}
                ]
            };
            const store = makeStoreNode(
                entity({name: e.field(DO_STRING), profile: TestEntity, children: [TestListEntity]}),
                storeValues
            );
            const {result} = renderHook(() => useFormNode(store, undefined, true));
            const form = result.current;

            expect(form.getValues()).toEqual(storeValues);
            expect(form.children[0].sourceNode).toBe(store.children[0]);
            expect(form.children[1].sourceNode).toBe(store.children[1]);
            expect(form.form.hasChanged).toBe(false);

            form.set({name: "Parent modifié"});
            expect(form.form.hasChanged).toBe(true);
            expect(store.name.value).toBe("Parent");
            form.set({name: "Parent"});
            expect(form.form.hasChanged).toBe(false);

            form.profile.set({email: "profil@example.com"});
            expect(form.profile.form.hasChanged).toBe(true);
            expect(form.form.hasChanged).toBe(true);
            expect(store.profile.email.value).toBeUndefined();
            form.profile.set({email: undefined});
            expect(form.form.hasChanged).toBe(false);

            form.children[1].set({label: "Brouillon"});
            expect(form.children[1].form.hasChanged).toBe(true);
            expect(form.children.form.hasChanged).toBe(true);
            expect(form.form.hasChanged).toBe(true);
            expect(store.children[1].label.value).toBe("Item 2");
            form.children[1].set({label: "Item 2"});
            expect(form.form.hasChanged).toBe(false);

            form.children.splice(0, 1);
            expect(form.children.map(row => row.id.value)).toEqual([2]);
            expect(form.form.hasChanged).toBe(true);
            expect(store.getValues()).toEqual(storeValues);
        });
    });

    describe("avec StoreListNode", () => {
        test("crée un FormListNode à partir d'un StoreListNode", () => {
            const store = makeStoreNode({testList: [TestListEntity]});
            const {result} = renderHook(() => useFormNode(store.testList));

            expect(result.current.form).toBeDefined();
            expect(result.current.form.isEdit).toBe(false);
            expect(result.current.form.isEmpty).toBe(true);
            expect(result.current.sourceNode).toBe(store.testList);
        });

        test("initialise avec initialData", () => {
            const store = makeStoreNode({testList: [TestListEntity]});
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

        test("détecte les modifications locales d'une liste préremplie avec true", () => {
            const store = makeStoreNode(
                [TestListEntity],
                [
                    {id: 1, label: "Item 1"},
                    {id: 2, label: "Item 2"},
                    {id: 3, label: "Item 3"}
                ]
            );
            const {result} = renderHook(() => useFormNode(store, undefined, true));
            const form = result.current;

            expect(form.map(row => row.id.value)).toEqual([1, 2, 3]);
            for (const [index, row] of form.entries()) {
                expect(row.sourceNode).toBe(store[index]);
                expect(row.form.hasChanged).toBe(false);
            }
            expect(form.form.hasChanged).toBe(false);

            form[0].set({label: "Brouillon"});
            expect(form[0].form.hasChanged).toBe(true);
            expect(form.form.hasChanged).toBe(true);

            form[0].set({label: "Item 1"});
            expect(form.form.hasChanged).toBe(false);

            form.pushNode({id: 4, label: "Brouillon"});
            expect(form[3].form.hasChanged).toBe(true);
            expect(form.form.hasChanged).toBe(true);

            form.splice(3, 1);
            expect(form.form.hasChanged).toBe(false);

            form.splice(1, 1);
            expect(form.map(item => item.id.value)).toEqual([1, 3]);
            expect(form.form.hasChanged).toBe(true);
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
            const store = makeStoreNode({test: TestEntity});
            const {result} = renderHook(() =>
                useFormNode(store.test, s => s.patch("name", f => f.metadata({label: "Nom"})))
            );

            expect(result.current.name.$field.label).toBe("Nom");
        });
    });
});

describe("useFormActions", () => {
    test("crée des FormActions", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result: formNodeResult} = renderHook(() => useFormNode(store.test));
        const {result} = renderHook(() => useFormActions(formNodeResult.current, s => s, []));

        expect(result.current).toBeDefined();
        expect(result.current.save).toBeDefined();
        expect(result.current.load).toBeDefined();
    });

    test("crée des FormActions avec builder", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result: formNodeResult} = renderHook(() => useFormNode(store.test));
        const {result} = renderHook(() =>
            useFormActions(formNodeResult.current, s => s.save(() => Promise.resolve()), [])
        );

        expect(result.current.save).toBeDefined();
    });
});
