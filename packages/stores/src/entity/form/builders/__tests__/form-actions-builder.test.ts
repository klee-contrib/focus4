import {describe, expect, test, vi} from "vitest";

import {FormNode} from "../../../types";
import {FormActionsBuilder} from "../form-actions";

describe("FormActionsBuilder", () => {
    test("params sans argument retourne bien un builder", () => {
        const builder = new FormActionsBuilder<FormNode>().params();
        expect(builder).toBeInstanceOf(FormActionsBuilder);
    });

    test("params(tableau) retourne bien un builder", () => {
        const builder = new FormActionsBuilder<FormNode>().params([1, "a"]);
        expect(builder).toBeInstanceOf(FormActionsBuilder);
    });

    test("params(getter) retourne bien un builder", () => {
        const builder = new FormActionsBuilder<FormNode>().params(() => [1]);
        expect(builder).toBeInstanceOf(FormActionsBuilder);
    });

    test("init() sans service marque hasInit=true", () => {
        const builder = new FormActionsBuilder<FormNode>().init();
        expect(builder.hasInit).toBe(true);
        expect(builder.initService).toBeUndefined();
    });

    test("init(service) enregistre le service d'initialisation", () => {
        const service = vi.fn().mockResolvedValue({});
        const builder = new FormActionsBuilder<FormNode>().init(service);
        expect(builder.hasInit).toBe(true);
        expect(builder.initService).toBe(service);
    });

    test("load(service) enregistre le service de chargement", () => {
        const service = vi.fn().mockResolvedValue({});
        const builder = new FormActionsBuilder<FormNode>().params([1]).load(service as any);
        expect(builder.loadService).toBe(service);
    });

    test("create(service) enregistre le service de création", () => {
        const service = vi.fn().mockResolvedValue({});
        const builder = new FormActionsBuilder<FormNode>().create(service as any);
        expect(builder.createService).toBe(service);
    });

    test("update(service) enregistre le service de mise à jour", () => {
        const service = vi.fn().mockResolvedValue({});
        const builder = new FormActionsBuilder<FormNode>().update(service as any);
        expect(builder.updateService).toBe(service);
    });

    test("save(service) enregistre le service de sauvegarde", () => {
        const service = vi.fn().mockResolvedValue({});
        const builder = new FormActionsBuilder<FormNode>().save(service as any);
        expect(builder.saveService).toBe(service);
    });

    test("create après save jette une erreur", () => {
        const builder = new FormActionsBuilder<FormNode>().save(vi.fn() as any);
        expect(() => builder.create(vi.fn() as any)).toThrow(/create.*save/u);
    });

    test("update après save jette une erreur", () => {
        const builder = new FormActionsBuilder<FormNode>().save(vi.fn() as any);
        expect(() => builder.update(vi.fn() as any)).toThrow(/update.*save/u);
    });

    test("save après create jette une erreur", () => {
        const builder = new FormActionsBuilder<FormNode>().create(vi.fn() as any);
        expect(() => builder.save(vi.fn() as any)).toThrow(/save.*create.*update/u);
    });

    test("save après update jette une erreur", () => {
        const builder = new FormActionsBuilder<FormNode>().update(vi.fn() as any);
        expect(() => builder.save(vi.fn() as any)).toThrow(/save.*create.*update/u);
    });

    test("create + update peuvent coexister", () => {
        const c = vi.fn().mockResolvedValue({});
        const u = vi.fn().mockResolvedValue({});
        const builder = new FormActionsBuilder<FormNode>().create(c as any).update(u as any);
        expect(builder.createService).toBe(c);
        expect(builder.updateService).toBe(u);
    });

    test("on() enregistre un handler pour un événement", () => {
        const handler = vi.fn();
        const builder = new FormActionsBuilder<FormNode>().on("init", handler);
        expect(builder.handlers.init).toContain(handler);
    });

    test("on() accepte un tableau d'événements", () => {
        const handler = vi.fn();
        const builder = new FormActionsBuilder<FormNode>().on(["init", "load"], handler);
        expect(builder.handlers.init).toContain(handler);
        expect(builder.handlers.load).toContain(handler);
    });

    test("trackingId() ajoute les IDs de suivi", () => {
        const builder = new FormActionsBuilder<FormNode>().trackingId("id1", "id2");
        expect(builder.trackingIds).toEqual(["id1", "id2"]);
    });

    test("errorDisplay() enregistre le mode d'affichage", () => {
        const builder = new FormActionsBuilder<FormNode>().errorDisplay("always");
        expect(builder.actionsErrorDisplay).toBe("always");
    });

    test("errorDisplay(never) enregistre 'never'", () => {
        const builder = new FormActionsBuilder<FormNode>().errorDisplay("never");
        expect(builder.actionsErrorDisplay).toBe("never");
    });

    test("successMessage() surcharge le message", () => {
        const builder = new FormActionsBuilder<FormNode>().successMessage("custom.message");
        expect(builder.message).toBe("custom.message");
    });

    test("successMessage() sans argument efface le message par défaut", () => {
        const builder = new FormActionsBuilder<FormNode>().successMessage();
        expect(builder.message).toBeUndefined();
    });

    test("withConfirmation() enregistre la confirmation du routeur", () => {
        const confirmation = {toggle: vi.fn()};
        const router = {confirmation} as any;
        const builder = new FormActionsBuilder<FormNode>().withConfirmation(router);
        expect(builder.confirmation).toBe(confirmation);
    });
});
