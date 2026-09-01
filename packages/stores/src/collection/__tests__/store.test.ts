import {runInAction} from "mobx";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import * as core from "@focus4/core";
import {e, entity, Entity} from "@focus4/entities";

import {domain} from "../../__tests__/test-utils";
import {makeLocalCollectionStore} from "../local";
import {makeServerCollectionStore} from "../server";
import {QueryInput, QueryOutput, SearchService} from "../types";

// Type de test pour les items
interface TestItem {
    id: number;
    name: string;
    category: string;
    status: "active" | "inactive";
    tags?: string[];
}

const DO_STRING = domain(z.string().max(1));

const makeItem = (
    id: number,
    category = "A",
    status: TestItem["status"] = "active",
    name = `Item ${id}`
): TestItem => ({id, name, category, status});

type MockSearchService = ReturnType<typeof vi.fn> & SearchService<TestItem, Entity>;

const makeServerService = (result: Partial<QueryOutput<TestItem>> = {}): MockSearchService =>
    vi.fn().mockResolvedValue({
        list: [],
        facets: [],
        totalCount: 0,
        ...result
    }) as MockSearchService;

const makeOptionalCriteriaEntity = () =>
    entity({
        name: e.field(DO_STRING, f => f.optional()),
        category: e.field(DO_STRING, f => f.optional())
    });

const makeRequiredNameCriteriaEntity = () => entity({name: e.field(DO_STRING)});

const makeOptionalNameCriteriaEntity = () => entity({name: e.field(DO_STRING, f => f.optional())});

interface CriteriaFields {
    name: {value: string | undefined};
    category?: {value: string | undefined};
}

const asCriteriaFields = (criteria: unknown) => criteria as CriteriaFields;

