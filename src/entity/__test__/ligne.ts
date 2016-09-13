import {EntityField} from "../";

export interface Ligne {
    id?: number;
}

export interface LigneData {
    id: EntityField<number>;
    set: (structure: Ligne) => void;
    clear: () => void;
}

export const LigneEntity = {
    name: "ligne",
    fields: {
        id: {
            type: "field",
            domain: {},
            isRequired: true,
            name: "id",
            translationKey: "ligne.id"
        }
    }
};
