/* tslint:disable */

import {EntityField, StoreNode} from "../";
import {Structure, StructureNode} from "./structure";

export interface Operation {
    id?: number;
    numero?: string;
    montant?: number;
    structure?: Structure;
}

export interface OperationNode extends StoreNode<Operation> {
    id: EntityField<number>;
    numero: EntityField<string>;
    montant: EntityField<number>;
    structure: EntityField<StructureNode>;
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
