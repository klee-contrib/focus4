import {Component} from "react";
import {afterEach, describe, expect, test, vi} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {FormActions, FormListNodeBuilder, FormNodeBuilder, makeStoreNode} from "@focus4/stores";

import {makeFormActions, makeFormNode} from "../form";

const disposeOnUnmount = vi.hoisted(() => vi.fn());

vi.mock("mobx-react", () => ({disposeOnUnmount}));

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

const TestListEntity = entity({
    id: e.field(DO_NUMBER),
    label: e.field(DO_STRING)
});

class TestComponent extends Component {}

afterEach(() => {
    vi.restoreAllMocks();
    disposeOnUnmount.mockReset();
});

describe("makeFormNode", () => {
    test("construit un FormNode à partir d'un StoreNode", () => {
        const store = makeStoreNode({test: TestEntity});
        const form = makeFormNode(null, store.test);

        expect(form.sourceNode).toBe(store.test);
        expect(form.form.isEdit).toBe(false);
    });

    test("construit un FormListNode à partir d'un StoreListNode", () => {
        const store = makeStoreNode({testList: [TestListEntity]});
        const form = makeFormNode(null, store.testList);

        expect(form.sourceNode).toBe(store.testList);
        expect(form.form.isEdit).toBe(false);
    });

    test("transmet initialData au FormNodeBuilder", () => {
        const store = makeStoreNode({test: TestEntity});
        const build = vi.spyOn(FormNodeBuilder.prototype, "build");

        makeFormNode(null, store.test, undefined, () => ({name: "Test"}));

        expect(build).toHaveBeenCalledWith(expect.any(Function));
    });

    test("transmet initialData au FormListNodeBuilder", () => {
        const store = makeStoreNode({testList: [TestListEntity]});
        const build = vi.spyOn(FormListNodeBuilder.prototype, "build");

        makeFormNode(null, store.testList, undefined, [{id: 1, label: "Test"}]);

        expect(build).toHaveBeenCalledWith([{id: 1, label: "Test"}]);
    });

    test("crée un FormNode à partir d'une entité", () => {
        const form = makeFormNode(null, TestEntity);

        expect(form.$entity).toBe(TestEntity);
        expect(form.id).toBeDefined();
        expect(form.name).toBeDefined();
    });

    test("crée un FormListNode à partir d'une entité liste", () => {
        const form = makeFormNode(null, [TestListEntity]);

        expect(form.$entity).toBe(TestListEntity);
        expect(Array.isArray(form)).toBe(true);
    });

    test("transmet le builder fourni", () => {
        const store = makeStoreNode({test: TestEntity});
        const form = makeFormNode(null, store.test, s => s.patch("name", f => f.metadata({label: "Nom"})));

        expect(form.name.$field.label).toBe("Nom");
    });

    test("enregistre le disposeur sur le cycle de vie du composant", () => {
        const component = new TestComponent({});
        const form = makeFormNode(component, TestEntity);

        expect(disposeOnUnmount).toHaveBeenCalledWith(component, form.dispose);
    });
});

describe("makeFormActions", () => {
    test("crée des FormActions", () => {
        const store = makeStoreNode({test: TestEntity});
        const form = makeFormNode(null, store.test);
        const actions = makeFormActions(null, form, s => s);

        expect(actions).toBeDefined();
        expect(actions.save).toBeDefined();
        expect(actions.load).toBeDefined();
    });

    test("transmet le builder fourni", () => {
        const store = makeStoreNode({test: TestEntity});
        const form = makeFormNode(null, store.test);
        const actions = makeFormActions(null, form, s => s.save(() => Promise.resolve()));

        expect(actions.save).toBeDefined();
    });

    test("enregistre, initialise et dispose les actions avec un composant", () => {
        const component = new TestComponent({});
        const form = makeFormNode(null, TestEntity);
        const disposer = vi.fn();
        const register = vi.spyOn(FormActions.prototype, "register").mockReturnValue(disposer);
        const init = vi.spyOn(FormActions.prototype, "init").mockImplementation(() => Promise.resolve());

        const actions = makeFormActions(component, form, builder => builder);

        expect(register).toHaveBeenCalledTimes(1);
        expect(init).toHaveBeenCalledTimes(1);
        expect(disposeOnUnmount).toHaveBeenCalledWith(component, disposer);
        expect(actions).toBeInstanceOf(FormActions);
    });
});
