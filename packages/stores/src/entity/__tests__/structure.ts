import {EntityToType, StoreNode} from "../types";

export type Structure = EntityToType<typeof StructureEntity>;
export type StructureNode = StoreNode<typeof StructureEntity>;

export const StructureEntity = {
    name: "structure",
    fields: {
        id: {
            type: "field",
            fieldType: "number",
            domain: {},
            isRequired: false,
            name: "id",
            label: "structure.id"
        },
        nom: {
            type: "field",
            fieldType: "string",
            domain: {},
            isRequired: true,
            name: "nom",
            label: "structure.nom"
        },
        siret: {
            type: "field",
            fieldType: "string",
            domain: {},
            isRequired: false,
            name: "siret",
            label: "structure.siret"
        }
    }
} as const;
