import {Domain, EntityToType, StoreNode} from "../types";

export type Ligne = EntityToType<typeof LigneEntity>;
export type LigneNode = StoreNode<typeof LigneEntity>;

export const LigneEntity = {
    id: {
        type: "field",
        fieldType: "number",
        domain: {} as Domain<number>,
        isRequired: true,
        name: "id",
        label: "ligne.id"
    }
} as const;
