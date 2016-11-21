import {EntityField, StoreNode} from "../";

export interface Structure {
    id?: number;
    nom?: string;
    siret?: string;
}

export interface StructureNode extends StoreNode<Structure> {
    id: EntityField<number>;
    nom: EntityField<string>;
    siret: EntityField<string>;
}

export const StructureEntity = {
    name: "structure",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "structure.id"
        },
        nom: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "nom",
            translationKey: "structure.nom"
        },
        siret: {
            type: "field" as "field",
            domain: {},
            isRequired: false,
            name: "siret",
            translationKey: "structure.siret"
        }
    }
};
