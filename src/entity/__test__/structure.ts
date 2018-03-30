import {Entity} from "../types";

export interface Structure {
    id?: number;
    nom?: string;
    siret?: string;
}

export const StructureEntity: Entity<Structure> = {
    name: "structure",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "structure.id"
        },
        nom: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "nom",
            label: "structure.nom"
        },
        siret: {
            type: "field",
            domain: {},
            isRequired: false,
            name: "siret",
            label: "structure.siret"
        }
    }
};
