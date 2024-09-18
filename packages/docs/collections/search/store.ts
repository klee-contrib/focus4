import {CollectionStore} from "@focus4/stores";

export const collectionStore = new CollectionStore<{id: number; label: string; type1: string; type2: string}>({
    facetDefinitions: [
        {code: "type1", label: "Type 1", fieldName: "type1"},
        {code: "type2", label: "Type 2", fieldName: "type2"}
    ]
});
collectionStore.list = [
    {id: 1, label: "Item 1", type1: "A", type2: "T1"},
    {id: 2, label: "Item 2", type1: "A", type2: "T3"},
    {id: 3, label: "Item 3", type1: "B", type2: "T2"},
    {id: 4, label: "Item 4", type1: "B", type2: "T2"},
    {id: 5, label: "Item 5", type1: "B", type2: "T2"},
    {id: 6, label: "Item 6", type1: "C", type2: "T1"},
    {id: 7, label: "Item 7", type1: "C", type2: "T2"},
    {id: 8, label: "Item 8", type1: "C", type2: "T1"}
];
collectionStore.sortBy = "id";
collectionStore.sortAsc = true;
collectionStore.query = "clic";
