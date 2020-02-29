import {EntityToType, StoreNode} from "../types";

export type Structure = EntityToType<typeof StructureEntity>;
export type StructureNode = StoreNode<typeof StructureEntity>;

export const StructureEntity = {
    id: {
        type: "field",
        domain: {type: "number"},
        isRequired: false,
        name: "id",
        label: "structure.id"
    },
    nom: {
        type: "field",
        domain: {type: "string"},
        isRequired: true,
        name: "nom",
        label: "structure.nom"
    },
    siret: {
        type: "field",
        domain: {type: "string"},
        isRequired: false,
        name: "siret",
        label: "structure.siret"
    }
} as const;
