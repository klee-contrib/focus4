export interface Structure {
    id?: number;
    nom?: string;
    siret?: string;
}

export const StructureEntity = {
    name: "structure",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "structure.id"
        },
        nom: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "nom",
            label: "structure.nom"
        },
        siret: {
            type: "field" as "field",
            domain: {},
            isRequired: false,
            name: "siret",
            label: "structure.siret"
        }
    }
};
