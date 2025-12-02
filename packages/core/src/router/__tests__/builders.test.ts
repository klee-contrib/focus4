import {describe, expect, test} from "vitest";

import {buildEndpoints, buildParamsMap} from "../builders";
import {param} from "../param";

describe("buildEndpoints", () => {
    test("construit les endpoints pour une config simple", () => {
        const config = {users: {}, posts: {}};
        const endpoints = buildEndpoints(config);
        expect(endpoints).toContain("/");
        expect(endpoints).toContain("/users");
        expect(endpoints).toContain("/posts");
    });

    test("construit les endpoints avec paramètres optionnels", () => {
        const config = {users: param("id", b => b.string(false), {})};
        const endpoints = buildEndpoints(config);
        expect(endpoints).toContain("/users");
        expect(endpoints).toContain("/users/:id");
    });

    test("construit les endpoints avec paramètres requis", () => {
        const config = {users: param("id", b => b.string(true), {})};
        const endpoints = buildEndpoints(config);
        expect(endpoints).not.toContain("/users");
        expect(endpoints).toContain("/users/:id");
    });

    test("construit les endpoints avec routes imbriquées", () => {
        const config = {
            users: param("id", b => b.string(), {
                posts: {}
            })
        };
        const endpoints = buildEndpoints(config);
        expect(endpoints).toContain("/users/:id");
        expect(endpoints).toContain("/users/:id/posts");
    });
});

describe("buildParamsMap", () => {
    test("construit une map pour un paramètre string", () => {
        const config = param("id", b => b.string());
        const object = {id: undefined} as any;
        const map = buildParamsMap(config, object);

        map.id("test");
        expect(object.id).toBe("test");
    });

    test("construit une map pour un paramètre number", () => {
        const config = param("id", b => b.number());
        const object = {id: undefined} as any;
        const map = buildParamsMap(config, object);

        map.id("123");
        expect(object.id).toBe(123);
    });

    test("gère les valeurs undefined", () => {
        const config = param("id", b => b.string());
        const object = {id: "test"};
        const map = buildParamsMap(config, object);

        map.id(undefined);
        expect(object.id).toBeUndefined();
    });

    test("gère les paramètres imbriqués", () => {
        const config = {
            users: param(
                "userId",
                b => b.string(),
                param("postId", b => b.number())
            )
        };
        const object = {users: {userId: undefined, postId: undefined}} as any;
        const map = buildParamsMap(config, object);

        map.userId("123");
        map.postId("456");
        expect(object.users.userId).toBe("123");
        expect(object.users.postId).toBe(456);
    });
});
