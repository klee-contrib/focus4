import {EntityValue, EntityArray} from "../";
import {Operation, OperationEntry} from "./operation";

export interface Projet {
    id?: number;
    operationList?: Operation[];
}

export interface ProjetEntry {
    id: EntityValue<number>;
    operationList: EntityValue<EntityArray<OperationEntry>>;
    set: (structure: Projet) => void;
}

export const ProjetEntity = {
    name: "projet",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "projet.id"
        },
        operationList: {
            type: "list",
            entityName: "operation"
        }
    }
};
