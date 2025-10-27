import {merge} from "es-toolkit";
import z from "zod";

import {ZodTypeMultiple, ZodTypeSingle} from "@focus4/entities";
import {FieldOptions} from "@focus4/forms";
import {
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    ReferenceList,
    UndefinedComponent
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
 * Crée un domaine avec les composants par défaut du module `form-toolbox`.
 * @param schema Schéma Zod pour le champ du domaine.
 * @param options Options pour le domaine.
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
    schema: S = z.unknown() as unknown as S,
    options?: Omit<Partial<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>>, "schema">
) {
    const displayFormatter = isBoolean(schema)
        ? "focus.boolean"
        : isDate(schema)
          ? "focus.date"
          : isDateTime(schema)
            ? "focus.datetime"
            : undefined;

    const inputProps: any = {};

    if (!options?.InputComponent) {
        if (isString(schema) && (schema.maxLength ?? 0) > 0) {
            (inputProps as InputProps<typeof schema>).maxLength = schema.maxLength ?? 0;
        }

        if (isNumber(schema) && schema.minValue !== null && schema.minValue !== undefined && schema.minValue >= 0) {
            (inputProps as InputProps<typeof schema>).noNegativeNumbers = true;
        }

        if (isInt(schema)) {
            (inputProps as InputProps<typeof schema>).maxDecimals = 0;
        }

        if (isDate(schema)) {
            (inputProps as InputDateProps).ISOStringFormat = "date-only";
        }
    }

    return {
        schema,
        displayFormatter,
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
        ...options,
        inputProps: merge(inputProps, options?.inputProps ?? {})
    } as Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>;
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

function isDateTime(schema: z.ZodType): schema is z.ZodISODateTime {
    return (schema as z.ZodString).format === "datetime";
}

function isInt(schema: z.ZodType): schema is z.ZodInt32 | z.ZodInt {
    const {format} = schema as z.ZodNumber;
    return format === "int32" || format === "safeint";
}

function isNumber(schema: z.ZodType): schema is z.ZodNumber {
    return schema.type === "number";
}

function isString(schema: z.ZodType): schema is z.ZodString {
    return schema.type === "string";
}
