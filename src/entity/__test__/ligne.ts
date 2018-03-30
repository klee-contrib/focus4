import {Entity} from "../types";

export interface Ligne {
    id?: number;
}

export const LigneEntity: Entity<Ligne> = {
    name: "ligne",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "ligne.id"
        }
    }
};
