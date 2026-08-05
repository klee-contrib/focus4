import {describe, expect, test, vi} from "vitest";

import {MessageStore} from "../message";

describe("MessageStore", () => {
    describe("Ajout de messages", () => {
        test("Store initialisé avec les types par défaut", () => {
            const store = new MessageStore();
            expect(store.messageTypes).toEqual(["success", "error", "info", "warning"]);
        });

        test("addMessage(type, string) enregistre un Message dont le label vaut la chaîne", () => {
            const store = new MessageStore();
            store.addMessage("info", "Message de test");
            expect(store.getLatestMessage("info")).toEqual({label: "Message de test"});
        });

        test("addMessage(type, Message) préserve le label et l'action", () => {
            const store = new MessageStore();
            const onClick = vi.fn();
            store.addMessage("success", {label: "Message avec action", action: {label: "Action", onClick}});
            const message = store.getLatestMessage("success");
            expect(message?.label).toBe("Message avec action");
            expect(message?.action?.label).toBe("Action");
            expect(typeof message?.action?.onClick).toBe("function");
        });

        test("Plusieurs messages du même type sont conservés dans l'ordre", () => {
            const store = new MessageStore();
            store.addMessage("error", "Erreur 1");
            store.addMessage("error", "Erreur 2");
            expect(store.getLatestMessage("error")?.label).toBe("Erreur 2");
        });

        test.each([
            {method: "addWarningMessage", type: "warning", label: "Attention !"},
            {method: "addInformationMessage", type: "info", label: "Information"},
            {method: "addErrorMessage", type: "error", label: "Erreur critique"},
            {method: "addSuccessMessage", type: "success", label: "Opération réussie"}
        ] as const)("$method(string) délègue à addMessage avec le type '$type'", ({method, type, label}) => {
            const store = new MessageStore();
            store[method](label);
            expect(store.getLatestMessage(type)?.label).toBe(label);
        });

        test.each([
            {method: "addWarningMessage", type: "warning"},
            {method: "addInformationMessage", type: "info"},
            {method: "addErrorMessage", type: "error"},
            {method: "addSuccessMessage", type: "success"}
        ] as const)("$method(Message) préserve l'objet Message", ({method, type}) => {
            const store = new MessageStore();
            const messageObj = {label: "Msg", action: {label: "OK", onClick: vi.fn()}};
            store[method](messageObj);
            const message = store.getLatestMessage(type);
            expect(message?.label).toBe(messageObj.label);
            expect(message?.action?.label).toBe(messageObj.action.label);
            expect(typeof message?.action?.onClick).toBe("function");
        });
    });

    describe("Ajout par lot (addMessages)", () => {
        test("Répartit les messages sur les bons types", () => {
            const store = new MessageStore();
            const result = store.addMessages({error: "Erreur 1", success: "Succès 1"});
            expect(store.getLatestMessage("error")?.label).toBe("Erreur 1");
            expect(store.getLatestMessage("success")?.label).toBe("Succès 1");
            expect(result).toHaveLength(2);
        });

        test("Un tableau de valeurs déclenche un ajout par élément", () => {
            const store = new MessageStore();
            const result = store.addMessages({error: ["Erreur 1", "Erreur 2"], info: ["Info 1"]});
            expect(store.getLatestMessage("error")?.label).toBe("Erreur 2");
            expect(store.getLatestMessage("info")?.label).toBe("Info 1");
            expect(result).toHaveLength(3);
        });

        test.each<{input: Record<string, string | string[]>; type: string; label: string}>([
            {input: {errors: ["E1", "E2"], warnings: "W"}, type: "error", label: "E2"},
            {input: {errors: ["E1", "E2"], warnings: "W"}, type: "warning", label: "W"},
            {input: {globalError: "GE", globalSuccess: "GS"}, type: "error", label: "GE"},
            {input: {globalError: "GE", globalSuccess: "GS"}, type: "success", label: "GS"},
            {input: {globalErrors: ["GE1", "GE2"], globalWarnings: "GW"}, type: "error", label: "GE2"},
            {input: {globalErrors: ["GE1", "GE2"], globalWarnings: "GW"}, type: "warning", label: "GW"}
        ])("Reconnaît le type '$type' via ses variantes (pluriel / global)", ({input, type, label}) => {
            const store = new MessageStore();
            store.addMessages(input);
            expect(store.getLatestMessage(type)?.label).toBe(label);
        });

        test("Ignore les types absents de messageTypes", () => {
            const store = new MessageStore();
            const result = store.addMessages({error: "Erreur", unknownType: "Ignoré"});
            expect(store.getLatestMessage("error")?.label).toBe("Erreur");
            expect(store.getLatestMessage("unknownType")).toBeUndefined();
            expect(result).toHaveLength(1);
        });

        test("Retourne tous les couples (type, message) ajoutés", () => {
            const store = new MessageStore();
            const result = store.addMessages({
                error: ["Erreur 1", "Erreur 2"],
                success: "Succès",
                info: ["Info 1", "Info 2", "Info 3"]
            });
            expect(result).toHaveLength(6);
            expect(result.filter(m => m.type === "error")).toHaveLength(2);
            expect(result.filter(m => m.type === "success")).toHaveLength(1);
            expect(result.filter(m => m.type === "info")).toHaveLength(3);
        });

        test("Retourne un tableau vide sans messages", () => {
            const store = new MessageStore();
            expect(store.addMessages({})).toEqual([]);
        });

        test("Respecte un messageTypes personnalisé", () => {
            const store = new MessageStore();
            store.messageTypes = ["warning"];
            const result = store.addMessages({
                warning: "Avertissement",
                error: "Erreur ignorée",
                globalWarnings: ["Avertissement global"]
            });
            expect(result).toEqual([
                {type: "warning", message: "Avertissement"},
                {type: "warning", message: "Avertissement global"}
            ]);
            expect(store.getLatestMessage("error")).toBeUndefined();
        });
    });

    describe("Listeners", () => {
        test("addMessageListener notifie l'auditeur lors de l'ajout d'un message", () => {
            const store = new MessageStore();
            const listener = vi.fn();
            store.addMessageListener(["error"], listener);
            store.addMessage("error", "Test");
            expect(listener).toHaveBeenCalledWith("error", {label: "Test"});
        });

        test("Un même auditeur peut écouter plusieurs types", () => {
            const store = new MessageStore();
            const listener = vi.fn();
            store.addMessageListener(["error", "success"], listener);
            store.addMessage("error", "Erreur");
            store.addMessage("success", "Succès");
            expect(listener).toHaveBeenCalledTimes(2);
        });

        test("La fonction retournée désabonne l'auditeur", () => {
            const store = new MessageStore();
            const listener = vi.fn();
            const unsubscribe = store.addMessageListener(["error"], listener);
            store.addMessage("error", "Test 1");
            unsubscribe();
            store.addMessage("error", "Test 2");
            expect(listener).toHaveBeenCalledTimes(1);
        });

        test("Plusieurs auditeurs peuvent être enregistrés sur le même type", () => {
            const store = new MessageStore();
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            store.addMessageListener(["error"], listener1);
            store.addMessageListener(["error"], listener2);
            store.addMessage("error", "Test");
            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });

        test("Le désabonnement ne touche que l'auditeur ciblé", () => {
            const store = new MessageStore();
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            const unsubscribe1 = store.addMessageListener(["error"], listener1);
            store.addMessageListener(["error"], listener2);
            unsubscribe1();
            store.addMessage("error", "Test");
            expect(listener1).not.toHaveBeenCalled();
            expect(listener2).toHaveBeenCalledTimes(1);
        });

        test("Le désabonnement tolère un type sans auditeur", () => {
            const store = new MessageStore();
            const listener = vi.fn();
            const unsubscribe = store.addMessageListener(["error", "warning"], listener);
            unsubscribe();
            store.addMessage("warning", "x");
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe("Nettoyage et lecture", () => {
        test("clearMessages() sans argument efface tous les types", () => {
            const store = new MessageStore();
            store.addMessage("error", "Erreur");
            store.addMessage("info", "Info");
            store.clearMessages();
            expect(store.getLatestMessage("error")).toBeUndefined();
            expect(store.getLatestMessage("info")).toBeUndefined();
        });

        test("clearMessages(type) n'efface que le type ciblé", () => {
            const store = new MessageStore();
            store.addMessage("error", "Erreur");
            store.addMessage("info", "Info");
            store.clearMessages("error");
            expect(store.getLatestMessage("error")).toBeUndefined();
            expect(store.getLatestMessage("info")?.label).toBe("Info");
        });

        test("getLatestMessage retourne undefined si le type n'existe pas", () => {
            const store = new MessageStore();
            expect(store.getLatestMessage("error")).toBeUndefined();
        });

        test("getLatestMessage retourne le dernier ajout pour un type", () => {
            const store = new MessageStore();
            store.addMessage("info", "Premier");
            store.addMessage("info", "Deuxième");
            store.addMessage("info", "Troisième");
            expect(store.getLatestMessage("info")?.label).toBe("Troisième");
        });

        test("getLatestMessage isole les types entre eux", () => {
            const store = new MessageStore();
            store.addMessage("error", "Erreur");
            store.addMessage("success", "Succès");
            store.addMessage("error", "Nouvelle erreur");
            expect(store.getLatestMessage("error")?.label).toBe("Nouvelle erreur");
        });
    });
});
