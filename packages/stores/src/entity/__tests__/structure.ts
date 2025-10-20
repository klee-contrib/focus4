import {EntityToType, StoreNode} from "../types";

import {numberDomain, stringDomain} from "./domains";

export type Structure = EntityToType<typeof StructureEntity>;
export type StructureNode = StoreNode<typeof StructureEntity>;

export const StructureEntity = {
    id: {
        type: "field",
        domain: numberDomain,
        isRequired: false,
        name: "id",
        label: "structure.id"
    },
    nom: {
        type: "field",
        domain: stringDomain,
        isRequired: true,
        name: "nom",
        label: "structure.nom"
    },
    siret: {
        type: "field",
        domain: stringDomain,
        isRequired: false,
        name: "siret",
        label: "structure.siret"
    }
} as const;
