import {describe, expect, test} from "vitest";

import {shouldDisplayFacet} from "../utils";

const inputFacets = {};

function facet(values: {code: string; count: number}[]) {
    return {
        code: "status",
        label: "Status",
        canExclude: true,
        isMultiSelectable: true,
        isMultiValued: values.length > 1,
        values: values.map(value => ({...value, label: value.code}))
    };
}

describe("shouldDisplayFacet", () => {
    test.each([
        ["masquée quand elle est vide", facet([]), false, 0, false],
        ["masquée quand une valeur couvre tous les résultats", facet([{code: "active", count: 3}]), false, 3, false],
        [
            "masquée sans sélection quand une valeur complète couvre tous les résultats",
            facet([{code: "active", count: 3}]),
            false,
            3,
            false
        ],
        ["affichée quand showSingleValuedFacets est actif", facet([{code: "active", count: 3}]), true, 3, true],
        [
            "affichée pour plusieurs valeurs",
            facet([
                {code: "active", count: 2},
                {code: "closed", count: 1}
            ]),
            false,
            3,
            true
        ]
    ])("%s", (_label, value, showSingleValuedFacets, totalCount, expected) => {
        expect(shouldDisplayFacet(value, inputFacets, showSingleValuedFacets, totalCount)).toBe(expected);
    });

    test("affiche une valeur complète exclue", () => {
        const input = {status: {excluded: ["active"]}};

        expect(shouldDisplayFacet(facet([{code: "active", count: 3}]), input, false, 3)).toBe(true);
    });
});
