import z from "zod";

import {EntityToType, StoreNode} from "../types";

export type Ligne = EntityToType<typeof LigneEntity>;
export type LigneNode = StoreNode<typeof LigneEntity>;

export const LigneEntity = {
    id: {
        type: "field",
        domain: {
            schema: z.number(),
            AutocompleteComponent: () => null,
            DisplayComponent: () => null,
            LabelComponent: () => null,
            InputComponent: () => null,
            SelectComponent: () => null
        },
        isRequired: true,
        name: "id",
        label: "ligne.id"
    }
} as const;
