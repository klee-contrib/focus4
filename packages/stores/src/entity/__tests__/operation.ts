import {EntityToType, StoreNode} from "../types";
import {StructureEntity} from "./structure";

export type Operation = EntityToType<typeof OperationEntity>;
export type OperationNode = StoreNode<typeof OperationEntity>;

export const OperationEntity = {
    id: {
        type: "field",
        domain: {type: "number"},
        isRequired: false,
        name: "id",
        label: "operation.id"
    },
    numero: {
        type: "field",
        domain: {type: "string"},
        isRequired: true,
        name: "numero",
        label: "operation.numero"
    },
    montant: {
        type: "field",
        domain: {type: "number"},
        isRequired: false,
        name: "montant",
        label: "operation.montant"
    },
    structure: {
        type: "object",
        entity: StructureEntity
    }
} as const;
