import {describe, expect, test} from "vitest";

import {makeReferenceStore} from "../store";

describe("makeReferenceStore", () => {
    const referenceLoader = (referenceName: string) => {
        switch (referenceName) {
            case "status":
                return Promise.resolve([
                    {code: "A", label: "Alpha"},
                    {code: "B", label: "Beta"}
                ]);
            default:
                return Promise.resolve([]);
        }
    };

    test("Crée un store avec la structure attendue", () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        expect(referenceStore).toBeDefined();
        expect(referenceStore.status).toBeDefined();
        expect(referenceStore.get).toBeDefined();
        expect(referenceStore.reload).toBeDefined();
        expect(referenceStore.track).toBeDefined();
        expect(referenceStore.isLoading).toBeFalsy();
    });

    test("Charge les données lors de l'accès à une référence", async () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        // Accès à la référence déclenche le chargement
        const statusList = referenceStore.status;
        expect(statusList).toBeDefined();
        expect(Array.isArray(statusList)).toBe(true);

        // Attendre que les données soient chargées
        await new Promise(resolve => {
            setTimeout(resolve, 10);
        });

        expect(statusList.length).toBe(2);
        expect(statusList).toContainEqual({code: "A", label: "Alpha"});
        expect(statusList).toContainEqual({code: "B", label: "Beta"});
    });

    test("La méthode get() attend le chargement des données", async () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        const statusList = await referenceStore.get("status");

        expect(statusList.length).toBe(2);
        expect(statusList).toContainEqual({code: "A", label: "Alpha"});
        expect(statusList).toContainEqual({code: "B", label: "Beta"});
    });

    test("Les listes de référence ont les propriétés $valueKey et $labelKey", async () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        await referenceStore.get("status");
        const statusList = referenceStore.status;

        expect(statusList.$valueKey).toBe("code");
        expect(statusList.$labelKey).toBe("label");
    });

    test("getLabel() fonctionne sur une liste de référence", async () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        await referenceStore.get("status");
        const statusList = referenceStore.status;

        expect(statusList.getLabel("A")).toBe("Alpha");
        expect(statusList.getLabel("B")).toBe("Beta");
        expect(statusList.getLabel("C")).toBeUndefined();
    });

    test("reload() vide le cache et recharge les données", async () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        await referenceStore.get("status");
        expect(referenceStore.status.length).toBe(2);

        // Recharger
        await referenceStore.reload("status");

        // Le cache est vidé, donc un nouvel accès devrait recharger
        await referenceStore.get("status");
        expect(referenceStore.status.length).toBe(2);
    });

    test("reload() sans paramètre recharge toutes les références", async () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        await referenceStore.get("status");
        await referenceStore.reload();

        await referenceStore.get("status");
        expect(referenceStore.status.length).toBe(2);
    });

    test("track() ajoute des IDs de suivi", () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        const untrack = referenceStore.track("tracking-id-1", "status");

        expect(untrack).toBeDefined();
        expect(typeof untrack).toBe("function");

        // Appeler untrack pour nettoyer
        untrack();
    });

    test("track() sans refNames suit toutes les références", () => {
        const referenceStore = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            }
        });

        const untrack = referenceStore.track("tracking-id-1");

        expect(untrack).toBeDefined();
        untrack();
    });

    test("Fonctionne avec plusieurs références", async () => {
        const multiLoader = (referenceName: string) => {
            switch (referenceName) {
                case "status":
                    return Promise.resolve([
                        {code: "A", label: "Alpha"},
                        {code: "B", label: "Beta"}
                    ]);
                case "priority":
                    return Promise.resolve([
                        {id: 1, name: "High"},
                        {id: 2, name: "Low"}
                    ]);
                default:
                    return Promise.resolve([]);
            }
        };

        const referenceStore = makeReferenceStore(multiLoader, {
            status: {
                valueKey: "code",
                labelKey: "label",
                type: "string"
            },
            priority: {
                valueKey: "id",
                labelKey: "name",
                type: "number"
            }
        });

        await referenceStore.get("status");
        await referenceStore.get("priority");

        expect(referenceStore.status.length).toBe(2);
        expect(referenceStore.priority.length).toBe(2);
        expect(referenceStore.status.getLabel("A")).toBe("Alpha");
        expect(referenceStore.priority.getLabel(1)).toBe("High");
    });
});
