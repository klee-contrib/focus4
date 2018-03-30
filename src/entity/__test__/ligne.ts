import {EntityField, StoreNode} from "../types";

export interface Ligne {
    id?: number;
}

export interface LigneNode extends StoreNode<Ligne> {
    id: EntityField<number>;
}

export const LigneEntity = {
    name: "ligne",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "ligne.id"
        }
    }
};
