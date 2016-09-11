import {EntityValue} from "../";

export interface Ligne {
    id?: number;
}

export interface LigneData {
    id: EntityValue<number>;
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
