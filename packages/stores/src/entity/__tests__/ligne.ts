import {EntityToType, StoreNode} from "../types";

import {numberDomain} from "./domains";

export type Ligne = EntityToType<typeof LigneEntity>;
export type LigneNode = StoreNode<typeof LigneEntity>;

export const LigneEntity = {
    id: {
        type: "field",
        domain: numberDomain,
        isRequired: true,
        name: "id",
        label: "ligne.id"
    }
} as const;
