import z from "zod";

import {EntityToType, StoreNode} from "../types";

export type Structure = EntityToType<typeof StructureEntity>;
export type StructureNode = StoreNode<typeof StructureEntity>;

const numberDomain = {
    schema: z.number(),
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
} as const;
const stringDomain = {
    schema: z.string(),
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
} as const;

export const StructureEntity = {
    id: {
        type: "field",
        domain: numberDomain,
        isRequired: false,
        name: "id",
        label: "structure.id"
    },
    nom: {
        type: "field",
        domain: stringDomain,
        isRequired: true,
        name: "nom",
        label: "structure.nom"
    },
    siret: {
        type: "field",
        domain: stringDomain,
        isRequired: false,
        name: "siret",
        label: "structure.siret"
    }
} as const;
