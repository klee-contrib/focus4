import {EntityField, EntityList, EntityArray, ClearSet} from "../";
import {Ligne, LigneData} from "./ligne";

export interface Projet {
    id?: number;
    ligneList?: Ligne[];
}

export interface ProjetData extends ClearSet<Projet>  {
    id: EntityField<number>;
    ligneList: EntityList<EntityArray<LigneData>>;
}

export const ProjetEntity = {
    name: "projet",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "projet.id"
        },
        ligneList: {
            type: "list" as "list",
            entityName: "ligne"
        }
    }
};
