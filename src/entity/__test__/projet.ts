import {StoreNode} from "../types";
import {Ligne, LigneEntity} from "./ligne";

export interface Projet {
    id?: number;
    ligneList: Ligne[];
}

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
