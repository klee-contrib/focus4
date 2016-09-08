import {EntityValue} from "../";
import {Structure, StructureEntry} from "./structure";

export interface Operation {
    id?: number;
    numero?: string;
    montant?: number;
    structure?: Structure;
}

export interface OperationEntry {
    id: EntityValue<number>;
    numero: EntityValue<string>;
    montant: EntityValue<string>;
    structure: EntityValue<StructureEntry>;
    set: (structure: Operation) => void;
}

export const OperationEntity = {
    name: "operation",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "operation.id"
        },
        numero: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "numero",
            translationKey: "operation.numero"
        },
        montant: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "montant",
            translationKey: "operation.montant"
        },
        structure: {
            type: "field",
            domain: {},
            entityName: "structure",
            isRequired: false,
            name: "structure",
            translationKey: "operation.structure"
        }
    }
};
