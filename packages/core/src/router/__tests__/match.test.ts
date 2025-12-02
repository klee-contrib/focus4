import {describe, expect, test} from "vitest";

import {match} from "../match";

describe("match", () => {
    test("match une route simple", () => {
        const result = match({pattern: "/users", path: "/users"});
        expect(result).toEqual({remainingPath: "", params: {}});
    });

    test("retourne null si la route ne correspond pas", () => {
        const result = match({pattern: "/users", path: "/posts"});
        expect(result).toBeNull();
    });

    test("match un paramètre", () => {
        const result = match({pattern: "/users/:id", path: "/users/123"});
        expect(result).toEqual({remainingPath: "", params: {id: "123"}});
    });

    test("match plusieurs paramètres", () => {
        const result = match({pattern: "/users/:userId/posts/:postId", path: "/users/123/posts/456"});
        expect(result).toEqual({remainingPath: "", params: {userId: "123", postId: "456"}});
    });

    test("match une route optionnelle", () => {
        const result = match({pattern: "/users(/:id)", path: "/users"});
        expect(result).toEqual({remainingPath: "", params: {}});
    });

    test("match une route optionnelle avec paramètre", () => {
        const result = match({pattern: "/users(/:id)", path: "/users/123"});
        expect(result).toEqual({remainingPath: "", params: {id: "123"}});
    });

    test("match un wildcard", () => {
        const result = match({pattern: "/users/*", path: "/users/123/posts"});
        expect(result).toEqual({remainingPath: "", params: {splat: "123/posts"}});
    });

    test("match un wildcard greedy", () => {
        const result = match({pattern: "/users/**", path: "/users/123/posts/456"});
        expect(result).toEqual({remainingPath: "", params: {splat: "123/posts/456"}});
    });

    test("gère les chemins restants", () => {
        const result = match({pattern: "/users", path: "/users/posts"});
        expect(result).toEqual({remainingPath: "/posts", params: {}});
    });

    test("décode les paramètres encodés", () => {
        const result = match({pattern: "/users/:name", path: "/users/john%20doe"});
        expect(result).toEqual({remainingPath: "", params: {name: "john doe"}});
    });

    test("gère les routes sans slash initial", () => {
        const result = match({pattern: "users", path: "/users"});
        expect(result).toEqual({remainingPath: "", params: {}});
    });
});
