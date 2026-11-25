import {renderHook} from "@testing-library/react";
import {afterEach, describe, expect, test, vi} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {FormActions, FormListNodeBuilder, FormNodeBuilder, makeStoreNode} from "@focus4/stores";

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

afterEach(() => {
    vi.restoreAllMocks();
});

describe("useFormNode", () => {
    test("construit un FormNode à partir d'un StoreNode", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result} = renderHook(() => useFormNode(store.test));

        expect(result.current.sourceNode).toBe(store.test);
        expect(result.current.form.isEdit).toBe(false);
    });

    test("construit un FormListNode à partir d'un StoreListNode", () => {
        const store = makeStoreNode({testList: [TestListEntity]});
        const {result} = renderHook(() => useFormNode(store.testList));

        expect(result.current.sourceNode).toBe(store.testList);
        expect(result.current.form.isEdit).toBe(false);
    });

    test("transmet initialData au FormNodeBuilder", () => {
        const store = makeStoreNode({test: TestEntity});
        const build = vi.spyOn(FormNodeBuilder.prototype, "build");

        renderHook(() => useFormNode(store.test, undefined, {name: "Test"}));

        expect(build).toHaveBeenCalledWith({name: "Test"});
    });

    test("transmet initialData au FormListNodeBuilder", () => {
        const store = makeStoreNode({testList: [TestListEntity]});
        const build = vi.spyOn(FormListNodeBuilder.prototype, "build");

        renderHook(() => useFormNode(store.testList, undefined, [{id: 1, label: "Test"}]));

        expect(build).toHaveBeenCalledWith([{id: 1, label: "Test"}]);
    });

    test("crée un StoreNode à partir d'une entité", () => {
        const {result} = renderHook(() => useFormNode(TestEntity));

        expect(result.current.$entity).toBe(TestEntity);
        expect(result.current.id).toBeDefined();
        expect(result.current.name).toBeDefined();
    });

    test("crée un StoreListNode à partir d'une entité liste", () => {
        const {result} = renderHook(() => useFormNode([TestListEntity]));

        expect(result.current.$entity).toBe(TestListEntity);
        expect(Array.isArray(result.current)).toBe(true);
    });

    test("transmet le builder fourni", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result} = renderHook(() =>
            useFormNode(store.test, s => s.patch("name", f => f.metadata({label: "Nom"})))
        );

        expect(result.current.name.$field.label).toBe("Nom");
    });

    test("dispose le FormNode au démontage", () => {
        const store = makeStoreNode({test: TestEntity});
        const {build} = FormNodeBuilder.prototype;
        const dispose = vi.fn();
        vi.spyOn(FormNodeBuilder.prototype, "build").mockImplementation(function b(
            this: FormNodeBuilder<any>,
            initialData
        ) {
            const node = build.call(this, initialData);
            node.dispose = dispose;
            return node;
        });
        const {unmount} = renderHook(() => useFormNode(store.test));

        unmount();

        expect(dispose).toHaveBeenCalledOnce();
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

    test("transmet le builder fourni", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result: formNodeResult} = renderHook(() => useFormNode(store.test));
        const save = () => Promise.resolve();
        const {result} = renderHook(() => useFormActions(formNodeResult.current, s => s.save(save), []));

        expect(result.current.save).toBeDefined();
    });

    test("n'initialise pas à nouveau les actions lors d'un rerender", () => {
        const store = makeStoreNode({test: TestEntity});
        const {result: formNodeResult} = renderHook(() => useFormNode(store.test));
        const init = vi.spyOn(FormActions.prototype, "init");
        const {rerender} = renderHook(
            ({dependency}) => useFormActions(formNodeResult.current, s => s, [dependency]),
            {initialProps: {dependency: 1}}
        );

        rerender({dependency: 2});

        expect(init).toHaveBeenCalledOnce();
    });
});
