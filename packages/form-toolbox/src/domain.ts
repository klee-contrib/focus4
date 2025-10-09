import {merge} from "es-toolkit";
import z from "zod";

import {FieldOptions} from "@focus4/forms";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    Domain,
    ReferenceList,
    UndefinedComponent,
    ZodTypeMultiple,
    ZodTypeSingle
} from "@focus4/stores";

import {
    AutocompleteChips,
    AutocompleteChipsProps,
    AutocompleteSearch,
    AutocompleteSearchProps,
    BooleanRadio,
    BooleanRadioProps,
    Display,
    DisplayProps,
    Input,
    InputDate,
    InputDateProps,
    InputProps,
    Label,
    LabelProps,
    Select,
    SelectChips,
    SelectChipsProps,
    SelectProps
} from "./components";

type DefaultICProps<S extends z.ZodType> = S extends z.ZodBoolean
    ? BooleanRadioProps
    : S extends z.ZodISODate
      ? InputDateProps
      : S extends ZodTypeSingle
        ? InputProps<S>
        : {};
type DefaultSCProps<S extends z.ZodType> = S extends ZodTypeSingle
    ? SelectProps<S>
    : S extends ZodTypeMultiple
      ? SelectChipsProps<S>
      : {values: ReferenceList};
type DefaultACProps<S extends z.ZodType> = S extends ZodTypeSingle
    ? AutocompleteSearchProps<S>
    : S extends ZodTypeMultiple
      ? AutocompleteChipsProps<S>
      : {};
type FCProps = Omit<FieldOptions<any>, "inputType" | "onChange" | "type">;

/**
 * Crée un domaine avec les composants par défaut du module `form-toolbox` à partir d'une définition complète.
 * @param domain Définition du domaine.
 */
export function domain<
    const S extends z.ZodType = z.ZodUnknown,
    // @ts-ignore
    ICProps extends BaseInputProps<S> = DefaultICProps<S>,
    SCProps extends BaseSelectProps<S> = DefaultSCProps<S>,
    // @ts-ignore
    ACProps extends BaseAutocompleteProps<S> = DefaultACProps<S>,
    DCProps extends BaseDisplayProps<S> = DisplayProps<S>,
    LCProps extends BaseLabelProps = LabelProps
>(
    domain: Partial<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>>
): Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;

/**
 * Crée un domaine avec les composants par défaut du module `form-toolbox` à partir d'un schéma Zod.
 * @param schema Schéma Zod pour le champ du domaine.
 */
export function domain<S extends z.ZodType = z.ZodUnknown>(
    schema?: S
): Domain<
    S,
    // @ts-ignore
    DefaultICProps<S>,
    DefaultSCProps<S>,
    // @ts-ignore
    DefaultACProps<S>,
    DisplayProps<S>,
    LabelProps,
    FCProps
>;
export function domain(d?: Partial<Domain> | z.ZodType): Domain {
    if (d && "_zod" in d) {
        d = {schema: d};
    }

    const schema: z.ZodType = d?.schema ?? z.unknown();

    const inputProps =
        isString(schema) && (schema.maxLength ?? 0) > 0
            ? {maxLength: schema.maxLength}
            : isDate(schema) && !d?.InputComponent
              ? {ISOStringFormat: "date-only"}
              : {};

    return {
        schema,
        DisplayComponent: Display,
        LabelComponent: Label,
        AutocompleteComponent:
            isBoolean(schema) || isNumber(schema) || isString(schema)
                ? AutocompleteSearch
                : isArray(schema) && (isBoolean(schema.element) || isNumber(schema.element) || isString(schema.element))
                  ? AutocompleteChips
                  : UndefinedComponent,
        SelectComponent:
            isBoolean(schema) || isNumber(schema) || isString(schema)
                ? Select
                : isArray(schema) && (isBoolean(schema.element) || isNumber(schema.element) || isString(schema.element))
                  ? SelectChips
                  : UndefinedComponent,
        InputComponent: isBoolean(schema)
            ? BooleanRadio
            : isDate(schema)
              ? InputDate
              : isString(schema) || isNumber(schema)
                ? Input
                : UndefinedComponent,
        displayFormatter: isBoolean(schema) ? v => (v ? "focus.boolean.yes" : "focus.boolean.no") : undefined,
        ...d,
        inputProps: merge(inputProps, d?.inputProps ?? {})
    };
}

function isArray(schema: z.ZodType): schema is z.ZodArray<z.ZodType> {
    return schema.type === "array";
}

function isBoolean(schema: z.ZodType): schema is z.ZodBoolean {
    return schema.type === "boolean";
}

function isDate(schema: z.ZodType): schema is z.ZodISODate {
    return (schema as z.ZodString).format === "date";
}

function isNumber(schema: z.ZodType): schema is z.ZodNumber {
    return schema.type === "number";
}

function isString(schema: z.ZodType): schema is z.ZodString {
    return schema.type === "string";
}