describe("CollectionStore", () => {
    describe("Constructeur - Mode local", () => {
        test("Crée un store local avec la configuration de base", () => {
            const store = makeLocalCollectionStore({
                searchFields: ["name", "category"]
            });

            expect(store.availableSearchFields).toEqual(["name", "category"]);
            expect(store.query).toBe("");
            expect(store.list).toEqual([]);
            expect(store.facets).toEqual([]);
        });

        test("Crée un store local avec des définitions de facettes", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            });

            expect(store.availableSearchFields).toEqual(["name"]);
        });

        test("Crée un store local sans configuration", () => {
            const store = makeLocalCollectionStore();

            expect(store.availableSearchFields).toEqual([]);
        });
    });

    describe("Constructeur - Mode serveur", () => {
        test("Crée un store serveur avec un service", () => {
            const service = makeServerService();

            const store = makeServerCollectionStore(service);

            expect(store.query).toBe("");
            expect(store.list).toEqual([]);
        });

        test("Crée un store serveur avec des propriétés initiales", () => {
            const service = makeServerService();

            const store = makeServerCollectionStore(service, {
                query: "test",
                top: 100
            });

            expect(store.query).toBe("test");
            expect(store.top).toBe(100);
        });
    });

    describe("Propriétés de base", () => {
        test("Les propriétés initiales sont correctes", () => {
            const store = makeLocalCollectionStore<TestItem>();

            expect(store.query).toBe("");
            expect(store.sort).toEqual([]);
            expect(store.groupingKey).toBeUndefined();
            expect(store.selectedItems.size).toBe(0);
            expect(store.isLoading).toBe(false);
        });

        test("currentCount retourne la longueur de la liste", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            expect(store.currentCount).toBe(2);
        });

        test("totalCount retourne serverCount en mode serveur", () => {
            const service = makeServerService({
                list: [],
                facets: [],
                totalCount: 100
            });
            const store = makeServerCollectionStore(service);

            runInAction(() => {
                Reflect.set(store, "serverCount", 100);
            });

            expect(store.totalCount).toBe(100);
        });

        test("totalCount retourne currentCount en mode local", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [{id: 1, name: "Item 1", category: "A", status: "active"}];

            expect(store.totalCount).toBe(1);
        });
    });

    describe("Liste et filtrage - Mode local", () => {
        test("La liste peut être assignée directement", () => {
            const store = makeLocalCollectionStore<TestItem>();
            const items: TestItem[] = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            store.list = items;

            expect(store.list).toEqual(items);
        });

        test("Le filtrage par texte fonctionne", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"]
            });
            store.list = [
                {id: 1, name: "Alpha", category: "A", status: "active"},
                {id: 2, name: "Beta", category: "B", status: "inactive"},
                {id: 3, name: "Gamma", category: "A", status: "active"}
            ];

            store.query = "Alpha";

            expect(store.list).toHaveLength(1);
            expect(store.list[0].name).toBe("Alpha");
        });

        test("Le filtrage par texte est insensible à la casse", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"]
            });
            store.list = [
                {id: 1, name: "Alpha", category: "A", status: "active"},
                {id: 2, name: "Beta", category: "B", status: "inactive"}
            ];

            store.query = "alpha";

            expect(store.list).toHaveLength(1);
            expect(store.list[0].name).toBe("Alpha");
        });

        test.each([
            {
                label: "Le tri fonctionne",
                items: [
                    {id: 3, name: "Charlie", category: "C", status: "active"},
                    {id: 1, name: "Alpha", category: "A", status: "active"},
                    {id: 2, name: "Beta", category: "B", status: "inactive"}
                ] as TestItem[],
                sort: [{fieldName: "name", sortDesc: false}],
                expected: [{name: "Alpha"}, {name: "Beta"}, {name: "Charlie"}]
            },
            {
                label: "Le tri descendant fonctionne",
                items: [
                    {id: 1, name: "Alpha", category: "A", status: "active"},
                    {id: 2, name: "Beta", category: "B", status: "inactive"},
                    {id: 3, name: "Charlie", category: "C", status: "active"}
                ] as TestItem[],
                sort: [{fieldName: "name", sortDesc: true}],
                expected: [{name: "Charlie"}, {name: "Beta"}, {name: "Alpha"}]
            },
            {
                label: "Le tri multiple fonctionne",
                items: [
                    {id: 1, name: "Alpha", category: "B", status: "active"},
                    {id: 2, name: "Beta", category: "A", status: "active"},
                    {id: 3, name: "Alpha", category: "A", status: "inactive"}
                ] as TestItem[],
                sort: [
                    {fieldName: "name", sortDesc: false},
                    {fieldName: "category", sortDesc: false}
                ],
                expected: [
                    {name: "Alpha", category: "A"},
                    {name: "Alpha", category: "B"}
                ]
            }
        ])("$label", ({items, sort, expected}) => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = items;
            store.sort = sort as any;

            for (const [i, exp] of expected.entries()) {
                for (const [k, v] of Object.entries(exp)) {
                    expect((store.list[i] as any)[k]).toBe(v);
                }
            }
        });
    });

    describe("Facettes - Mode local", () => {
        test("Les facettes sont calculées à partir des données", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            });
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "A", status: "inactive"},
                {id: 3, name: "Item 3", category: "B", status: "active"}
            ];

            const {facets} = store;
            expect(facets).toHaveLength(1);
            expect(facets[0].code).toBe("category");
            expect(facets[0].values).toHaveLength(2);
            expect(facets[0].values.find(v => v.code === "A")?.count).toBe(2);
            expect(facets[0].values.find(v => v.code === "B")?.count).toBe(1);
        });

        test("Les facettes filtrent la liste", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            });
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"},
                {id: 3, name: "Item 3", category: "A", status: "active"}
            ];

            store.addFacetValue("category", "A", "selected");

            expect(store.list).toHaveLength(2);
            expect(store.list.every(item => item.category === "A")).toBe(true);
        });

        test("Les facettes avec exclusion fonctionnent", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category",
                        canExclude: true
                    }
                ]
            });
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"},
                {id: 3, name: "Item 3", category: "A", status: "active"}
            ];

            store.addFacetValue("category", "A", "excluded");

            expect(store.list).toHaveLength(1);
            expect(store.list[0].category).toBe("B");
        });

        test("removeFacetValue retire une valeur de facette", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            });
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            store.addFacetValue("category", "A", "selected");
            expect(store.list).toHaveLength(1);

            store.removeFacetValue("category", "A");
            expect(store.list).toHaveLength(2);
        });

        test("toggleFacetOperator change l'opérateur", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category",
                        isMultiSelectable: true
                    }
                ]
            });

            store.toggleFacetOperator("category");
            expect(store.inputFacets.category?.operator).toBe("and");

            store.toggleFacetOperator("category");
            expect(store.inputFacets.category?.operator).toBe("or");

            store.toggleFacetOperator("category");
            expect(store.inputFacets.category?.operator).toBe("and");
        });
    });

    describe("Recherche - Mode serveur", () => {
        test("search appelle le service avec les bons paramètres", async () => {
            const service = makeServerService({
                list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                facets: [],
                totalCount: 1
            });

            const store = makeServerCollectionStore(service);
            store.query = "test";
            store.top = 25;

            await store.search();

            expect(service).toHaveBeenCalled();
            const callArgs = vi.mocked(service).mock.calls[0][0] as QueryInput;
            expect(callArgs.criteria?.query).toBe("test");
            expect(callArgs.top).toBe(25);
        });

        test("search met à jour la liste avec les résultats", async () => {
            const items: TestItem[] = [makeItem(1, "A", "active"), makeItem(2, "B", "inactive")];
            const service = makeServerService({
                list: items,
                facets: [],
                totalCount: 2
            });

            const store = makeServerCollectionStore(service);

            await store.search();

            expect(store.list).toEqual(items);
            expect(store.totalCount).toBe(2);
        });

        test("search met à jour les facettes", async () => {
            const service = makeServerService({
                list: [],
                facets: [
                    {
                        code: "category",
                        label: "Catégorie",
                        isMultiSelectable: false,
                        isMultiValued: false,
                        canExclude: false,
                        values: [
                            {code: "A", label: "A", count: 5},
                            {code: "B", label: "B", count: 3}
                        ]
                    }
                ],
                totalCount: 0
            });

            const store = makeServerCollectionStore(service);

            await store.search();

            expect(store.facets).toHaveLength(1);
            expect(store.facets[0].code).toBe("category");
            expect(store.facets[0].values).toHaveLength(2);
        });

        test("search gère les groupes", async () => {
            const service = makeServerService({
                list: [],
                groups: [
                    {
                        code: "A",
                        label: "Catégorie A",
                        list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                        totalCount: 1
                    }
                ],
                facets: [],
                totalCount: 1
            });

            const store = makeServerCollectionStore(service);
            store.groupingKey = "category";

            await store.search();

            expect(store.groups).toHaveLength(1);
            expect(store.groups[0].code).toBe("A");
            expect(store.list).toHaveLength(1);
        });

        test("search avec isScroll ajoute les résultats", async () => {
            const service = vi
                .fn()
                .mockResolvedValueOnce({
                    list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                    facets: [],
                    totalCount: 2
                })
                .mockResolvedValueOnce({
                    list: [{id: 2, name: "Item 2", category: "B", status: "inactive"}],
                    facets: [],
                    totalCount: 2
                }) as MockSearchService;

            const store = makeServerCollectionStore(service);

            await store.search();
            expect(store.list).toHaveLength(1);

            await store.search(true);
            expect(store.list).toHaveLength(2);
        });

        test("search avec skipToken en scroll n'actualise pas totalCount", async () => {
            const service = vi
                .fn()
                .mockResolvedValueOnce({
                    list: [makeItem(1)],
                    facets: [],
                    totalCount: 2,
                    skipToken: "page-2"
                })
                .mockResolvedValueOnce({
                    list: [makeItem(2, "B")],
                    facets: [],
                    totalCount: 999,
                    skipToken: undefined
                });

            const store = makeServerCollectionStore(service);

            await store.search();
            expect(store.totalCount).toBe(2);

            await store.search(true);
            expect(store.totalCount).toBe(2);

            const secondCall = service.mock.calls[1][0] as QueryInput;
            expect(secondCall.skipToken).toBe("page-2");
            expect(secondCall.skip).toBeUndefined();
        });

        test("search en scroll sans skipToken calcule skip", async () => {
            const service = vi
                .fn()
                .mockResolvedValueOnce({
                    list: [makeItem(1)],
                    facets: [],
                    totalCount: 2
                })
                .mockResolvedValueOnce({
                    list: [makeItem(2, "B")],
                    facets: [],
                    totalCount: 2
                });

            const store = makeServerCollectionStore(service);

            await store.search();
            await store.search(true);

            const secondCall = service.mock.calls[1][0] as QueryInput;
            expect(secondCall.skipToken).toBeUndefined();
            expect(secondCall.skip).toBe(1);
        });

        test("search vide la sélection si ce n'est pas un scroll", async () => {
            const service = makeServerService({
                list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                facets: [],
                totalCount: 1
            });

            const store = makeServerCollectionStore(service);
            const item: TestItem = {id: 0, name: "Old", category: "X", status: "active"};
            store.selectedItems.add(item);

            await store.search();

            expect(store.selectedItems.size).toBe(0);
        });

        test("search ignore les critères invalides dans les critères personnalisés", async () => {
            const service = vi.fn().mockResolvedValue({
                list: [],
                facets: [],
                totalCount: 0
            });

            const criteriaEntity = makeOptionalCriteriaEntity();

            const store = makeServerCollectionStore(service, {criteriaMode: "manual"}, criteriaEntity);
            const criteria = asCriteriaFields(store.criteria);
            criteria.name.value = "ab";
            criteria.category!.value = "A";

            await store.search();

            expect(service).toHaveBeenCalled();
            const callArgs = service.mock.calls[0][0] as QueryInput;
            expect(callArgs.criteria).toMatchObject({category: "A"});
            expect(callArgs.criteria).not.toHaveProperty("name");
        });

        test("search retire les critères vides", async () => {
            const service = makeServerService();

            const criteriaEntity = makeOptionalCriteriaEntity();

            const store = makeServerCollectionStore(service, {criteriaMode: "manual"}, criteriaEntity);
            const criteria = asCriteriaFields(store.criteria);
            criteria.name.value = "";
            criteria.category!.value = "B";

            await store.search();

            const callArgs = service.mock.calls[0][0] as QueryInput;
            expect(callArgs.criteria).toMatchObject({category: "B"});
            expect(callArgs.criteria).not.toHaveProperty("name");
        });

        test("mode debounced déclenche une recherche sur query", async () => {
            vi.useFakeTimers();
            try {
                const service = makeServerService();
                const store = makeServerCollectionStore(service, {criteriaMode: "debounced", textSearchDelay: 10});
                store.query = "new-query";

                await vi.advanceTimersByTimeAsync(20);

                expect(service).toHaveBeenCalled();
            } finally {
                vi.useRealTimers();
            }
        });

        test("search bloque l'appel si un critère requis est invalide", async () => {
            const service = vi.fn().mockResolvedValue({
                list: [],
                facets: [],
                totalCount: 0
            });
            const criteriaEntity = makeRequiredNameCriteriaEntity();

            const store = makeServerCollectionStore(service, {criteriaMode: "manual"}, criteriaEntity);
            const criteria = asCriteriaFields(store.criteria);
            criteria.name.value = undefined;

            await store.search();

            expect(service).not.toHaveBeenCalled();
        });

        test("search ignore les erreurs d'abandon", async () => {
            const service = makeServerService();
            const abortError = new Error("aborted");

            const trackSpy = vi.spyOn(core.requestStore, "track").mockRejectedValueOnce(abortError);
            const abortSpy = vi.spyOn(core, "isAbortError").mockReturnValueOnce(true);
            const store = makeServerCollectionStore(service);

            await expect(store.search()).resolves.toBeUndefined();

            trackSpy.mockRestore();
            abortSpy.mockRestore();
        });

        test("search rethrow les erreurs techniques", async () => {
            const service = makeServerService();
            const technicalError = new Error("boom");

            const trackSpy = vi.spyOn(core.requestStore, "track").mockRejectedValueOnce(technicalError);
            const abortSpy = vi.spyOn(core, "isAbortError").mockReturnValueOnce(false);
            const store = makeServerCollectionStore(service);

            await expect(store.search()).rejects.toThrow("boom");

            trackSpy.mockRestore();
            abortSpy.mockRestore();
        });

        test("clear vide tout", async () => {
            const item: TestItem = {id: 0, name: "Old", category: "X", status: "active"};
            const service = makeServerService({
                list: [item],
                facets: [],
                totalCount: 1
            });

            const store = makeServerCollectionStore(service);

            await store.search();
            store.selectedItems.add(item);
            store.clear();

            expect(store.list).toHaveLength(0);
            expect(store.totalCount).toBe(0);
            expect(store.selectedItems.size).toBe(0);
        });
    });

    describe("setProperties", () => {
        test("Met à jour plusieurs propriétés à la fois", () => {
            const store = makeLocalCollectionStore<TestItem>();

            store.setProperties({
                query: "test",
                groupingKey: "category"
            });

            expect(store.query).toBe("test");
            expect(store.groupingKey).toBe("category");
        });

        test("Met à jour le tri", () => {
            const store = makeLocalCollectionStore<TestItem>();

            store.setProperties({
                sort: [{fieldName: "name", sortDesc: true}]
            });

            expect(store.sort).toHaveLength(1);
            expect(store.sort[0].fieldName).toBe("name");
            expect(store.sort[0].sortDesc).toBe(true);
        });

        test("Met à jour les facettes d'entrée", () => {
            const store = makeLocalCollectionStore<TestItem>();

            store.setProperties({
                inputFacets: {
                    category: {
                        selected: ["A", "B"]
                    }
                }
            });

            expect(store.inputFacets.category?.selected).toEqual(["A", "B"]);
        });

        test("Met à jour les critères personnalisés en mode serveur", () => {
            const service = makeServerService();
            const criteriaEntity = makeOptionalNameCriteriaEntity();
            const store = makeServerCollectionStore(service, {criteriaMode: "manual"}, criteriaEntity);

            store.setProperties({criteria: {name: "Hello"}});

            expect(asCriteriaFields(store.criteria).name.value).toBe("Hello");
        });

        test("Met à jour les facettes d'entrée en mode serveur", () => {
            const service = makeServerService();
            const store = makeServerCollectionStore(service);

            store.setProperties({
                inputFacets: {
                    category: {
                        selected: ["A"]
                    }
                }
            });

            expect(store.inputFacets.category?.selected).toEqual(["A"]);
        });
    });

    describe("clear", () => {
        test("Vide tous les résultats et la sélection", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [{id: 1, name: "Item 1", category: "A", status: "active"}];
            store.selectedItems.add(store.list[0]);

            store.clear();

            expect(store.list).toHaveLength(0);
            expect(store.selectedItems.size).toBe(0);
            expect(store.totalCount).toBe(0);
        });
    });

    describe("Groupes", () => {
        test("groups retourne les groupes en mode serveur", async () => {
            const service = makeServerService({
                list: [],
                groups: [
                    {
                        code: "A",
                        label: "Catégorie A",
                        list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                        totalCount: 1
                    }
                ],
                facets: [],
                totalCount: 1
            });

            const store = makeServerCollectionStore(service);
            store.groupingKey = "category";

            await store.search();

            expect(store.groups).toHaveLength(1);
            expect(store.groups[0].code).toBe("A");
        });

        test("groups retourne les groupes en mode local", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            });
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "A", status: "inactive"},
                {id: 3, name: "Item 3", category: "B", status: "active"}
            ];
            store.groupingKey = "category";

            const {groups} = store;
            expect(groups).toHaveLength(2);
            expect(groups.find(g => g.code === "A")?.totalCount).toBe(2);
            expect(groups.find(g => g.code === "B")?.totalCount).toBe(1);
        });

        test("getSearchGroupStore retourne un store pour un groupe", async () => {
            const service = makeServerService({
                list: [],
                groups: [
                    {
                        code: "A",
                        label: "Catégorie A",
                        list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                        totalCount: 1
                    }
                ],
                facets: [],
                totalCount: 1
            });

            const store = makeServerCollectionStore(service);
            store.groupingKey = "category";

            await store.search();

            const groupStore = store.getSearchGroupStore("A");
            expect(groupStore.list).toHaveLength(1);
            expect(groupStore.totalCount).toBe(1);
        });

        test("getSearchGroupStore retourne des valeurs par défaut pour groupe inconnu", async () => {
            const service = makeServerService({
                list: [],
                groups: [],
                facets: [],
                totalCount: 0
            });

            const store = makeServerCollectionStore(service);
            await store.search();

            const groupStore = store.getSearchGroupStore("unknown");
            expect(groupStore.currentCount).toBe(0);
            expect(groupStore.totalCount).toBe(0);
            expect(groupStore.list).toEqual([]);
            expect(groupStore.selectionStatus).toBe("none");
        });
    });

    describe("Constructeur serveur", () => {
        test("accepte l'ordre (service, criteria, init)", () => {
            const service = makeServerService();
            const criteriaEntity = makeOptionalNameCriteriaEntity();

            const store = makeServerCollectionStore(service, criteriaEntity, {query: "from-init", top: 12});

            expect(store.query).toBe("from-init");
            expect(store.top).toBe(12);
        });

        test("expose le type server", () => {
            const service = makeServerService();
            const store = makeServerCollectionStore(service);

            expect(store.type).toBe("server");
        });
    });

    describe("Cas limites", () => {
        test("Fonctionne avec une liste vide", () => {
            const store = makeLocalCollectionStore<TestItem>();

            expect(store.list).toEqual([]);
            expect(store.facets).toEqual([]);
            expect(store.currentCount).toBe(0);
        });

        test("Fonctionne avec des valeurs null dans les facettes", () => {
            interface ItemWithNull {
                id: number;
                category: string | null;
            }
            const store = makeLocalCollectionStore<ItemWithNull>({
                searchFields: [],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            });
            store.list = [
                {id: 1, category: "A"},
                {id: 2, category: null},
                {id: 3, category: "B"}
            ];

            const {facets} = store;
            const nullFacet = facets[0].values.find(v => v.code === "<null>");
            expect(nullFacet).toEqual({
                code: "<null>",
                label: "focus.search.results.missing",
                count: 1
            });
        });

        test("Fonctionne avec des tableaux dans les facettes", () => {
            const store = makeLocalCollectionStore<TestItem>({
                searchFields: [],
                facetDefinitions: [
                    {
                        code: "tags",
                        label: "Tags",
                        fieldName: "tags"
                    }
                ]
            });
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active", tags: ["tag1", "tag2"]},
                {id: 2, name: "Item 2", category: "B", status: "inactive", tags: ["tag1"]}
            ];

            const {facets} = store;
            expect(facets[0].values.find(v => v.code === "tag1")?.count).toBe(2);
            expect(facets[0].values.find(v => v.code === "tag2")?.count).toBe(1);
        });

        test("isItemSelectionnable filtre les items sélectionnables", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.isItemSelectionnable = item => item.status === "active";
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            expect(store.selectionnableList).toHaveLength(1);
            expect(store.selectionnableList[0].status).toBe("active");
        });
    });

    describe("Sélection et facettes avancées", () => {
        test("toggle ignore un élément non sélectionnable", () => {
            const store = makeLocalCollectionStore<TestItem>();
            const item = {id: 1, name: "Item 1", category: "A", status: "inactive" as const};
            store.isItemSelectionnable = x => x.status === "active";
            store.list = [item];

            store.toggle(item);

            expect(store.selectedItems.size).toBe(0);
            expect(store.selectionStatus).toBe("none");
        });

        test("toggleAll sélectionne puis désélectionne tout", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "active"}
            ];

            store.toggleAll();
            expect(store.selectedItems.size).toBe(2);
            expect(store.selectionStatus).toBe("selected");

            store.toggleAll();
            expect(store.selectedItems.size).toBe(0);
            expect(store.selectionStatus).toBe("none");
        });

        test("selectionStatus passe à partial", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "active"}
            ];

            store.toggle(store.list[0]);

            expect(store.selectionStatus).toBe("partial");
            expect(store.selectedList).toHaveLength(1);
        });

        test("removeFacetValue global conserve l'opérateur", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Catégorie", fieldName: "category"}]
            });

            store.addFacetValue("category", "A", "selected");
            store.toggleFacetOperator("category");
            expect(store.inputFacets.category?.operator).toBe("and");

            store.removeFacetValue();

            expect(store.inputFacets.category?.selected).toBeUndefined();
            expect(store.inputFacets.category?.excluded).toBeUndefined();
            expect(store.inputFacets.category?.operator).toBe("and");
        });

        test("removeFacetValue supprime une valeur exclue", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Catégorie", fieldName: "category"}]
            });

            store.addFacetValue("category", "A", "excluded");
            expect(store.inputFacets.category?.excluded).toEqual(["A"]);

            store.removeFacetValue("category", "A");

            expect(store.inputFacets.category).toBeUndefined();
        });

        test("getSearchGroupStore.toggle délègue au store parent", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Catégorie", fieldName: "category"}],
                searchFields: []
            });
            store.list = [
                {id: 1, name: "A1", category: "A", status: "active"},
                {id: 2, name: "B1", category: "B", status: "active"}
            ];
            store.groupingKey = "category";

            const groupStore = store.getSearchGroupStore("A");
            groupStore.toggle(store.list[0]);

            expect(store.selectedItems.has(store.list[0])).toBe(true);
            expect(groupStore.selectionStatus).toBe("selected");
        });

        test("getSearchGroupStore.toggleAll agit uniquement sur le groupe", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Catégorie", fieldName: "category"}],
                searchFields: []
            });
            store.list = [
                {id: 1, name: "A1", category: "A", status: "active"},
                {id: 2, name: "A2", category: "A", status: "active"},
                {id: 3, name: "B1", category: "B", status: "active"}
            ];
            store.groupingKey = "category";
            store.selectedItems.add(store.list[0]);
            store.selectedItems.add(store.list[2]);

            const groupStore = store.getSearchGroupStore("A");

            groupStore.toggleAll();
            expect(store.selectedItems.has(store.list[0])).toBe(true);
            expect(store.selectedItems.has(store.list[1])).toBe(true);
            expect(store.selectedItems.has(store.list[2])).toBe(true);

            groupStore.toggleAll();
            expect(store.selectedItems.has(store.list[0])).toBe(false);
            expect(store.selectedItems.has(store.list[1])).toBe(false);
            expect(store.selectedItems.has(store.list[2])).toBe(true);
        });
    });

    describe("Filtrage par facettes - Types de valeurs", () => {
        interface NumericItem {
            id: number;
            count: number;
        }
        interface BooleanItem {
            id: number;
            active: boolean;
        }
        interface ArrayItem {
            id: number;
            tags: string[];
        }
        interface NullableItem {
            id: number;
            category: string | null | undefined;
        }

        test("filtre par valeur numérique", () => {
            const store = makeLocalCollectionStore<NumericItem>({
                facetDefinitions: [{code: "count", label: "Count", fieldName: "count"}]
            });
            store.list = [
                {id: 1, count: 1},
                {id: 2, count: 2},
                {id: 3, count: 3}
            ];

            store.addFacetValue("count", "2", "selected");

            expect(store.list.map(i => i.id)).toEqual([2]);
        });

        test("filtre par valeur booléenne", () => {
            const store = makeLocalCollectionStore<BooleanItem>({
                facetDefinitions: [{code: "active", label: "Actif", fieldName: "active"}]
            });
            store.list = [
                {id: 1, active: true},
                {id: 2, active: false},
                {id: 3, active: true}
            ];

            store.addFacetValue("active", "true", "selected");

            expect(store.list.map(i => i.id)).toEqual([1, 3]);
        });

        test("filtre par valeur <null> pour un item de valeur null", () => {
            const store = makeLocalCollectionStore<NullableItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category"}]
            });
            store.list = [
                {id: 1, category: "A"},
                {id: 2, category: null},
                {id: 3, category: undefined}
            ];

            store.addFacetValue("category", "<null>", "selected");

            expect(store.list.map(i => i.id).sort()).toEqual([2, 3]);
        });

        test("filtre par tableau : facette <null> matche un tableau vide", () => {
            const store = makeLocalCollectionStore<ArrayItem>({
                facetDefinitions: [{code: "tags", label: "Tags", fieldName: "tags"}]
            });
            store.list = [
                {id: 1, tags: ["a"]},
                {id: 2, tags: []}
            ];

            store.addFacetValue("tags", "<null>", "selected");

            expect(store.list.map(i => i.id)).toEqual([2]);
        });

        test("filtre par tableau : facette matche un élément du tableau", () => {
            const store = makeLocalCollectionStore<ArrayItem>({
                facetDefinitions: [{code: "tags", label: "Tags", fieldName: "tags"}]
            });
            store.list = [
                {id: 1, tags: ["a", "b"]},
                {id: 2, tags: ["c"]},
                {id: 3, tags: ["b"]}
            ];

            store.addFacetValue("tags", "b", "selected");

            expect(store.list.map(i => i.id).sort()).toEqual([1, 3]);
        });

        test("groupe les items par valeur de tableau", () => {
            const store = makeLocalCollectionStore<ArrayItem>({
                facetDefinitions: [{code: "tags", label: "Tags", fieldName: "tags"}]
            });
            store.list = [
                {id: 1, tags: ["a", "b"]},
                {id: 2, tags: []},
                {id: 3, tags: ["a"]}
            ];

            const {facets} = store;
            const {values} = facets[0];
            expect(values.find(v => v.code === "a")?.count).toBe(2);
            expect(values.find(v => v.code === "b")?.count).toBe(1);
            expect(values.find(v => v.code === "<null>")?.count).toBe(1);
        });

        test("facette <null> ne matche pas un nombre non nul (itemValue !== 0)", () => {
            const store = makeLocalCollectionStore<NumericItem>({
                facetDefinitions: [{code: "count", label: "Count", fieldName: "count"}]
            });
            store.list = [
                {id: 1, count: 5},
                {id: 2, count: 0}
            ];

            store.addFacetValue("count", "<null>", "selected");

            // Le "0" n'est pas considéré <null>, seuls les valeurs falsy non-zéro le sont.
            expect(store.list).toEqual([]);
        });

        test("facette vide (aucun selected ni excluded) ne filtre rien", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category"}]
            });
            store.list = [
                {id: 1, name: "a", category: "A", status: "active"},
                {id: 2, name: "b", category: "B", status: "active"}
            ];

            store.addFacetValue("category", "A", "selected");
            store.removeFacetValue("category", "A");
            (store.inputFacets as any).category = {selected: [], excluded: []};

            expect(store.list).toHaveLength(2);
        });
    });

    describe("Divers - Mode local", () => {
        test("setProperties applique inputFacets", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category"}]
            });
            store.list = [
                {id: 1, name: "a", category: "A", status: "active"},
                {id: 2, name: "b", category: "B", status: "active"}
            ];

            store.setProperties({
                inputFacets: {category: {selected: ["A"]}}
            });

            expect(store.list.map(i => i.id)).toEqual([1]);
        });

        test("search appelle le service local si présent", async () => {
            const store = makeLocalCollectionStore<TestItem>();
            const localLoad = vi.fn().mockResolvedValue(undefined);
            store.localLoadService = localLoad;

            await store.search();

            expect(localLoad).toHaveBeenCalledTimes(1);
        });

        test("search sans service local ne fait rien", async () => {
            const store = makeLocalCollectionStore<TestItem>();
            await expect(store.search()).resolves.toBeUndefined();
        });

        test("facets: isMultiSelectable garde les items filtrés par la même facette", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category", isMultiSelectable: true}]
            });
            store.list = [
                {id: 1, name: "a", category: "A", status: "active"},
                {id: 2, name: "b", category: "B", status: "active"}
            ];
            store.setProperties({inputFacets: {category: {selected: ["A"]}}});
            // Comme isMultiSelectable, le calcul des valeurs de facette doit ignorer sa propre sélection
            const cat = store.facets[0];
            expect(cat.values.map(v => v.code).sort()).toEqual(["A", "B"]);
        });

        test("facets: ordering 'key-asc' trie les valeurs par code croissant", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category", ordering: "key-asc"}]
            });
            store.list = [
                {id: 1, name: "a", category: "B", status: "active"},
                {id: 2, name: "b", category: "A", status: "active"},
                {id: 3, name: "c", category: "C", status: "active"}
            ];
            expect(store.facets[0].values.map(v => v.code)).toEqual(["A", "B", "C"]);
        });

        test("facets: ordering 'count-asc' trie par count croissant", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category", ordering: "count-asc"}]
            });
            store.list = [
                {id: 1, name: "a", category: "A", status: "active"},
                {id: 2, name: "b", category: "A", status: "active"},
                {id: 3, name: "c", category: "B", status: "active"}
            ];
            expect(store.facets[0].values.map(v => v.code)).toEqual(["B", "A"]);
        });

        test("facets: displayFormatter transforme les labels non-null", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Cat",
                        fieldName: "category",
                        displayFormatter: v => `[${v}]`
                    }
                ]
            });
            store.list = [{id: 1, name: "a", category: "A", status: "active"}];
            expect(store.facets[0].values[0].label).toBe("[A]");
        });

        test("groups: sans groupingKey retourne []", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category"}]
            });
            store.list = [{id: 1, name: "a", category: "A", status: "active"}];
            expect(store.groups).toEqual([]);
        });

        test("groups: avec groupingKey sans facetDefinitions retourne []", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [{id: 1, name: "a", category: "A", status: "active"}];
            store.groupingKey = "category";
            expect(store.groups).toEqual([]);
        });

        test("list: tri ascendant est appliqué", () => {
            const store = makeLocalCollectionStore<TestItem>();
            store.list = [
                {id: 3, name: "c", category: "A", status: "active"},
                {id: 1, name: "a", category: "A", status: "active"},
                {id: 2, name: "b", category: "A", status: "active"}
            ];
            store.sort = [{fieldName: "id", sortDesc: false}];
            expect(store.list.map(i => i.id)).toEqual([1, 2, 3]);
        });

        test("filterItemByFacet: excluded exclut les correspondances", () => {
            const store = makeLocalCollectionStore<TestItem>({
                facetDefinitions: [{code: "category", label: "Cat", fieldName: "category"}]
            });
            store.list = [
                {id: 1, name: "a", category: "A", status: "active"},
                {id: 2, name: "b", category: "B", status: "active"}
            ];
            store.setProperties({inputFacets: {category: {excluded: ["A"]}}});
            expect(store.list.map(i => i.id)).toEqual([2]);
        });

        test("setProperties: sort et query sont pris en compte", () => {
            const store = makeLocalCollectionStore<TestItem>({searchFields: ["name"]});
            store.list = [
                {id: 1, name: "hello", category: "A", status: "active"},
                {id: 2, name: "world", category: "B", status: "active"}
            ];
            store.setProperties({sort: [{fieldName: "id", sortDesc: true}], query: "hello"});
            expect(store.list.map(i => i.id)).toEqual([1]);
        });

        test("setProperties: groupingKey et searchFields sont écrasés", () => {
            const store = makeLocalCollectionStore<TestItem>({searchFields: ["name"]});
            store.setProperties({groupingKey: "category", searchFields: ["category"]});
            expect(store.groupingKey).toBe("category");
            expect(store.searchFields).toEqual(["category"]);
        });
    });
});
