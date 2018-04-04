import {StoreNode} from "../types";
import {Structure, StructureEntity} from "./structure";

export interface Operation {
    id?: number;
    numero: string;
    montant?: number;
    structure: Structure;
}

export type OperationNode = StoreNode<typeof OperationEntity>;

export const OperationEntity = {
    name: "operation",
    fields: {
        id: {
            type: "field" as "field",
            fieldType: 0,
            domain: {},
            isRequired: false,
            name: "id",
            label: "operation.id"
        },
        numero: {
            type: "field" as "field",
            fieldType: "",
            domain: {},
            isRequired: true,
            name: "numero",
            label: "operation.numero"
        },
        montant: {
            type: "field" as "field",
            fieldType: 0,
            domain: {},
            isRequired: false,
            name: "montant",
            label: "operation.montant"
        },
        structure: {
            type: "object" as "object",
            entity: StructureEntity
        }
    }
};
