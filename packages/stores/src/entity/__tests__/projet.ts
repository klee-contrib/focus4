import {EntityToType, StoreNode} from "../types";
import {LigneEntity} from "./ligne";

export type Projet = EntityToType<typeof ProjetEntity>;
export type ProjetNode = StoreNode<typeof ProjetEntity>;

export const ProjetEntity = {
    name: "projet",
    fields: {
        id: {
            type: "field",
            fieldType: "number",
            domain: {},
            isRequired: false,
            name: "id",
            label: "projet.id"
        },
        ligneList: {
            type: "list",
            entity: LigneEntity
        }
    }
} as const;
