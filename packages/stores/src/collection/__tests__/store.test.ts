import {runInAction} from "mobx";
import {describe, expect, test, vi} from "vitest";

import {CollectionStore} from "../index";
import {LocalStoreConfig, QueryInput, SearchService} from "../types";

// Type de test pour les items
interface TestItem {
    id: number;
    name: string;
    category: string;
    status: "active" | "inactive";
    tags?: string[];
}

describe("CollectionStore", () => {
    describe("Constructeur - Mode local", () => {
        test("Crée un store local avec la configuration de base", () => {
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name", "category"]
            };
            const store = new CollectionStore(config);

            expect(store.type).toBe("local");
            expect(store.availableSearchFields).toEqual(["name", "category"]);
            expect(store.query).toBe("");
            expect(store.list).toEqual([]);
            expect(store.facets).toEqual([]);
        });

        test("Crée un store local avec des définitions de facettes", () => {
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            };
            const store = new CollectionStore(config);

            expect(store.type).toBe("local");
            expect(store.availableSearchFields).toEqual(["name"]);
        });

        test("Crée un store local sans configuration", () => {
            const store = new CollectionStore();

            expect(store.type).toBe("local");
            expect(store.availableSearchFields).toEqual([]);
        });
    });

    describe("Constructeur - Mode serveur", () => {
        test("Crée un store serveur avec un service", () => {
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
                list: [],
                facets: [],
                totalCount: 0
            });

            const store = new CollectionStore(service);

            expect(store.type).toBe("server");
            expect(store.query).toBe("");
            expect(store.list).toEqual([]);
        });

        test("Crée un store serveur avec des propriétés initiales", () => {
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
                list: [],
                facets: [],
                totalCount: 0
            });

            const store = new CollectionStore(service, {
                query: "test",
                top: 100
            });

            expect(store.query).toBe("test");
            expect(store.top).toBe(100);
        });
    });

    describe("Propriétés de base", () => {
        test("Les propriétés initiales sont correctes", () => {
            const store = new CollectionStore<TestItem>();

            expect(store.query).toBe("");
            expect(store.top).toBe(50);
            expect(store.sort).toEqual([]);
            expect(store.groupingKey).toBeUndefined();
            expect(store.selectedItems.size).toBe(0);
            expect(store.isLoading).toBe(false);
        });

        test("currentCount retourne la longueur de la liste", () => {
            const store = new CollectionStore<TestItem>();
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            expect(store.currentCount).toBe(2);
        });

        test("totalCount retourne serverCount en mode serveur", () => {
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
                list: [],
                facets: [],
                totalCount: 100
            });
            const store = new CollectionStore(service);

            runInAction(() => {
                (store as any).serverCount = 100;
            });

            expect(store.totalCount).toBe(100);
        });

        test("totalCount retourne currentCount en mode local", () => {
            const store = new CollectionStore<TestItem>();
            store.list = [{id: 1, name: "Item 1", category: "A", status: "active"}];

            expect(store.totalCount).toBe(1);
        });
    });

    describe("Liste et filtrage - Mode local", () => {
        test("La liste peut être assignée directement", () => {
            const store = new CollectionStore<TestItem>();
            const items: TestItem[] = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            store.list = items;

            expect(store.list).toEqual(items);
        });

        test("Le filtrage par texte fonctionne", () => {
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"]
            };
            const store = new CollectionStore(config);
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
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"]
            };
            const store = new CollectionStore(config);
            store.list = [
                {id: 1, name: "Alpha", category: "A", status: "active"},
                {id: 2, name: "Beta", category: "B", status: "inactive"}
            ];

            store.query = "alpha";

            expect(store.list).toHaveLength(1);
            expect(store.list[0].name).toBe("Alpha");
        });

        test("Le tri fonctionne", () => {
            const store = new CollectionStore<TestItem>();
            store.list = [
                {id: 3, name: "Charlie", category: "C", status: "active"},
                {id: 1, name: "Alpha", category: "A", status: "active"},
                {id: 2, name: "Beta", category: "B", status: "inactive"}
            ];

            store.sort = [{fieldName: "name", sortDesc: false}];

            expect(store.list[0].name).toBe("Alpha");
            expect(store.list[1].name).toBe("Beta");
            expect(store.list[2].name).toBe("Charlie");
        });

        test("Le tri descendant fonctionne", () => {
            const store = new CollectionStore<TestItem>();
            store.list = [
                {id: 1, name: "Alpha", category: "A", status: "active"},
                {id: 2, name: "Beta", category: "B", status: "inactive"},
                {id: 3, name: "Charlie", category: "C", status: "active"}
            ];

            store.sort = [{fieldName: "name", sortDesc: true}];

            expect(store.list[0].name).toBe("Charlie");
            expect(store.list[1].name).toBe("Beta");
            expect(store.list[2].name).toBe("Alpha");
        });

        test("Le tri multiple fonctionne", () => {
            const store = new CollectionStore<TestItem>();
            store.list = [
                {id: 1, name: "Alpha", category: "B", status: "active"},
                {id: 2, name: "Beta", category: "A", status: "active"},
                {id: 3, name: "Alpha", category: "A", status: "inactive"}
            ];

            store.sort = [
                {fieldName: "name", sortDesc: false},
                {fieldName: "category", sortDesc: false}
            ];

            expect(store.list[0].name).toBe("Alpha");
            expect(store.list[0].category).toBe("A");
            expect(store.list[1].name).toBe("Alpha");
            expect(store.list[1].category).toBe("B");
        });
    });

    describe("Facettes - Mode local", () => {
        test("Les facettes sont calculées à partir des données", () => {
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            };
            const store = new CollectionStore(config);
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
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            };
            const store = new CollectionStore(config);
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
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category",
                        canExclude: true
                    }
                ]
            };
            const store = new CollectionStore(config);
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
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            };
            const store = new CollectionStore(config);
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
            const store = new CollectionStore<TestItem>({
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
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
                list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                facets: [],
                totalCount: 1
            });

            const store = new CollectionStore(service);
            store.query = "test";
            store.top = 25;

            await store.search();

            expect(service).toHaveBeenCalled();
            const callArgs = (service as any).mock.calls[0][0] as QueryInput;
            expect(callArgs.criteria?.query).toBe("test");
            expect(callArgs.top).toBe(25);
        });

        test("search met à jour la liste avec les résultats", async () => {
            const items: TestItem[] = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
                list: items,
                facets: [],
                totalCount: 2
            });

            const store = new CollectionStore(service);

            await store.search();

            expect(store.list).toEqual(items);
            expect(store.totalCount).toBe(2);
        });

        test("search met à jour les facettes", async () => {
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
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

            const store = new CollectionStore(service);

            await store.search();

            expect(store.facets).toHaveLength(1);
            expect(store.facets[0].code).toBe("category");
            expect(store.facets[0].values).toHaveLength(2);
        });

        test("search gère les groupes", async () => {
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
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

            const store = new CollectionStore(service);
            store.groupingKey = "category";

            await store.search();

            expect(store.groups).toHaveLength(1);
            expect(store.groups[0].code).toBe("A");
            expect(store.list).toHaveLength(1);
        });

        test("search avec isScroll ajoute les résultats", async () => {
            const service: SearchService<TestItem> = vi
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
                });

            const store = new CollectionStore(service);

            await store.search();
            expect(store.list).toHaveLength(1);

            await store.search(true);
            expect(store.list).toHaveLength(2);
        });

        test("search vide la sélection si ce n'est pas un scroll", async () => {
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
                list: [{id: 1, name: "Item 1", category: "A", status: "active"}],
                facets: [],
                totalCount: 1
            });

            const store = new CollectionStore(service);
            const item: TestItem = {id: 0, name: "Old", category: "X", status: "active"};
            store.selectedItems.add(item);

            await store.search();

            expect(store.selectedItems.size).toBe(0);
        });
    });

    describe("setProperties", () => {
        test("Met à jour plusieurs propriétés à la fois", () => {
            const store = new CollectionStore<TestItem>();

            store.setProperties({
                query: "test",
                top: 100,
                groupingKey: "category"
            });

            expect(store.query).toBe("test");
            expect(store.top).toBe(100);
            expect(store.groupingKey).toBe("category");
        });

        test("Met à jour le tri", () => {
            const store = new CollectionStore<TestItem>();

            store.setProperties({
                sort: [{fieldName: "name", sortDesc: true}]
            });

            expect(store.sort).toHaveLength(1);
            expect(store.sort[0].fieldName).toBe("name");
            expect(store.sort[0].sortDesc).toBe(true);
        });

        test("Met à jour les facettes d'entrée", () => {
            const store = new CollectionStore<TestItem>();

            store.setProperties({
                inputFacets: {
                    category: {
                        selected: ["A", "B"]
                    }
                }
            });

            expect(store.inputFacets.category?.selected).toEqual(["A", "B"]);
        });
    });

    describe("clear", () => {
        test("Vide tous les résultats et la sélection", () => {
            const store = new CollectionStore<TestItem>();
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
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
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

            const store = new CollectionStore(service);
            store.groupingKey = "category";

            await store.search();

            expect(store.groups).toHaveLength(1);
            expect(store.groups[0].code).toBe("A");
        });

        test("groups retourne les groupes en mode local", () => {
            const config: LocalStoreConfig<TestItem> = {
                searchFields: ["name"],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            };
            const store = new CollectionStore(config);
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
            const service: SearchService<TestItem> = vi.fn().mockResolvedValue({
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

            const store = new CollectionStore(service);
            store.groupingKey = "category";

            await store.search();

            const groupStore = store.getSearchGroupStore("A");
            expect(groupStore.list).toHaveLength(1);
            expect(groupStore.totalCount).toBe(1);
        });
    });

    describe("Cas limites", () => {
        test("Fonctionne avec une liste vide", () => {
            const store = new CollectionStore<TestItem>();

            expect(store.list).toEqual([]);
            expect(store.facets).toEqual([]);
            expect(store.currentCount).toBe(0);
        });

        test("Fonctionne avec des valeurs null dans les facettes", () => {
            interface ItemWithNull {
                id: number;
                category: string | null;
            }

            const config: LocalStoreConfig<ItemWithNull> = {
                searchFields: [],
                facetDefinitions: [
                    {
                        code: "category",
                        label: "Catégorie",
                        fieldName: "category"
                    }
                ]
            };
            const store = new CollectionStore(config);
            store.list = [
                {id: 1, category: "A"},
                {id: 2, category: null},
                {id: 3, category: "B"}
            ];

            const {facets} = store;
            const nullFacet = facets[0].values.find(v => v.code === "<null>");
            expect(nullFacet).toBeDefined();
            expect(nullFacet?.count).toBe(1);
        });

        test("Fonctionne avec des tableaux dans les facettes", () => {
            const config: LocalStoreConfig<TestItem> = {
                searchFields: [],
                facetDefinitions: [
                    {
                        code: "tags",
                        label: "Tags",
                        fieldName: "tags"
                    }
                ]
            };
            const store = new CollectionStore(config);
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active", tags: ["tag1", "tag2"]},
                {id: 2, name: "Item 2", category: "B", status: "inactive", tags: ["tag1"]}
            ];

            const {facets} = store;
            expect(facets[0].values.find(v => v.code === "tag1")?.count).toBe(2);
            expect(facets[0].values.find(v => v.code === "tag2")?.count).toBe(1);
        });

        test("isItemSelectionnable filtre les items sélectionnables", () => {
            const store = new CollectionStore<TestItem>();
            store.isItemSelectionnable = item => item.status === "active";
            store.list = [
                {id: 1, name: "Item 1", category: "A", status: "active"},
                {id: 2, name: "Item 2", category: "B", status: "inactive"}
            ];

            expect(store.selectionnableList).toHaveLength(1);
            expect(store.selectionnableList[0].status).toBe("active");
        });
    });
});
