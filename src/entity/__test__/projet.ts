import {EntityField, EntityList, StoreListNode, StoreNode} from "../";
import {Ligne, LigneNode} from "./ligne";

export interface Projet {
    id?: number;
    ligneList?: Ligne[];
}

export interface ProjetNode extends StoreNode<Projet>  {
    id: EntityField<number>;
    ligneList: EntityList<StoreListNode<LigneNode>>;
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
