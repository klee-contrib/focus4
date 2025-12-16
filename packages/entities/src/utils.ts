import {
    output,
    ZodArray,
    ZodBoolean,
    ZodInt,
    ZodInt32,
    ZodISODate,
    ZodISODateTime,
    ZodNumber,
    ZodString,
    ZodType
} from "zod";

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

/**
 * Teste si le schéma est un schéma array.
 * @param schema Le schéma.
 */
export function isArraySchema(schema: ZodType): schema is ZodArray<ZodType> {
    return schema.type === "array";
}

/**
 * Teste si le schéma est un schéma boolean.
 * @param schema Le schéma.
 */
export function isBooleanSchema(schema: ZodType): schema is ZodBoolean {
    return schema.type === "boolean";
}

/**
 * Teste si le schéma est un schéma date.
 * @param schema Le schéma.
 */
export function isDateSchema(schema: ZodType): schema is ZodISODate {
    return (schema as ZodString).format === "date";
}

/**
 * Teste si le schéma est un schéma datetime.
 * @param schema Le schéma.
 */
export function isDateTimeSchema(schema: ZodType): schema is ZodISODateTime {
    return (schema as ZodString).format === "datetime";
}

/**
 * Teste si le schéma est un schéma int.
 * @param schema Le schéma.
 */
export function isIntSchema(schema: ZodType): schema is ZodInt32 | ZodInt {
    const {format} = schema as ZodNumber;
    return format === "int32" || format === "safeint";
}

/**
 * Teste si le schéma est un schéma number.
 * @param schema Le schéma.
 */
export function isNumberSchema(schema: ZodType): schema is ZodNumber {
    return schema.type === "number";
}

/**
 * Teste si le schéma est un schéma string.
 * @param schema Le schéma.
 */
export function isStringSchema(schema: ZodType): schema is ZodString {
    return schema.type === "string";
}
