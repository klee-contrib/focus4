import {EntityField, StoreListNode, StoreNode} from "../types";
import {Ligne, LigneNode} from "./ligne";

export interface Projet {
    id?: number;
    ligneList?: Ligne[];
}

export interface ProjetNode extends StoreNode<Projet>  {
    id: EntityField<number>;
    ligneList: StoreListNode<LigneNode>;
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
