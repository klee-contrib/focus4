import z from "zod";

const EmptyComponent = () => null;

export function domain<S extends z.ZodTypeAny>(schema: S, overrides: Partial<Domain<S>> = {}) {
    return {
        schema,
        AutocompleteComponent: EmptyComponent,
        DisplayComponent: EmptyComponent,
        LabelComponent: EmptyComponent,
        InputComponent: EmptyComponent,
        SelectComponent: EmptyComponent,
        ...overrides
    } as Domain<S>;
}
