import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {makeRouter, param} from "../index";

const waitForNavigation = () =>
    new Promise(resolve => {
        setTimeout(resolve, 10);
    });

describe("makeRouter", () => {
    let originalHash: string;

    beforeEach(() => {
        originalHash = window.location.hash;
        window.location.hash = "";
    });

    afterEach(() => {
        window.location.hash = originalHash;
    });

    test("crée un routeur avec une config simple", async () => {
        const router = makeRouter({users: {}, posts: {}});
        await router.start();

        expect(router.state).toBeDefined();
        expect(router.query).toBeDefined();
    });

    test("is retourne true pour la route active", async () => {
        const router = makeRouter({users: {}});
        await router.start();
        router.to(r => r("users"));
        expect(router.is(x => x("users"))).toBe(true);
    });

    test("is retourne false pour une route inactive", async () => {
        const router = makeRouter({users: {}, posts: {}});
        await router.start();

        window.location.hash = "#/users";
        await new Promise(resolve => {
            setTimeout(resolve, 10);
        });

        expect(router.is(x => x("posts"))).toBe(false);
    });

    test("href génère une URL correcte", () => {
        const router = makeRouter({users: {}});
        const url = router.href(x => x("users"));
        expect(url).toBe("#/users");
    });

    test("href génère une URL avec query params", () => {
        const router = makeRouter({users: {}}, undefined, {page: "number"});
        const url = router.href(x => x("users"), {page: 1});
        expect(url).toBe("#/users?page=1");
    });

    test("get retourne le paramètre de route", async () => {
        const router = makeRouter({users: param("id", b => b.string())});
        await router.start();
        router.to(b => b("users")("123"));
        expect(router.state.users.id).toBe("123");
    });

    test("gère les query params", async () => {
        const router = makeRouter({users: {}}, undefined, {page: "number", search: "string"});
        await router.start();
        router.to(b => b("users"), true, {page: 2, search: "test"});
        expect(router.query.page).toBe(2);
        expect(router.query.search).toBe("test");
    });

    test("gère les paramètres de route", async () => {
        const router = makeRouter({users: param("id", b => b.string())});
        await router.start();
        router.to(r => r("users")("123"));
        expect(router.state.users.id).toBe("123");
    });

    test("gère les paramètres number", async () => {
        const router = makeRouter({users: param("id", b => b.number())});
        await router.start();
        router.to(r => r("users")(123));
        expect(router.state.users.id).toBe(123);
    });

    test("sub crée une vue du routeur", async () => {
        const router = makeRouter({
            users: param("userId", b => b.string(), {
                posts: param("postId", b => b.number())
            })
        });
        await router.start();
        router.to(r => r("users")("123")("posts")(456));
        const subRouter = router.sub(x => x("users")("userId")("posts")("postId"));
        expect(subRouter.state.postId).toBe(456);
    });

    test("confirmation active/désactive le mode confirmation", () => {
        const router = makeRouter({users: {}});
        expect(router.confirmation.active).toBe(false);

        router.confirmation.toggle("test", true);
        expect(router.confirmation.active).toBe(true);

        router.confirmation.toggle("test", false);
        expect(router.confirmation.active).toBe(false);
    });

    test("navigation en attente tant que la confirmation n'est pas validée", async () => {
        const router = makeRouter({users: {}, posts: {}});
        await router.start();

        router.to(r => r("users"));
        await waitForNavigation();

        router.confirmation.toggle("guard", true);
        router.to(r => r("posts"));
        await waitForNavigation();

        expect(router.confirmation.pending).toBe(true);
        expect(router.is(x => x("users"))).toBe(true);

        await router.confirmation.commit();

        expect(router.confirmation.pending).toBe(false);
        expect(router.is(x => x("posts"))).toBe(true);

        router.confirmation.toggle("guard", false);
    });

    test("commit avec save=true exécute les callbacks enregistrés", async () => {
        const saveSpy = async () => {
            saveSpy.called = true;
        };
        saveSpy.called = false;

        const router = makeRouter({users: {}, posts: {}});
        await router.start();

        router.to(r => r("users"));
        await waitForNavigation();

        router.confirmation.toggle("save", true, saveSpy);
        router.to(r => r("posts"));
        await waitForNavigation();

        await router.confirmation.commit(true);

        expect(saveSpy.called).toBe(true);
        expect(router.is(x => x("posts"))).toBe(true);

        router.confirmation.toggle("save", false);
    });

    test("cancel annule la navigation en attente", async () => {
        const router = makeRouter({users: {}, posts: {}});
        await router.start();

        router.to(r => r("users"));
        await waitForNavigation();

        router.confirmation.toggle("guard", true);
        router.to(r => r("posts"));
        await waitForNavigation();

        expect(router.confirmation.pending).toBe(true);

        router.confirmation.cancel();
        await waitForNavigation();

        expect(router.confirmation.pending).toBe(false);
        expect(router.is(x => x("users"))).toBe(true);

        router.confirmation.toggle("guard", false);
    });

    test("block empêche la navigation sur une route ciblée", async () => {
        const router = makeRouter({users: {}, posts: {}}, b => {
            b.block(
                x => x("posts"),
                () => true
            );
        });
        await router.start();

        router.to(r => r("users"));
        await waitForNavigation();

        router.to(r => r("posts"));
        await waitForNavigation();

        expect(router.is(x => x("users"))).toBe(true);
        expect(router.is(x => x("posts"))).toBe(false);
    });

    test("redirect redirige vers une route de fallback", async () => {
        const router = makeRouter({users: {}, posts: {}}, b => {
            b.redirect(
                x => x("posts"),
                () => true,
                x => x("users")
            );
        });
        await router.start();

        router.to(r => r("posts"));
        await waitForNavigation();

        expect(router.is(x => x("users"))).toBe(true);
        expect(router.is(x => x("posts"))).toBe(false);
    });

    test("sub-router expose les helpers par défaut", async () => {
        const router = makeRouter({
            users: param("userId", b => b.string(), {
                posts: param("postId", b => b.number())
            })
        });
        await router.start();

        router.to(r => r("users")("abc")("posts")(12));
        await waitForNavigation();

        const subRouter = router.sub(x => x("users")("userId")("posts")("postId"));

        expect(subRouter.get()).toBeUndefined();
        expect(subRouter.href()).toBe("#/users/:userId/posts/:postId");

        subRouter.start();
    });

    test("constraint sub+redirect conserve les paramètres courants", async () => {
        const router = makeRouter(
            {
                users: param("userId", b => b.string(), {
                    posts: {}
                })
            },
            b => {
                b.sub(x => x("users")("userId")).redirect(
                    x => x("posts"),
                    () => true,
                    x => x("posts")
                );
            }
        );
        await router.start();

        router.to(r => r("users")("42")("posts"));
        await waitForNavigation();

        expect(window.location.hash.startsWith("#/")).toBe(true);
    });

    test("ignore une navigation avec query param inconnu", async () => {
        const router = makeRouter({users: {}}, undefined, {page: "number"});
        await router.start();

        router.to(r => r("users"));
        await waitForNavigation();

        window.location.hash = "#/users?unknown=1";
        await waitForNavigation();

        expect(router.is(x => x("users"))).toBe(true);
        expect(router.query.page).toBeUndefined();
    });

    test("refuse une navigation avec paramètre number invalide", async () => {
        const router = makeRouter({users: param("id", b => b.number())});
        await router.start();

        router.to(r => r("users")(123));
        await waitForNavigation();

        window.location.hash = "#/users/not-a-number";
        await waitForNavigation();

        expect(window.location.hash).not.toBe("#/users/not-a-number");
    });

    test("génère la racine quand aucun segment n'est fourni", () => {
        const router = makeRouter({users: {}});

        expect(router.href(() => undefined)).toBe("#/");
    });

    test("remplace une navigation et nettoie une query", async () => {
        const router = makeRouter({users: {}, posts: {}}, undefined, {page: "number"});
        await router.start();

        router.to(r => r("users"), false, {page: 2});
        await waitForNavigation();
        router.query.page = undefined;
        await waitForNavigation();
        router.to(r => r("posts"), true);
        await waitForNavigation();

        expect(window.location.hash).toBe("#/posts");
        expect(router.query.page).toBeUndefined();
    });

    test("ignore les valeurs NaN des paramètres et des queries", async () => {
        const router = makeRouter({users: param("id", b => b.number())}, undefined, {page: "number"});
        await router.start();

        router.to(r => r("users")(1));
        await waitForNavigation();
        router.state.users.id = Number.NaN;
        router.query.page = Number.NaN;

        expect(window.location.hash).not.toContain("NaN");
        expect(router.query.page).toBeUndefined();
    });

    test("refuse de modifier un paramètre qui n'est pas dans la route active", async () => {
        const router = makeRouter({users: param("id", b => b.string()), posts: {}});
        await router.start();

        router.to(r => r("posts"));
        await waitForNavigation();
        router.state.users.id = "ignored";

        expect(router.state.users.id).toBeUndefined();
    });

    test("execute plusieurs callbacks save lors du commit", async () => {
        const callbacks = [vi.fn(async () => undefined), vi.fn(async () => undefined)];
        const router = makeRouter({users: {}, posts: {}});
        await router.start();

        router.confirmation.toggle("first", true, callbacks[0]);
        router.confirmation.toggle("second", true, callbacks[1]);
        router.to(r => r("posts"));
        await waitForNavigation();
        await router.confirmation.commit(true);

        expect(callbacks[0]).toHaveBeenCalledOnce();
        expect(callbacks[1]).toHaveBeenCalledOnce();
    });
});
