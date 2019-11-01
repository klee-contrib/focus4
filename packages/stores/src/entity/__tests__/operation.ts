import {Domain, EntityToType, StoreNode} from "../types";
import {StructureEntity} from "./structure";

export type Operation = EntityToType<typeof OperationEntity>;
export type OperationNode = StoreNode<typeof OperationEntity>;

export const OperationEntity = {
    id: {
        type: "field",
        fieldType: "number",
        domain: {} as Domain<number>,
        isRequired: false,
        name: "id",
        label: "operation.id"
    },
    numero: {
        type: "field",
        fieldType: "string",
        domain: {} as Domain<string>,
        isRequired: true,
        name: "numero",
        label: "operation.numero"
    },
    montant: {
        type: "field",
        fieldType: "number",
        domain: {} as Domain<number>,
        isRequired: false,
        name: "montant",
        label: "operation.montant"
    },
    structure: {
        type: "object",
        entity: StructureEntity
    }
} as const;
