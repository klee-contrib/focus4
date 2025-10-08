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

type DefaultICProps<S extends z.ZodType> = S extends ZodTypeSingle ? InputProps<S> : {};
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

    const domain = {
        AutocompleteComponent: UndefinedComponent,
        DisplayComponent: Display,
        LabelComponent: Label,
        InputComponent: UndefinedComponent,
        SelectComponent: UndefinedComponent,
        schema: z.unknown(),
        ...d
    };

    const {type} = domain.schema;
    if (type === "string" || type === "number" || type === "boolean") {
        domain.AutocompleteComponent = AutocompleteSearch;
        domain.SelectComponent = Select;
        domain.InputComponent = Input;
    } else if (type === "array") {
        const {element} = domain.schema;
        if (element === "string" || element === "number" || element === "boolean") {
            domain.AutocompleteComponent = AutocompleteChips;
            domain.SelectComponent = SelectChips;
        }
    }

    return domain;
}
