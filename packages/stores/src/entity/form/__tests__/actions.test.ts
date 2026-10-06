import {beforeEach, describe, expect, test, vi} from "vitest";
import {z} from "zod";

import {messageStore, requestStore} from "@focus4/core";
import {e, entity} from "@focus4/entities";

import {domain} from "../../../__tests__/test-utils";
import {makeStoreNode} from "../../store/node";
import {FormListNode, FormNode, SourceNodeType} from "../../types";
import {FormActions} from "../actions";
import {FormActionsBuilder, FormNodeBuilder} from "../builders";

const abortMock = vi.fn();

function makeFormNode() {
    return vi.mockObject(new FormNodeBuilder(makeStoreNode(entity({field: e.field(domain(z.string()))}))).build(), {
        spy: true
    });
}

function makeFormActions<
    FN extends FormListNode | FormNode,
    A extends readonly any[] = never,
    C extends SourceNodeType<FN> | void | string | number = never,
    U extends SourceNodeType<FN> | void | string | number = never,
    S extends SourceNodeType<FN> | void | string | number = never
>(formNode: FN, builder: (s: FormActionsBuilder<FN>) => FormActionsBuilder<FN, A, C, U, S>) {
    return new FormActions(formNode, builder(new FormActionsBuilder()));
}

describe("FormActions", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        abortMock.mockReset();

        vi.spyOn(messageStore, "addSuccessMessage").mockImplementation(() => undefined);
        vi.spyOn(requestStore, "isLoading").mockReturnValue(false);
        vi.spyOn(requestStore, "track").mockImplementation(
            async (_ids: string | string[], service: () => Promise<unknown>, onSuccess?: (d: unknown) => void) => {
                const data = await service();
                onSuccess?.(data);
                return data;
            }
        );
    });

    test("onClickEdit / onClickCancel mettent à jour le mode édition et appellent les handlers", () => {
        const onEdit = vi.fn();
        const onCancel = vi.fn();
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.on("edit", onEdit).on("cancel", onCancel));

        actions.onClickEdit();
        expect(formNode.form.isEdit).toBe(true);
        expect(onEdit).toHaveBeenCalledWith("edit");

        actions.onClickCancel();
        expect(formNode.form.isEdit).toBe(false);
        expect(formNode.reset).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledWith("cancel");
    });

    test("save retourne sans rien faire si chargement en cours ou sans service", async () => {
        const formNode = makeFormNode();
        vi.mocked(requestStore.isLoading).mockReturnValue(true);

        const loadingActions = makeFormActions(formNode, a => a.save(async () => ({field: "saved"})));
        await loadingActions.save();

        const noServiceActions = makeFormActions(formNode, a => a);
        await noServiceActions.save();

        expect(requestStore.track).not.toHaveBeenCalled();
    });

    test("save remonte une erreur de validation et appelle les handlers error", async () => {
        const onError = vi.fn();
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.on("error", onError).save(async () => ({field: "saved"})));

        formNode.form.isEdit = true;
        await expect(actions.save()).rejects.toMatchObject({$validationError: true});
        expect(onError).toHaveBeenCalledWith("error", "save", expect.anything());
    });

    test("save utilise updateService quand params est defini", async () => {
        const onUpdate = vi.fn();
        const updateService = vi.fn(async (_id: number, _d: unknown) => ({field: "updated"}));
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a =>
            a.params([12]).update(updateService).successMessage("saved").on("update", onUpdate)
        );

        formNode.field.value = "new";
        await actions.save();

        expect(updateService).toHaveBeenCalledWith(12, {field: "new"});
        expect(formNode.sourceNode.field.value).toBe("updated");
        expect(formNode.field.value).toBe("updated");
        expect(messageStore.addSuccessMessage).toHaveBeenCalledWith("saved");
        expect(onUpdate).toHaveBeenCalledWith("update", {field: "updated"});
    });

    test("save utilise createService sans params", async () => {
        const onCreate = vi.fn();
        const createService = vi.fn(async (_d: unknown) => ({field: "created"}));
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.create(createService).on("create", onCreate));

        await actions.save();

        expect(createService).toHaveBeenCalledWith({});
        expect(formNode.sourceNode.getValues()).toEqual({field: "created"});
        expect(formNode.getValues()).toEqual({field: "created"});
        expect(formNode.form.isEdit).toBe(false);
        expect(onCreate).toHaveBeenCalledWith("create", {field: "created"});
    });

    test("save sans réponse objet réinjecte le formulaire", async () => {
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.save(async () => undefined));

        actions.onClickEdit();
        formNode.field.value = "edited";
        await actions.save();

        expect(formNode.sourceNode.getValues()).toEqual({field: "edited"});
        expect(formNode.getValues()).toEqual({field: "edited"});
        expect(formNode.form.isEdit).toBe(false);
    });

    test("save relance les erreurs techniques", async () => {
        const boom = new Error("boom");
        const onError = vi.fn();
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.on("error", onError).save(async () => ({field: "ok"})));

        vi.mocked(requestStore.track).mockRejectedValueOnce(boom);

        await expect(actions.save()).rejects.toThrow("boom");
        expect(onError).toHaveBeenCalledWith("error", "save", boom);
    });

    test("save avec une réponse Response réinjecte le formulaire", async () => {
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.save(async () => new Response("hello") as any));

        await actions.save();

        expect(formNode.sourceNode.getValues()).toEqual(formNode.getValues());
        expect(formNode.form.isEdit).toBe(false);
    });

    test("save avec successMessage envoie le message", async () => {
        const actions = makeFormActions(makeFormNode(), a =>
            a.save(async () => ({field: "ok"})).successMessage("bien!")
        );

        await actions.save();

        expect(messageStore.addSuccessMessage).toHaveBeenCalledWith("bien!");
    });

    test("clear vide aussi le formNode", () => {
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a);

        formNode.sourceNode.field.value = "to be cleared";
        expect(formNode.getValues()).toEqual({field: "to be cleared"});

        actions.clear();

        expect(formNode.sourceNode.getValues()).toEqual({});
        expect(formNode.getValues()).toEqual({});
    });

    test("init appelle initService et les handlers puis injecte dans le source", async () => {
        const onInit = vi.fn();
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.init(async () => ({field: "init"})).on("init", onInit));

        await actions.init();

        expect(formNode.sourceNode.field.value).toBe("init");
        expect(formNode.field.value).toBe("init");
        expect(onInit).toHaveBeenCalledWith("init", {field: "init"});
    });

    test("init pour initialiser un champ ajouté", async () => {
        const formNode = new FormNodeBuilder(makeStoreNode(entity({field: e.field(domain(z.string()))})))
            .add("new", f => f.domain(domain(z.string())))
            .build();
        const actions = makeFormActions(formNode, a => a.init(async () => ({new: "init"})));

        await actions.init();

        expect(formNode.sourceNode.getValues()).toEqual({});
        expect(formNode.getValues()).toEqual({});
        expect(formNode.getValues(false, true)).toEqual({new: "init"});
        expect(formNode.form.hasChanged).toBe(false);

        formNode.field.value = "changed";

        expect(formNode.form.hasChanged).toBe(true);

        formNode.reset();

        expect(formNode.getValues()).toEqual({});
        expect(formNode.getValues(false, true)).toEqual({new: "init"});
        expect(formNode.form.hasChanged).toBe(false);
    });

    test("init en erreur clear puis rethrow", async () => {
        const boom = new Error("init-failed");
        const onError = vi.fn();
        const formNode = makeFormNode();
        formNode.field.value = "init";
        const actions = makeFormActions(formNode, a =>
            a
                .init(async () => {
                    throw boom;
                })
                .on("error", onError)
        );

        await expect(actions.init()).rejects.toThrow("init-failed");

        expect(formNode.sourceNode.getValues()).toEqual({});
        expect(formNode.getValues()).toEqual({});
        expect(onError).toHaveBeenCalledWith("error", "init", boom);
    });

    test("init sans initService injecte un objet vide", async () => {
        const formNode = makeFormNode();

        formNode.field.value = "init";
        const actions = makeFormActions(formNode, a => a.init());

        await actions.init();

        expect(formNode.sourceNode.field.value).toBe("init");
        expect(formNode.field.value).toBe("init");

        formNode.reset();

        expect(formNode.sourceNode.field.value).toBe("init");
        expect(formNode.field.value).toBe("init");
    });

    test("init ne fait rien si params et loadService définis", async () => {
        const initSvc = vi.fn(async () => ({field: "x"}));
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a =>
            a
                .params([1] as [number])
                .load(async () => ({field: "loaded"}))
                .init(initSvc)
        );

        await actions.init();

        expect(initSvc).not.toHaveBeenCalled();
    });

    test("errorDisplay('always') n'utilise pas les branches after-focus", () => {
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.errorDisplay("always"));
        expect(actions.errorDisplay).toBe("always");
        actions.onClickEdit();
        actions.onClickCancel();
        expect(actions.errorDisplay).toBe("always");
    });

    test("actionsErrorDisplay défaut vaut 'always' hors édition", () => {
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a);
        expect(actions.errorDisplay).toBe("always");
    });

    test("actionsErrorDisplay défaut vaut 'after-focus' en édition initiale", () => {
        const formNode = makeFormNode();
        formNode.form.isEdit = true;
        const actions = makeFormActions(formNode, a => a);
        expect(actions.errorDisplay).toBe("after-focus");
    });

    test("register avec confirmation configure et nettoie la confirmation", () => {
        const toggle = vi.fn();
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.save(async () => ({field: "saved"})));
        const {builder} = actions as any;
        builder.confirmation = {
            active: false,
            pending: false,
            commit: vi.fn(),
            cancel: vi.fn(),
            toggle
        } as unknown as NonNullable<typeof builder.confirmation>;
        formNode.form.isEdit = true;
        formNode.field.value = "new";
        Reflect.set(actions, "abortController", {abort: abortMock});

        const cleanup = actions.register();

        expect(toggle).toHaveBeenCalledWith(expect.anything(), true, expect.anything());

        cleanup();

        expect(abortMock).toHaveBeenCalled();
        expect(toggle).toHaveBeenCalledWith(expect.anything(), false);
    });

    test("register sans confirmation retourne le disposer du parent", () => {
        const formNode = makeFormNode();
        const actions = makeFormActions(formNode, a => a.save(async () => ({field: "ok"})));

        const cleanup = actions.register();
        expect(typeof cleanup).toBe("function");
        cleanup();
    });
});
