import {afterEach, beforeEach, describe, expect, test} from "vitest";

import {makeRouter, param} from "../index";

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
        await new Promise(resolve => setTimeout(resolve, 10));

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
});
