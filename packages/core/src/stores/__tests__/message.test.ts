import { describe, expect, test, vi } from "vitest";

import { MessageStore } from "../message";

describe("MessageStore", () => {
  describe("Initialisation", () => {
    test("Les types de messages par défaut sont corrects", () => {
      const store = new MessageStore();
      expect(store.messageTypes).toEqual([
        "success",
        "error",
        "info",
        "warning",
      ]);
    });
  });

  describe("addMessage", () => {
    test("Ajoute un message avec une chaîne de caractères", () => {
      const store = new MessageStore();
      store.addMessage("info", "Message de test");
      const message = store.getLatestMessage("info");
      expect(message).toEqual({ label: "Message de test" });
    });

    test("Ajoute un message avec un objet Message", () => {
      const store = new MessageStore();
      const messageObj = {
        label: "Message avec action",
        action: {
          label: "Action",
          onClick: () => {},
        },
      };
      store.addMessage("success", messageObj);
      const message = store.getLatestMessage("success");
      expect(message?.label).toBe(messageObj.label);
      expect(message?.action?.label).toBe(messageObj.action.label);
      expect(typeof message?.action?.onClick).toBe("function");
    });

    test("Ajoute plusieurs messages du même type", () => {
      const store = new MessageStore();
      store.addMessage("error", "Erreur 1");
      store.addMessage("error", "Erreur 2");
      const message = store.getLatestMessage("error");
      expect(message?.label).toBe("Erreur 2");
    });
  });

  describe("addWarningMessage", () => {
    test("Ajoute un message d'avertissement avec une chaîne", () => {
      const store = new MessageStore();
      store.addWarningMessage("Attention !");
      const message = store.getLatestMessage("warning");
      expect(message?.label).toBe("Attention !");
    });

    test("Ajoute un message d'avertissement avec un objet Message", () => {
      const store = new MessageStore();
      const messageObj = {
        label: "Avertissement",
        action: {
          label: "OK",
          onClick: () => {},
        },
      };
      store.addWarningMessage(messageObj);
      const message = store.getLatestMessage("warning");
      expect(message?.label).toBe(messageObj.label);
      expect(message?.action?.label).toBe(messageObj.action.label);
      expect(typeof message?.action?.onClick).toBe("function");
    });
  });

  describe("addInformationMessage", () => {
    test("Ajoute un message d'information avec une chaîne", () => {
      const store = new MessageStore();
      store.addInformationMessage("Information");
      const message = store.getLatestMessage("info");
      expect(message?.label).toBe("Information");
    });

    test("Ajoute un message d'information avec un objet Message", () => {
      const store = new MessageStore();
      const messageObj = { label: "Info" };
      store.addInformationMessage(messageObj);
      const message = store.getLatestMessage("info");
      expect(message).toEqual(messageObj);
    });
  });

  describe("addErrorMessage", () => {
    test("Ajoute un message d'erreur avec une chaîne", () => {
      const store = new MessageStore();
      store.addErrorMessage("Erreur critique");
      const message = store.getLatestMessage("error");
      expect(message?.label).toBe("Erreur critique");
    });

    test("Ajoute un message d'erreur avec un objet Message", () => {
      const store = new MessageStore();
      const messageObj = { label: "Erreur" };
      store.addErrorMessage(messageObj);
      const message = store.getLatestMessage("error");
      expect(message).toEqual(messageObj);
    });
  });

  describe("addSuccessMessage", () => {
    test("Ajoute un message de succès avec une chaîne", () => {
      const store = new MessageStore();
      store.addSuccessMessage("Opération réussie");
      const message = store.getLatestMessage("success");
      expect(message?.label).toBe("Opération réussie");
    });

    test("Ajoute un message de succès avec un objet Message", () => {
      const store = new MessageStore();
      const messageObj = { label: "Succès" };
      store.addSuccessMessage(messageObj);
      const message = store.getLatestMessage("success");
      expect(message).toEqual(messageObj);
    });
  });

  describe("addMessages", () => {
    test("Ajoute des messages avec des types simples", () => {
      const store = new MessageStore();
      const result = store.addMessages({
        error: "Erreur 1",
        success: "Succès 1",
      });
      expect(store.getLatestMessage("error")?.label).toBe("Erreur 1");
      expect(store.getLatestMessage("success")?.label).toBe("Succès 1");
      expect(result).toHaveLength(2);
    });

    test("Ajoute des messages avec des tableaux", () => {
      const store = new MessageStore();
      const result = store.addMessages({
        error: ["Erreur 1", "Erreur 2"],
        info: ["Info 1"],
      });
      expect(store.getLatestMessage("error")?.label).toBe("Erreur 2");
      expect(store.getLatestMessage("info")?.label).toBe("Info 1");
      expect(result).toHaveLength(3);
    });

    test("Gère les types au pluriel", () => {
      const store = new MessageStore();
      store.addMessages({
        errors: ["Erreur 1", "Erreur 2"],
        warnings: "Avertissement",
      });
      expect(store.getLatestMessage("error")?.label).toBe("Erreur 2");
      expect(store.getLatestMessage("warning")?.label).toBe("Avertissement");
    });

    test("Gère les types préfixés par 'global'", () => {
      const store = new MessageStore();
      store.addMessages({
        globalError: "Erreur globale",
        globalSuccess: "Succès global",
      });
      expect(store.getLatestMessage("error")?.label).toBe("Erreur globale");
      expect(store.getLatestMessage("success")?.label).toBe("Succès global");
    });

    test("Gère les types préfixés par 'global' et au pluriel", () => {
      const store = new MessageStore();
      store.addMessages({
        globalErrors: ["Erreur globale 1", "Erreur globale 2"],
        globalWarnings: "Avertissement global",
      });
      expect(store.getLatestMessage("error")?.label).toBe("Erreur globale 2");
      expect(store.getLatestMessage("warning")?.label).toBe(
        "Avertissement global"
      );
    });

    test("Ignore les types qui ne sont pas dans messageTypes", () => {
      const store = new MessageStore();
      const result = store.addMessages({
        error: "Erreur",
        unknownType: "Message ignoré",
      });
      expect(store.getLatestMessage("error")?.label).toBe("Erreur");
      expect(store.getLatestMessage("unknownType")).toBeUndefined();
      expect(result).toHaveLength(1);
    });

    test("Retourne tous les messages ajoutés", () => {
      const store = new MessageStore();
      const result = store.addMessages({
        error: ["Erreur 1", "Erreur 2"],
        success: "Succès",
        info: ["Info 1", "Info 2", "Info 3"],
      });
      expect(result).toHaveLength(6);
      expect(result.filter((m) => m.type === "error")).toHaveLength(2);
      expect(result.filter((m) => m.type === "success")).toHaveLength(1);
      expect(result.filter((m) => m.type === "info")).toHaveLength(3);
    });
  });

  describe("addMessageListener", () => {
    test("Enregistre un listener et le notifie lors de l'ajout d'un message", () => {
      const store = new MessageStore();
      const listener = vi.fn();
      store.addMessageListener(["error"], listener);
      store.addMessage("error", "Test");
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("error", { label: "Test" });
    });

    test("Enregistre un listener pour plusieurs types", () => {
      const store = new MessageStore();
      const listener = vi.fn();
      store.addMessageListener(["error", "success"], listener);
      store.addMessage("error", "Erreur");
      store.addMessage("success", "Succès");
      expect(listener).toHaveBeenCalledTimes(2);
    });

    test("Retourne une fonction de désabonnement", () => {
      const store = new MessageStore();
      const listener = vi.fn();
      const unsubscribe = store.addMessageListener(["error"], listener);
      store.addMessage("error", "Test 1");
      unsubscribe();
      store.addMessage("error", "Test 2");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test("Plusieurs listeners peuvent être enregistrés pour le même type", () => {
      const store = new MessageStore();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.addMessageListener(["error"], listener1);
      store.addMessageListener(["error"], listener2);
      store.addMessage("error", "Test");
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    test("Le désabonnement ne supprime que le listener spécifié", () => {
      const store = new MessageStore();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsubscribe1 = store.addMessageListener(["error"], listener1);
      store.addMessageListener(["error"], listener2);
      unsubscribe1();
      store.addMessage("error", "Test");
      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("getLatestMessage", () => {
    test("Retourne undefined si aucun message n'existe pour le type", () => {
      const store = new MessageStore();
      expect(store.getLatestMessage("error")).toBeUndefined();
    });

    test("Retourne le dernier message ajouté pour un type", () => {
      const store = new MessageStore();
      store.addMessage("info", "Premier message");
      store.addMessage("info", "Deuxième message");
      store.addMessage("info", "Troisième message");
      const message = store.getLatestMessage("info");
      expect(message?.label).toBe("Troisième message");
    });

    test("Retourne le dernier message même après ajout d'autres types", () => {
      const store = new MessageStore();
      store.addMessage("error", "Erreur");
      store.addMessage("success", "Succès");
      store.addMessage("error", "Nouvelle erreur");
      const message = store.getLatestMessage("error");
      expect(message?.label).toBe("Nouvelle erreur");
    });
  });
});
