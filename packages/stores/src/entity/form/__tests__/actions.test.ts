import {beforeEach, describe, expect, test, vi} from "vitest";

import {messageStore, requestStore} from "@focus4/core";

import {FormListNode, FormNode} from "../../types";
import {FormActions} from "../actions";
import {FormActionsBuilder} from "../builders";

const abortMock = vi.fn();

function makeBuilder() {
    return new FormActionsBuilder<FormNode>().errorDisplay("after-focus");
}

type ActionPayload = Record<string, unknown> | string | number | void;
type WideActionsBuilder = FormActionsBuilder<
    FormNode | FormListNode,
    readonly unknown[],
    ActionPayload,
    ActionPayload,
    ActionPayload
>;

function asWideBuilder<
    P extends readonly unknown[],
    C extends ActionPayload,
    U extends ActionPayload,
    S extends ActionPayload
>(builder: FormActionsBuilder<FormNode, P, C, U, S>) {
    return builder as unknown as WideActionsBuilder;
}

function makeFormNode(options: {isStoreNode?: boolean; isValid?: boolean} = {}): FormNode {
    const sourceNode =
        options.isStoreNode === false
            ? {
                  replaceNodes: vi.fn()
              }
            : {
                  clear: vi.fn(),
                  set: vi.fn(),
                  replace: vi.fn(),
                  replaceNodes: vi.fn()
              };

    const field = {
        _added: false,
        value: "new",
        $field: {name: "name", label: "Name", comment: ""}
    };

    return {
        sourceNode,
        form: {
            isEdit: false,
            isValid: options.isValid ?? true,
            errors: {name: "Required"},
            hasChanged: true,
            _initialData: {name: "old"}
        },
        name: field,
        set: vi.fn(),
        getValues: vi.fn(() => ({name: "new"})),
        reset: vi.fn(),
        clear: vi.fn()
    } as unknown as FormNode;
}

