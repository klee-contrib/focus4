import {EntityField} from "../types";

export interface Structure {
    id?: number;
    nom?: string;
    siret?: string;
}

export interface StructureData {
    id: EntityField<number>;
    nom: EntityField<string>;
    siret: EntityField<string>;
    set: (structure: Structure) => void;
    clear: () => void;
}

export const StructureEntity = {
    name: "structure",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "structure.id"
        },
        nom: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "nom",
            translationKey: "structure.nom"
        },
        siret: {
            type: "field",
            domain: {},
            isRequired: false,
            name: "siret",
            translationKey: "structure.siret"
        }
    }
};
