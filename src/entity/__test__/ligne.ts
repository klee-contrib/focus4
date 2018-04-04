import {StoreNode} from "../types";

export interface Ligne {
    id?: number;
}

export type LigneNode = StoreNode<typeof LigneEntity>;

export const LigneEntity = {
    name: "ligne",
    fields: {
        id: {
            type: "field" as "field",
            fieldType: 0,
            domain: {},
            isRequired: true,
            name: "id",
            label: "ligne.id"
        }
    }
};
