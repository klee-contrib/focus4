import {StoreNode} from "../types";

export interface Structure {
    id?: number;
    nom: string;
    siret?: string;
}

export type StructureNode = StoreNode<typeof StructureEntity>;

export const StructureEntity = {
    name: "structure",
    fields: {
        id: {
            type: "field" as "field",
            fieldType: 0,
            domain: {},
            isRequired: false,
            name: "id",
            label: "structure.id"
        },
        nom: {
            type: "field" as "field",
            fieldType: "",
            domain: {},
            isRequired: true,
            name: "nom",
            label: "structure.nom"
        },
        siret: {
            type: "field" as "field",
            fieldType: "",
            domain: {},
            isRequired: false,
            name: "siret",
            label: "structure.siret"
        }
    }
};
