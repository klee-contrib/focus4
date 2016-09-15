import {EntityField, ClearSet} from "../";
import {Structure, StructureData} from "./structure";

export interface Operation {
    id?: number;
    numero?: string;
    montant?: number;
    structure?: Structure;
}

export interface OperationData extends ClearSet<Operation> {
    id: EntityField<number>;
    numero: EntityField<string>;
    montant: EntityField<string>;
    structure: EntityField<StructureData>;
}

export const OperationEntity = {
    name: "operation",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "operation.id"
        },
        numero: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "numero",
            translationKey: "operation.numero"
        },
        montant: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "montant",
            translationKey: "operation.montant"
        },
        structure: {
            type: "field" as "field",
            domain: {},
            entityName: "structure",
            isRequired: false,
            name: "structure",
            translationKey: "operation.structure"
        }
    }
};
