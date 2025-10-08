import {output, ZodType} from "zod";

export function stringToSchemaOutput<T extends ZodType>(value: string | undefined, schema: T) {
    if (schema.type === "string" && value) {
        return value as output<T>;
    }

    if (schema.type === "number" && value) {
        return Number.parseFloat(value) as output<T>;
    }

    if (schema.type === "boolean") {
        return (value === "true" ? true : value === "false" ? false : undefined) as output<T>;
    }

    return undefined;
}
