import {EntityToType, StoreNode} from "../types";
import {StructureEntity} from "./structure";

export type Operation = EntityToType<typeof OperationEntity>;
export type OperationNode = StoreNode<typeof OperationEntity>;

const numberDomain = {
    type: "number",
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
} as const;
const stringDomain = {
    type: "string",
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
} as const;

export const OperationEntity = {
    id: {
        type: "field",
        domain: numberDomain,
        isRequired: false,
        name: "id",
        label: "operation.id"
    },
    numero: {
        type: "field",
        domain: stringDomain,
        isRequired: true,
        name: "numero",
        label: "operation.numero"
    },
    montant: {
        type: "field",
        domain: numberDomain,
        isRequired: false,
        name: "montant",
        label: "operation.montant"
    },
    structure: {
        type: "object",
        entity: StructureEntity
    }
} as const;
