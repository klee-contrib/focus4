import {Domain, EntityToType, StoreNode} from "../types";

export type Structure = EntityToType<typeof StructureEntity>;
export type StructureNode = StoreNode<typeof StructureEntity>;

export const StructureEntity = {
    id: {
        type: "field",
        fieldType: "number",
        domain: {} as Domain<number>,
        isRequired: false,
        name: "id",
        label: "structure.id"
    },
    nom: {
        type: "field",
        fieldType: "string",
        domain: {} as Domain<string>,
        isRequired: true,
        name: "nom",
        label: "structure.nom"
    },
    siret: {
        type: "field",
        fieldType: "string",
        domain: {} as Domain<string>,
        isRequired: false,
        name: "siret",
        label: "structure.siret"
    }
} as const;
