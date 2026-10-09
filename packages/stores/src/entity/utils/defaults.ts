import z from "zod";

import {isBooleanSchema, isDateSchema, isDateTimeSchema, isNumberSchema} from "@focus4/entities";

/** Composant de domaine/champ non défini (vide). */
export function UndefinedComponent() {
    return null;
}

const toString = (x: any) => `${x ?? ""}`;

const numberFormat = {};

/** Retourne le formatter par défaut pour un schéma donné. */
export function getDefaultFormatter(schema: z.ZodType) {
    return isBooleanSchema(schema)
        ? "focus.boolean"
        : isDateSchema(schema)
          ? "focus.date"
          : isDateTimeSchema(schema)
            ? "focus.datetime"
            : isNumberSchema(schema)
              ? numberFormat
              : toString;
}
