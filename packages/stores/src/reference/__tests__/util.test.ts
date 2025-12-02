import {describe, expect, test} from "vitest";

import {emptyReferenceList, filter, getLabel, makeReferenceList} from "../util";

describe("makeReferenceList", () => {
    test("Crée une liste de référence avec les clés par défaut (code, label)", () => {
        const list = [
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"}
        ];
        const refList = makeReferenceList(list);

        expect(refList).toContainEqual({code: "A", label: "Alpha"});
        expect(refList).toContainEqual({code: "B", label: "Beta"});
        expect(refList.$valueKey).toBe("code");
        expect(refList.$labelKey).toBe("label");
        expect(refList.getLabel).toBeDefined();
        expect(refList.filter).toBeDefined();
    });

    test("Crée une liste de référence avec valueKey personnalisé", () => {
        const list = [
            {id: 1, label: "Un"},
            {id: 2, label: "Deux"}
        ];
        const refList = makeReferenceList(list, {valueKey: "id"});

        expect(refList.$valueKey).toBe("id");
        expect(refList.$labelKey).toBe("label");
    });

    test("Crée une liste de référence avec labelKey personnalisé", () => {
        const list = [
            {code: "A", name: "Alpha"},
            {code: "B", name: "Beta"}
        ];
        const refList = makeReferenceList(list, {labelKey: "name"});

        expect(refList.$valueKey).toBe("code");
        expect(refList.$labelKey).toBe("name");
    });

    test("Crée une liste de référence avec valueKey et labelKey personnalisés", () => {
        const list = [
            {id: 1, name: "Un"},
            {id: 2, name: "Deux"}
        ];
        const refList = makeReferenceList(list, {valueKey: "id", labelKey: "name"});

        expect(refList.$valueKey).toBe("id");
        expect(refList.$labelKey).toBe("name");
    });

    test("Crée une liste vide", () => {
        const refList = makeReferenceList([]);

        expect(refList).toHaveLength(0);
        expect(refList.$valueKey).toBe("code");
        expect(refList.$labelKey).toBe("label");
    });
});

describe("emptyReferenceList", () => {
    test("Crée une liste de référence vide", () => {
        const refList = emptyReferenceList();

        expect(refList).toHaveLength(0);
        expect(refList.$valueKey).toBe("code");
        expect(refList.$labelKey).toBe("label");
        expect(refList.getLabel).toBeDefined();
        expect(refList.filter).toBeDefined();
    });
});

describe("getLabel", () => {
    test("Retourne le libellé pour une valeur existante", () => {
        const list = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"}
        ]);

        expect(getLabel("A", list)).toBe("Alpha");
        expect(getLabel("B", list)).toBe("Beta");
    });

    test("Retourne undefined pour une valeur inexistante", () => {
        const list = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"}
        ]);

        expect(getLabel("C", list)).toBeUndefined();
    });

    test("Retourne undefined pour une valeur undefined", () => {
        const list = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"}
        ]);

        expect(getLabel(undefined, list)).toBeUndefined();
    });

    test("Fonctionne avec des clés personnalisées", () => {
        const list = makeReferenceList(
            [
                {id: 1, name: "Un"},
                {id: 2, name: "Deux"}
            ],
            {valueKey: "id", labelKey: "name"}
        );

        expect(getLabel(1, list)).toBe("Un");
        expect(getLabel(2, list)).toBe("Deux");
        expect(getLabel(3, list)).toBeUndefined();
    });

    test("Fonctionne avec des valeurs numériques", () => {
        const list = makeReferenceList([
            {code: 1, label: "Un"},
            {code: 2, label: "Deux"}
        ]);

        expect(getLabel(1, list)).toBe("Un");
        expect(getLabel(2, list)).toBe("Deux");
    });
});

describe("filter", () => {
    test("Filtre une liste de référence en conservant les propriétés", () => {
        const list = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"},
            {code: "C", label: "Charlie"}
        ]);

        const filtered = filter(list, item => item.code !== "B");

        expect(filtered).toContainEqual({code: "A", label: "Alpha"});
        expect(filtered).toContainEqual({code: "C", label: "Charlie"});
        expect(filtered).toHaveLength(2);
        expect(filtered.$valueKey).toBe("code");
        expect(filtered.$labelKey).toBe("label");
        expect(filtered.getLabel).toBeDefined();
        expect(filtered.filter).toBeDefined();
    });

    test("Filtre une liste vide", () => {
        const list = makeReferenceList([]);
        const filtered = filter(list, () => true);

        expect(filtered).toHaveLength(0);
        expect(filtered.$valueKey).toBe("code");
        expect(filtered.$labelKey).toBe("label");
    });

    test("Conserve les clés personnalisées après filtrage", () => {
        const list = makeReferenceList(
            [
                {id: 1, name: "Un"},
                {id: 2, name: "Deux"},
                {id: 3, name: "Trois"}
            ],
            {valueKey: "id", labelKey: "name"}
        );

        const filtered = filter(list, item => item.id > 1);

        expect(filtered).toContainEqual({id: 2, name: "Deux"});
        expect(filtered).toContainEqual({id: 3, name: "Trois"});
        expect(filtered).toHaveLength(2);
        expect(filtered.$valueKey).toBe("id");
        expect(filtered.$labelKey).toBe("name");
    });

    test("getLabel fonctionne sur une liste filtrée", () => {
        const list = makeReferenceList([
            {code: "A", label: "Alpha"},
            {code: "B", label: "Beta"},
            {code: "C", label: "Charlie"}
        ]);

        const filtered = filter(list, item => item.code !== "B");

        expect(getLabel("A", filtered)).toBe("Alpha");
        expect(getLabel("C", filtered)).toBe("Charlie");
        expect(getLabel("B", filtered)).toBeUndefined();
    });
});
