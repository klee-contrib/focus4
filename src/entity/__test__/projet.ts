import {EntityField, EntityList, EntityArray} from "../";
import {Ligne, LigneData} from "./ligne";

export interface Projet {
    id?: number;
    ligneList?: Ligne[];
}

export interface ProjetData {
    id: EntityField<number>;
    ligneList: EntityList<EntityArray<LigneData>>;
    set: (structure: Projet) => void;
    clear: () => void;
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
        ligneList: {
            type: "list",
            entityName: "ligne"
        }
    }
};
