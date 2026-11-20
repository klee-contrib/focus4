import {describe, expect, test, vi} from "vitest";

import {makeReferenceStore} from "../store";

const referenceLoader = (referenceName: string) => {
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

function getStore() {
    return makeReferenceStore(referenceLoader, {
        status: {
            valueKey: "code" as const,
            labelKey: "label" as const,
            type: {} as {code: string; label: string}
        },
        status2: {
            valueKey: "code2" as const,
            labelKey: "label2" as const,
            list: [
                {code2: "C", label2: "Gamma"},
                {code2: "D", label2: "Delta"}
            ]
        },
        priority: {
            valueKey: "id" as const,
            labelKey: "name" as const,
            type: {} as {id: number; name: string}
        }
    });
}

describe("makeReferenceStore", () => {
    test("Crée un store avec la structure attendue", () => {
        const referenceStore = getStore();

        expect([...referenceStore.status]).toEqual([]);
        expect(referenceStore.get).toEqual(expect.any(Function));
        expect(referenceStore.reload).toEqual(expect.any(Function));
        expect(referenceStore.track).toEqual(expect.any(Function));
        expect(referenceStore.isLoading).toBe(false);
    });

    test("Charge les données lors de l'accès à une référence", async () => {
        const referenceStore = getStore();

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
        const referenceStore = getStore();

        await referenceStore.get("status");

        expect(referenceStore.status.length).toBe(2);
        expect(referenceStore.status).toContainEqual({code: "A", label: "Alpha"});
        expect(referenceStore.status).toContainEqual({code: "B", label: "Beta"});

        expect(referenceStore.status2.length).toBe(2);
        expect(referenceStore.status2).toContainEqual({code2: "C", label2: "Gamma"});
        expect(referenceStore.status2).toContainEqual({code2: "D", label2: "Delta"});
    });

    test("Les listes de référence ont les propriétés $valueKey et $labelKey", async () => {
        const referenceStore = getStore();

        expect(referenceStore.status.$valueKey).toBe("code");
        expect(referenceStore.status.$labelKey).toBe("label");

        expect(referenceStore.status2.$valueKey).toBe("code2");
        expect(referenceStore.status2.$labelKey).toBe("label2");
    });

    test("getLabel() fonctionne sur une liste de référence", async () => {
        const referenceStore = getStore();

        await referenceStore.get("status");

        expect(referenceStore.status.getLabel("A")).toBe("Alpha");
        expect(referenceStore.status.getLabel("B")).toBe("Beta");
        expect(referenceStore.status.getLabel("C")).toBeUndefined();

        expect(referenceStore.status2.getLabel("C")).toBe("Gamma");
        expect(referenceStore.status2.getLabel("D")).toBe("Delta");
        expect(referenceStore.status2.getLabel("E")).toBeUndefined();
    });

    test.each([
        {argument: "status" as const, expectedCalls: [["status"]], withClearer: true},
        {argument: "status" as const, expectedCalls: [], withClearer: false},
        {argument: undefined, expectedCalls: [[]], withClearer: true},
        {argument: undefined, expectedCalls: [], withClearer: false}
    ])(
        "reload($argument, clearer=$withClearer) vide et recharge le cache",
        async ({argument, expectedCalls, withClearer}) => {
            const clearer = vi.fn().mockResolvedValue(undefined);
            const store = makeReferenceStore(
                referenceLoader,
                {
                    status: {
                        valueKey: "code" as const,
                        labelKey: "label" as const,
                        type: {} as {code: string; label: string}
                    },
                    status2: {
                        valueKey: "code2" as const,
                        labelKey: "label2" as const,
                        list: [{code2: "C", label2: "Gamma"}]
                    }
                },
                withClearer ? clearer : undefined
            );

            await store.get("status");
            await store.reload(argument);
            await store.get("status");

            expect(store.status).toHaveLength(2);
            expect(clearer.mock.calls).toEqual(expectedCalls);
        }
    );

    test("track() ajoute des IDs de suivi", () => {
        const referenceStore = getStore();

        const untrack = referenceStore.track("tracking-id-1", "status");

        expect(untrack).toEqual(expect.any(Function));
        untrack();
    });

    test("track() sans refNames suit toutes les références", () => {
        const referenceStore = getStore();

        const untrack = referenceStore.track("tracking-id-1");

        expect(untrack).toEqual(expect.any(Function));
        untrack();
    });

    test("Fonctionne avec plusieurs références", async () => {
        const referenceStore = getStore();

        await referenceStore.get("status");
        await referenceStore.get("priority");

        expect(referenceStore.status.length).toBe(2);
        expect(referenceStore.priority.length).toBe(2);
        expect(referenceStore.status.getLabel("A")).toBe("Alpha");
        expect(referenceStore.priority.getLabel(1)).toBe("High");
    });

    test("valueKey et labelKey utilisent les valeurs par défaut", () => {
        const store = makeReferenceStore(referenceLoader, {
            status: {
                valueKey: "code" as const,
                labelKey: "label" as const,
                type: {} as {code: string; label: string}
            }
        });
        expect((store.status as any).$valueKey).toBe("code");
        expect((store.status as any).$labelKey).toBe("label");
    });

    test("filter() filtre les entrées de la liste et conserve les métadonnées", async () => {
        const store = getStore();
        await store.get("status");
        const filtered = store.status.filter((entry: any) => entry.code === "A");
        expect(filtered).toHaveLength(1);
        expect(filtered.$valueKey).toBe("code");
        expect(filtered.$labelKey).toBe("label");
    });
});
