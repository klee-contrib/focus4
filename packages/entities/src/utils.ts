import {output, ZodType} from "zod";

/**
 * Convertit une valeur string dans le type du schéma demandé.
 * @param value Valeur à convertir.
 */
export function stringToSchemaOutput<S extends ZodType>(value: string | undefined, schema: S) {
    if (schema.type === "string" && value) {
        return value as output<S>;
    }

    if (schema.type === "number" && value) {
        return Number.parseFloat(value) as output<S>;
    }

    if (schema.type === "boolean") {
        return (value === "true" ? true : value === "false" ? false : undefined) as output<S>;
    }

    return undefined;
}
