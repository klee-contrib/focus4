import {EntityToType, StoreNode} from "../types";

import {numberDomain} from "./domains";
import {LigneEntity} from "./ligne";

export type Projet = EntityToType<typeof ProjetEntity>;
export type ProjetNode = StoreNode<typeof ProjetEntity>;

export const ProjetEntity = {
    id: {
        type: "field",
        domain: numberDomain,
        isRequired: false,
        name: "id",
        label: "projet.id"
    },
    ligneList: {
        type: "list",
        entity: LigneEntity
    }
} as const;
