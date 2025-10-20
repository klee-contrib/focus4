import z from "zod";

export const numberDomain = {
    schema: z.number(),
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
};

export const stringDomain = {
    schema: z.string(),
    AutocompleteComponent: () => null,
    DisplayComponent: () => null,
    LabelComponent: () => null,
    InputComponent: () => null,
    SelectComponent: () => null
};
