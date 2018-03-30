import {Ligne} from "./ligne";

export interface Projet {
    id?: number;
    ligneList?: Ligne[];
}

export const ProjetEntity = {
    name: "projet",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "projet.id"
        },
        ligneList: {
            type: "list" as "list",
            entityName: "ligne"
        }
    }
};
