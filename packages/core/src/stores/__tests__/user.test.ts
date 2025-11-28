import { describe, expect, test } from "vitest";

import { UserStore } from "../user";

describe("UserStore", () => {
  describe("Initialisation", () => {
    test("Les rôles sont initialisés à un tableau vide", () => {
      const store = new UserStore();
      expect(store.roles).toEqual([]);
    });

    test("Les rôles peuvent être assignés", () => {
      const store = new UserStore();
      store.roles = ["admin", "user"];
      expect(store.roles).toEqual(["admin", "user"]);
    });
  });

  describe("hasRole", () => {
    test("Retourne true si l'utilisateur possède le rôle demandé", () => {
      const store = new UserStore();
      store.roles = ["admin"];
      expect(store.hasRole("admin")).toBe(true);
    });

    test("Retourne false si l'utilisateur ne possède pas le rôle demandé", () => {
      const store = new UserStore();
      store.roles = ["user"];
      expect(store.hasRole("admin")).toBe(false);
    });

    test("Retourne true si l'utilisateur possède au moins un des rôles demandés", () => {
      const store = new UserStore();
      store.roles = ["user", "editor"];
      expect(store.hasRole("admin", "user")).toBe(true);
    });

    test("Retourne false si l'utilisateur ne possède aucun des rôles demandés", () => {
      const store = new UserStore();
      store.roles = ["user"];
      expect(store.hasRole("admin", "editor")).toBe(false);
    });

    test("Retourne true si l'utilisateur possède tous les rôles demandés", () => {
      const store = new UserStore();
      store.roles = ["admin", "user", "editor"];
      expect(store.hasRole("admin", "user")).toBe(true);
    });

    test("Retourne false si l'utilisateur n'a aucun rôle", () => {
      const store = new UserStore();
      store.roles = [];
      expect(store.hasRole("admin")).toBe(false);
    });

    test("Retourne false si aucun rôle n'est fourni", () => {
      const store = new UserStore();
      store.roles = ["admin"];
      expect(store.hasRole()).toBe(false);
    });

    test("Fonctionne avec des rôles typés", () => {
      type Role = "admin" | "user" | "editor";
      const store = new UserStore<Role>();
      store.roles = ["admin", "user"];
      expect(store.hasRole("admin")).toBe(true);
      expect(store.hasRole("editor")).toBe(false);
      expect(store.hasRole("admin", "editor")).toBe(true);
    });
  });
});
