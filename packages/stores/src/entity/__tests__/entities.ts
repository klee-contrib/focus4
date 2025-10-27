import z from "zod";

import {e, entity} from "@focus4/entities";

export const DO_NUMBER = {
    schema: z.number(),
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
};

export const DO_STRING = {
    schema: z.string(),
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
};

export const StructureEntity = entity({
    id: e.field(DO_NUMBER, f => f.optional()),
    nom: e.field(DO_STRING),
    siret: e.field(DO_STRING, f => f.optional())
});
export const OperationEntity = entity({
    id: e.field(DO_NUMBER, f => f.optional()),
    numero: e.field(DO_STRING),
    montant: e.field(DO_NUMBER, f => f.optional()),
    structure: e.object(StructureEntity)
});
export const LigneEntity = entity({id: e.field(DO_NUMBER)});
export const ProjetEntity = entity({
    id: e.field(DO_NUMBER, f => f.optional()),
    ligneList: e.list(LigneEntity)
});
