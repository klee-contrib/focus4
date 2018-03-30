import {Entity} from "../types";
import {Structure, StructureEntity} from "./structure";

export interface Operation {
    id?: number;
    numero?: string;
    montant?: number;
    structure?: Structure;
}

export const OperationEntity: Entity<Operation> = {
    name: "operation",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "operation.id"
        },
        numero: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "numero",
            label: "operation.numero"
        },
        montant: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "montant",
            label: "operation.montant"
        },
        structure: {
            type: "object",
            entity: StructureEntity
        }
    }
};
