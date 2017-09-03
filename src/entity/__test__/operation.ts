/* tslint:disable */

import {StoreNode} from "../store";
import {EntityField} from "../types";
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
    structure: StructureNode;
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
            type: "object" as "object",
            entityName: "structure"
        }
    }
};
