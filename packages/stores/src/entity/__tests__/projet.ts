import {EntityToType, StoreNode} from "../types";
import {LigneEntity} from "./ligne";

export type Projet = EntityToType<typeof ProjetEntity>;
export type ProjetNode = StoreNode<typeof ProjetEntity>;

export const ProjetEntity = {
    id: {
        type: "field",
        domain: {
            type: "number",
            AutocompleteComponent: () => null,
            DisplayComponent: () => null,
            LabelComponent: () => null,
            InputComponent: () => null,
            SelectComponent: () => null
        },
        isRequired: false,
        name: "id",
        label: "projet.id"
    },
    ligneList: {
        type: "list",
        entity: LigneEntity
    }
} as const;
