import {observable} from "mobx";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import * as core from "@focus4/core";

import {LocalCollectionStore} from "../../../collection";
import {StoreListNode, StoreNode} from "../../types";
import {LoadRegistration} from "../load";
import {NodeLoadBuilder} from "../load-builder";
import {defaultLoad} from "../node";

type UnknownStore = StoreNode | StoreListNode | LocalCollectionStore<Record<string, unknown>>;

const makeStoreNodeMock = () =>
    ({
        clear: vi.fn(),
        replace: vi.fn(),
        set: vi.fn(),
        load: defaultLoad
    }) as unknown as StoreNode;

describe("LoadRegistration", () => {
    beforeEach(() => {
        vi.spyOn(core, "isAbortError").mockReturnValue(false);
        vi.spyOn(core.requestStore, "isLoading").mockReturnValue(false);
        vi.spyOn(core.requestStore, "track").mockImplementation(
            async (_ids: string | string[], service: () => Promise<unknown>, cb?: (d: unknown) => void) => {
                const data = await service();
                cb?.(data);
                return data;
            }
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("refuse un store de formulaire avec loadService", () => {
        const builder = new NodeLoadBuilder<UnknownStore>().params().load(async () => ({}));
        const formLikeStore = {form: {}, clear: vi.fn(), set: vi.fn()} as unknown as StoreNode;

        expect(() => new LoadRegistration(formLikeStore, builder)).toThrow();
    });

    test("params encapsule une valeur scalaire dans un tableau", () => {
        const builder = new NodeLoadBuilder<UnknownStore>().params(() => 42);
        const storeNode = makeStoreNodeMock();
        const registration = new LoadRegistration(storeNode, builder, "track-1");

        expect(registration.params).toEqual([42]);
    });

    test("isLoading utilise requestStore.isLoading", () => {
        vi.mocked(core.requestStore.isLoading).mockReturnValue(true);
        const builder = new NodeLoadBuilder<UnknownStore>().params();
        const storeNode = makeStoreNodeMock();
        const registration = new LoadRegistration(storeNode, builder, "track-2");

        expect(registration.isLoading).toBe(true);
        expect(core.requestStore.isLoading).toHaveBeenCalledWith("track-2");
    });

    test("load injecte le résultat dans un StoreNode et appelle les handlers", async () => {
        const replace = vi.fn();
        const onLoad = vi.fn();
        const builder = new NodeLoadBuilder<UnknownStore>()
            .params(() => ["x"] as const)
            .load(async (_arg: string, request?: RequestInit) => {
                expect(request?.signal).toBeDefined();
                return {id: 1};
            })
            .trackingId("other")
            .on("load", onLoad);

        const storeNode = {...makeStoreNodeMock(), replace} as unknown as StoreNode;
        const registration = new LoadRegistration(storeNode, builder, "track-3");

        await registration.load();

        expect(core.requestStore.track).toHaveBeenCalled();
        expect(replace).toHaveBeenCalledWith({id: 1});
        expect(onLoad).toHaveBeenCalledWith("load", {id: 1});
    });

    test("load injecte le résultat dans un StoreListNode", async () => {
        const list = observable.array<unknown>([], {deep: false}) as unknown as StoreListNode;
        Reflect.set(list, "replaceNodes", vi.fn());
        Reflect.set(list, "clear", vi.fn());
        Reflect.set(list, "load", defaultLoad);

        const builder = new NodeLoadBuilder<UnknownStore>()
            .params()
            .load(async (_request?: RequestInit) => [{id: 1}, {id: 2}]);
        const registration = new LoadRegistration(list, builder, "track-4");

        await registration.load();

        expect((list as unknown as {replaceNodes: ReturnType<typeof vi.fn>}).replaceNodes).toHaveBeenCalledWith([
            {id: 1},
            {id: 2}
        ]);
    });

    test("load injecte le résultat dans un LocalCollectionStore", async () => {
        const collection = new LocalCollectionStore<Record<string, unknown>>();
        collection.selectedItems.add({id: "old"});

        const builder = new NodeLoadBuilder<UnknownStore>()
            .params()
            .load(async (_request?: RequestInit) => [{id: "a"}]);
        const registration = new LoadRegistration(collection, builder, "track-5");

        await registration.load();

        expect(collection.selectedItems.size).toBe(0);
        expect(collection.list).toEqual([{id: "a"}]);
    });

    test("load ignore les erreurs d'abandon", async () => {
        const builder = new NodeLoadBuilder<UnknownStore>().params().load(async () => ({id: 1}));
        const storeNode = makeStoreNodeMock();
        const registration = new LoadRegistration(storeNode, builder, "track-6");
        const abortError = new Error("aborted");

        vi.mocked(core.requestStore.track).mockRejectedValueOnce(abortError);
        vi.mocked(core.isAbortError).mockReturnValueOnce(true);

        await expect(registration.load()).resolves.toBeUndefined();
        expect(storeNode.clear).not.toHaveBeenCalled();
    });

    test("load nettoie puis relance les erreurs non-abort", async () => {
        const onError = vi.fn();
        const builder = new NodeLoadBuilder<UnknownStore>()
            .params()
            .load(async () => ({id: 1}))
            .on("error", onError);
        const storeNode = makeStoreNodeMock();
        const registration = new LoadRegistration(storeNode, builder, "track-7");
        const technicalError = new Error("boom");

        vi.mocked(core.requestStore.track).mockRejectedValueOnce(technicalError);

        await expect(registration.load()).rejects.toThrow("boom");
        expect(storeNode.clear).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith("error", "load", technicalError);
    });

    test("register affecte load puis nettoie les hooks", () => {
        const storeNode = makeStoreNodeMock();
        const builder = new NodeLoadBuilder<UnknownStore>().params(() => []).load(async () => ({id: 1}));
        const registration = new LoadRegistration(storeNode, builder, "track-8");

        const cleanup = registration.register();

        expect(storeNode.load).toBe(registration.load);

        cleanup?.();

        expect(storeNode.load).toBe(defaultLoad);
    });

    test("register sur LocalCollectionStore remplace localLoadService et trackingId", () => {
        const collection = new LocalCollectionStore<Record<string, unknown>>();
        const builder = new NodeLoadBuilder<UnknownStore>().params(() => []).load(async () => []);
        const registration = new LoadRegistration(collection, builder, "custom-id");

        const cleanup = registration.register(collection, builder);

        expect(registration.trackingId).toBe(collection.trackingId);
        expect(collection.localLoadService).toBe(registration.load);

        cleanup?.();

        expect(collection.localLoadService).toBeUndefined();
    });

    test("register sans loadService retourne un cleanup minimal", () => {
        const storeNode = makeStoreNodeMock();
        const builder = new NodeLoadBuilder<UnknownStore>().params(() => []);
        const registration = new LoadRegistration(storeNode, builder, "track-9");

        const cleanup = registration.register();

        expect(typeof cleanup).toBe("function");
    });
});
