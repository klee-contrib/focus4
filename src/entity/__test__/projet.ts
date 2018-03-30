import {Entity} from "../types";
import {Ligne, LigneEntity} from "./ligne";

export interface Projet {
    id?: number;
    ligneList?: Ligne[];
}

export const ProjetEntity: Entity<Projet> = {
    name: "projet",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "projet.id"
        },
        ligneList: {
            type: "list",
            entity: LigneEntity
        }
    }
};
