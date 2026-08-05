// @vitest-environment jsdom
import {renderHook} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {domain} from "@focus4/form-toolbox";

import {useLocalCollectionStore, useServerCollectionStore} from "../store";

describe("collection store hooks", () => {
    test("useLocalCollectionStore crée un store local stable", () => {
        const config = {facetDefinitions: []};
        const {result, rerender} = renderHook(() => useLocalCollectionStore(config));

        const first = result.current;
        rerender();
        const second = result.current;

        expect(first).toBe(second);
        expect(first.type).toBe("local");
    });

    test("useServerCollectionStore applique les paramètres initiaux", () => {
        const service = vi.fn();
        const criteria = entity({label: e.field(domain(z.string()))});
        const initialQuery = {sort: [{fieldName: "label"}]};
        const {result} = renderHook(() => useServerCollectionStore(service, criteria, initialQuery));

        expect(result.current.type).toBe("server");
        expect(result.current.sort).toEqual(initialQuery.sort);
    });

    test("supporte la signature surchargée alternative", () => {
        const service = vi.fn();
        const initialQuery = {sort: [{fieldName: "label"}]};
        const criteria = entity({label: e.field(domain(z.string()))});
        const {result} = renderHook(() => useServerCollectionStore(service, initialQuery, criteria));

        expect(result.current.type).toBe("server");
        expect(result.current.sort).toEqual(initialQuery.sort);
    });
});
