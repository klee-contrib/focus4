import {describe, expect, test} from "vitest";

import {UserStore} from "../user";

describe("UserStore", () => {
    test("Les rôles sont initialisés à un tableau vide", () => {
        const store = new UserStore();
        expect(store.roles).toEqual([]);
    });

    test("Les rôles peuvent être réassignés", () => {
        const store = new UserStore();
        store.roles = ["admin", "user"];
        expect(store.roles).toEqual(["admin", "user"]);
    });

    test.each([
        {label: "possède le rôle demandé", roles: ["admin"], query: ["admin"], expected: true},
        {label: "ne possède pas le rôle demandé", roles: ["user"], query: ["admin"], expected: false},
        {
            label: "possède au moins un des rôles demandés",
            roles: ["user", "editor"],
            query: ["admin", "user"],
            expected: true
        },
        {label: "ne possède aucun des rôles demandés", roles: ["user"], query: ["admin", "editor"], expected: false},
        {
            label: "possède tous les rôles demandés",
            roles: ["admin", "user", "editor"],
            query: ["admin", "user"],
            expected: true
        },
        {label: "n'a aucun rôle", roles: [], query: ["admin"], expected: false},
        {label: "hasRole() sans argument", roles: ["admin"], query: [], expected: false}
    ])("hasRole retourne $expected quand l'utilisateur $label", ({roles, query, expected}) => {
        const store = new UserStore();
        store.roles = roles;
        expect(store.hasRole(...query)).toBe(expected);
    });

    test("Fonctionne avec un type de rôle générique", () => {
        type Role = "admin" | "user" | "editor";
        const store = new UserStore<Role>();
        store.roles = ["admin", "user"];
        expect(store.hasRole("admin")).toBe(true);
        expect(store.hasRole("editor")).toBe(false);
        expect(store.hasRole("admin", "editor")).toBe(true);
    });
});
