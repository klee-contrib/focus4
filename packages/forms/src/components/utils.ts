import {DomainFieldType, DomainType, SimpleDomainFieldType} from "@focus4/stores";

export function stringToDomainType<T extends DomainFieldType>(value: string | undefined, type: T) {
    if (type === "string" && value) {
        return value as DomainType<T>;
    }

    if (type === "number" && value) {
        return parseFloat(value) as DomainType<T>;
    }

    if (type === "boolean") {
        return (value === "true" ? true : value === "false" ? false : undefined) as DomainType<T>;
    }

    return undefined;
}

export function toSimpleType<T extends DomainFieldType>(type: T) {
    return (
        type === "boolean-array" || type === "boolean"
            ? "boolean"
            : type === "number-array" || type === "number"
            ? "number"
            : "string"
    ) as SimpleDomainFieldType<T>;
}
