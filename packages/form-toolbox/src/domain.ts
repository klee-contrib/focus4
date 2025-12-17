import z from "zod";

import {
    isArraySchema,
    isBooleanSchema,
    isDateSchema,
    isNumberSchema,
    isStringSchema,
    ZodTypeMultiple,
    ZodTypeSingle
} from "@focus4/entities";
import {
    BaseAutocompleteProps,
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
      ? InputDateProps<S>
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
type FCProps = Omit<FieldOptions<any>, "onChange">;

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
    return {
        schema,
        DisplayComponent: Display,
        LabelComponent: Label,
        AutocompleteComponent:
            isBooleanSchema(schema) || isNumberSchema(schema) || isStringSchema(schema)
                ? AutocompleteSearch
                : isArraySchema(schema) &&
                    (isBooleanSchema(schema.element) ||
                        isNumberSchema(schema.element) ||
                        isStringSchema(schema.element))
                  ? AutocompleteChips
                  : UndefinedComponent,
        SelectComponent:
            isBooleanSchema(schema) || isNumberSchema(schema) || isStringSchema(schema)
                ? Select
                : isArraySchema(schema) &&
                    (isBooleanSchema(schema.element) ||
                        isNumberSchema(schema.element) ||
                        isStringSchema(schema.element))
                  ? SelectChips
                  : UndefinedComponent,
        InputComponent: isBooleanSchema(schema)
            ? BooleanRadio
            : isDateSchema(schema)
              ? InputDate
              : isStringSchema(schema) || isNumberSchema(schema)
                ? Input
                : UndefinedComponent,
        ...options
    } as Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>;
}
