import {Structure} from "./structure";

export interface Operation {
    id?: number;
    numero?: string;
    montant?: number;
    structure?: Structure;
}

export const OperationEntity = {
    name: "operation",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "operation.id"
        },
        numero: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "numero",
            label: "operation.numero"
        },
        montant: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "montant",
            label: "operation.montant"
        },
        structure: {
            type: "object" as "object",
            entityName: "structure"
        }
    }
};