function getSourceNode(node: FormNode) {
    return node.sourceNode as unknown as {
        clear?: ReturnType<typeof vi.fn>;
        set?: ReturnType<typeof vi.fn>;
        replace?: ReturnType<typeof vi.fn>;
        replaceNodes: ReturnType<typeof vi.fn>;
    };
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
        const builder = makeBuilder();
        builder.handlers.edit = [onEdit];
        builder.handlers.cancel = [onCancel];
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));

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

        const loadingActions = new FormActions(
            formNode,
            asWideBuilder(makeBuilder().save(async () => ({name: "saved"})))
        );
        await loadingActions.save();

        const noServiceActions = new FormActions(formNode, asWideBuilder(makeBuilder()));
        await noServiceActions.save();

        expect(requestStore.track).not.toHaveBeenCalled();
    });

    test("save remonte une erreur de validation et appelle les handlers error", async () => {
        const onError = vi.fn();
        const builder = makeBuilder().save(async () => ({name: "saved"}));
        builder.handlers.error = [onError];
        const formNode = makeFormNode({isValid: false});
        const actions = new FormActions(formNode, asWideBuilder(builder));

        await expect(actions.save()).rejects.toMatchObject({$validationError: true});
        expect(onError).toHaveBeenCalledWith("error", "save", expect.anything());
    });

    test("save utilise updateService quand params est defini", async () => {
        const onUpdate = vi.fn();
        const updateService = vi.fn(async (_id: number, _d: unknown) => ({name: "updated"}));
        const builder = makeBuilder()
            .params([12] as [number])
            .update(updateService)
            .successMessage("saved");
        builder.handlers.update = [onUpdate];
        const formNode = makeFormNode({isStoreNode: true});
        const actions = new FormActions(formNode, asWideBuilder(builder));
        const sourceNode = getSourceNode(formNode);

        await actions.save();

        expect(updateService).toHaveBeenCalledWith(12, {name: "new"});
        expect(sourceNode.replace).toHaveBeenCalledWith({name: "updated"});
        expect(messageStore.addSuccessMessage).toHaveBeenCalledWith("saved");
        expect(onUpdate).toHaveBeenCalledWith("update", {name: "updated"});
    });

    test("save utilise createService sans params", async () => {
        const onCreate = vi.fn();
        const createService = vi.fn(async (_d: unknown) => ({name: "created"}));
        const builder = makeBuilder().create(createService);
        builder.handlers.create = [onCreate];
        const formNode = makeFormNode({isStoreNode: false});
        const actions = new FormActions(formNode, asWideBuilder(builder));
        const sourceNode = getSourceNode(formNode);

        await actions.save();

        expect(createService).toHaveBeenCalledWith({name: "new"});
        expect(sourceNode.replaceNodes).toHaveBeenCalledWith({name: "created"});
        expect(onCreate).toHaveBeenCalledWith("create", {name: "created"});
    });

    test("save sans réponse objet réinjecte le formulaire", async () => {
        const builder = makeBuilder().save(async () => undefined);
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));
        const sourceNode = getSourceNode(formNode);

        await actions.save();

        expect(sourceNode.replace).toHaveBeenCalledWith(formNode);
    });

    test("save relance les erreurs techniques", async () => {
        const boom = new Error("boom");
        const onError = vi.fn();
        const builder = makeBuilder().save(async () => ({ok: true}));
        builder.handlers.error = [onError];
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));

        vi.mocked(requestStore.track).mockRejectedValueOnce(boom);

        await expect(actions.save()).rejects.toThrow("boom");
        expect(onError).toHaveBeenCalledWith("error", "save", boom);
    });

    test("clear vide aussi le formNode", () => {
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(makeBuilder()));
        const sourceNode = getSourceNode(formNode);

        actions.clear();

        expect(sourceNode.clear).toHaveBeenCalledTimes(1);
        expect(formNode.clear).toHaveBeenCalledTimes(1);
    });

    test("register avec confirmation configure et nettoie la confirmation", () => {
        const toggle = vi.fn();
        const builder = makeBuilder().save(async () => ({ok: true}));
        builder.confirmation = {
            active: false,
            pending: false,
            commit: vi.fn(),
            cancel: vi.fn(),
            toggle
        } as unknown as NonNullable<typeof builder.confirmation>;
        const formNode = makeFormNode();
        formNode.form.isEdit = true;
        Reflect.set(formNode.form, "hasChanged", true);
        const actions = new FormActions(formNode, asWideBuilder(builder));
        Reflect.set(actions, "abortController", {abort: abortMock});

        const cleanup = actions.register();

        expect(toggle).toHaveBeenCalledWith(expect.anything(), true, expect.anything());

        cleanup();

        expect(abortMock).toHaveBeenCalled();
        expect(toggle).toHaveBeenCalledWith(expect.anything(), false);
    });

    test("init appelle initService et les handlers puis injecte dans le source", async () => {
        const onInit = vi.fn();
        const builder = makeBuilder().init(async () => ({name: "init"}));
        builder.handlers.init = [onInit];
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));
        const sourceNode = getSourceNode(formNode);

        await actions.init();

        expect(sourceNode.replace).toHaveBeenCalledWith({name: "init"});
        expect(onInit).toHaveBeenCalledWith("init", {name: "init"});
    });

    test("init en erreur clear puis rethrow", async () => {
        const boom = new Error("init-failed");
        const onError = vi.fn();
        const builder = makeBuilder().init(async () => {
            throw boom;
        });
        builder.handlers.error = [onError];
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));

        await expect(actions.init()).rejects.toThrow("init-failed");

        expect(formNode.clear).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith("error", "init", boom);
    });

    test("errorDisplay('always') n'utilise pas les branches after-focus", () => {
        const builder = new FormActionsBuilder<FormNode>().errorDisplay("always");
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));
        expect(actions.errorDisplay).toBe("always");
        actions.onClickEdit();
        actions.onClickCancel();
        expect(actions.errorDisplay).toBe("always");
    });

    test("actionsErrorDisplay défaut vaut 'always' hors édition", () => {
        const builder = new FormActionsBuilder<FormNode>();
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));
        expect(actions.errorDisplay).toBe("always");
    });

    test("actionsErrorDisplay défaut vaut 'after-focus' en édition initiale", () => {
        const builder = new FormActionsBuilder<FormNode>();
        const formNode = makeFormNode();
        formNode.form.isEdit = true;
        const actions = new FormActions(formNode, asWideBuilder(builder));
        expect(actions.errorDisplay).toBe("after-focus");
    });

    test("save avec une réponse Response réinjecte le formulaire", async () => {
        const builder = makeBuilder().save(async () => new Response("hello") as any);
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));
        const sourceNode = getSourceNode(formNode);

        await actions.save();

        expect(sourceNode.replace).toHaveBeenCalledWith(formNode);
    });

    test("save avec successMessage envoie le message", async () => {
        const builder = makeBuilder()
            .save(async () => ({name: "ok"}))
            .successMessage("bien!");
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));

        await actions.save();

        expect(messageStore.addSuccessMessage).toHaveBeenCalledWith("bien!");
    });

    test("init sans initService injecte un objet vide", async () => {
        const builder = new FormActionsBuilder<FormNode>().init();
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));
        const sourceNode = getSourceNode(formNode);

        await actions.init();

        expect(sourceNode.replace).toHaveBeenCalled();
    });

    test("init ne fait rien si params et loadService définis", async () => {
        const initSvc = vi.fn(async () => ({name: "x"}));
        const builder = new FormActionsBuilder<FormNode>()
            .params([1] as [number])
            .load(async () => ({name: "loaded"}))
            .init(initSvc);
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));

        await actions.init();

        expect(initSvc).not.toHaveBeenCalled();
    });

    test("register sans confirmation retourne le disposer du parent", () => {
        const builder = makeBuilder().save(async () => ({ok: true}));
        const formNode = makeFormNode();
        const actions = new FormActions(formNode, asWideBuilder(builder));

        const cleanup = actions.register();
        expect(typeof cleanup).toBe("function");
        cleanup();
    });
});
