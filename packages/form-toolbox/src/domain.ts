import {ZodType} from "zod";

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
    Display,
    DisplayProps,
    Input,
    InputProps,
    Label,
    LabelProps,
    Select,
    SelectChips,
    SelectChipsProps,
    SelectProps
} from "./components";

type DefaultICProps<S extends ZodType> = S extends ZodTypeSingle ? InputProps<S> : {};
type DefaultSCProps<S extends ZodType> = S extends ZodTypeSingle
    ? SelectProps<S>
    : S extends ZodTypeMultiple
      ? SelectChipsProps<S>
      : {values: ReferenceList};
type DefaultACProps<S extends ZodType> = S extends ZodTypeSingle
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
    const S extends ZodType,
    ICProps extends BaseInputProps<S> = DefaultICProps<S>,
    SCProps extends BaseSelectProps<S> = DefaultSCProps<S>,
    // @ts-ignore
    ACProps extends BaseAutocompleteProps<S> = DefaultACProps<S>,
    DCProps extends BaseDisplayProps<S> = DisplayProps<S>,
    LCProps extends BaseLabelProps = LabelProps
>(
    domain: Partial<Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, FCProps>> & {schema: S}
): Domain<S, ICProps, SCProps, ACProps, DCProps, LCProps, Omit<FieldOptions<any>, "inputType" | "onChange" | "type">>;

/**
 * Crée un domaine avec les composants par défaut du module `form-toolbox` à partir d'un schéma Zod.
 * @param schema Schéma Zod pour le champ du domaine.
 */
export function domain<S extends ZodType>(
    schema: S
): Domain<
    S,
    DefaultICProps<S>,
    DefaultSCProps<S>,
    // @ts-ignore
    DefaultACProps<S>,
    DisplayProps<S>,
    LabelProps,
    FCProps
>;
export function domain(d: (Partial<Domain> & {schema: ZodType}) | ZodType): Domain {
    if (!("schema" in d)) {
        d = {schema: d};
    }

    const domain = {
        AutocompleteComponent: UndefinedComponent,
        DisplayComponent: Display,
        LabelComponent: Label,
        InputComponent: UndefinedComponent,
        SelectComponent: UndefinedComponent,
        ...d
    };

    switch (d.schema.type) {
        case "string":
        case "number":
        case "boolean":
            domain.AutocompleteComponent = AutocompleteSearch;
            domain.SelectComponent = Select;
            domain.InputComponent = Input;
            break;
        case "array":
            domain.AutocompleteComponent = AutocompleteChips;
            domain.SelectComponent = SelectChips;
            break;
        default:
            break;
    }

    return domain;
}
