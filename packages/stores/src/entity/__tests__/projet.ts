import {Domain, EntityToType, StoreNode} from "../types";
import {LigneEntity} from "./ligne";

export type Projet = EntityToType<typeof ProjetEntity>;
export type ProjetNode = StoreNode<typeof ProjetEntity>;

export const ProjetEntity = {
    id: {
        type: "field",
        fieldType: "number",
        domain: {} as Domain<number>,
        isRequired: false,
        name: "id",
        label: "projet.id"
    },
    ligneList: {
        type: "list",
        entity: LigneEntity
    }
} as const;
