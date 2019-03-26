import {EntityToType, StoreNode} from "../types";
import {LigneEntity} from "./ligne";

export type Projet = EntityToType<typeof ProjetEntity>;
export type ProjetNode = StoreNode<typeof ProjetEntity>;

export const ProjetEntity = {
    name: "projet",
    fields: {
        id: {
            type: "field" as "field",
            fieldType: 0,
            domain: {},
            isRequired: false,
            name: "id",
            label: "projet.id"
        },
        ligneList: {
            type: "list" as "list",
            entity: LigneEntity
        }
    }
};
