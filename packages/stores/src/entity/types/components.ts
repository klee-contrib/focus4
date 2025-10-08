import {ReactNode} from "react";
import {output, ZodType} from "zod";

import {ReferenceList} from "../../reference";

import {SingleZodType} from "./entity";

export interface BaseComponentProps {
    comment?: ReactNode;
    error?: string;
    label?: string;
    name?: string;
    id?: string;
    required?: boolean;
    theme?: object;
}

export type OmitButKeepTheme<T extends BaseComponentProps, U> = Pick<T, Exclude<keyof T, keyof U>> & {
    theme?: T["theme"];
};

export interface BaseInputProps<S extends ZodType> extends BaseComponentProps {
    onChange?: (value?: output<S>) => void;
    schema?: S;
    value?: output<S>;
}

export interface BaseSelectProps<S extends ZodType> extends BaseInputProps<S> {
    values: ReferenceList;
}

export interface BaseAutocompleteProps<S extends ZodType> extends BaseInputProps<S> {
    keyResolver?: (key: output<SingleZodType<S>>) => Promise<string | undefined>;
}

export interface BaseDisplayProps<S extends ZodType> extends BaseComponentProps {
    formatter?: (value: output<SingleZodType<S>> | undefined) => string;
    keyResolver?: (key: output<SingleZodType<S>>) => Promise<string | undefined>;
    schema?: S;
    value?: output<S>;
    values?: ReferenceList;
}

export interface BaseLabelProps extends BaseComponentProps {
    edit?: boolean;
}

export interface BaseComponents<
    S extends ZodType,
    DCProps extends BaseDisplayProps<S>,
    LCProps extends BaseLabelProps
> {
    /** Props pour le composant d'affichage */
    displayProps?: Partial<OmitButKeepTheme<DCProps, BaseDisplayProps<S>>>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<OmitButKeepTheme<LCProps, BaseLabelProps>>;
}

export interface InputComponents<
    S extends ZodType,
    ICProps extends BaseInputProps<S>,
    DCProps extends BaseDisplayProps<S>,
    LCProps extends BaseLabelProps
> extends BaseComponents<S, DCProps, LCProps> {
    /** Props pour le composant d'input. */
    inputProps?: Partial<OmitButKeepTheme<ICProps, BaseInputProps<S>>>;
}

export interface SelectComponents<
    S extends ZodType,
    SCProps extends BaseSelectProps<S>,
    DCProps extends BaseDisplayProps<S>,
    LCProps extends BaseLabelProps
> extends BaseComponents<S, DCProps, LCProps> {
    /** Props pour le composant de select. */
    selectProps?: Partial<OmitButKeepTheme<SCProps, BaseSelectProps<S>>>;
}

export interface AutocompleteComponents<
    S extends ZodType,
    ACProps extends BaseAutocompleteProps<S>,
    DCProps extends BaseDisplayProps<S>,
    LCProps extends BaseLabelProps
> extends BaseComponents<S, DCProps, LCProps> {
    /** Props pour le composant d'autocomplete. */
    autocompleteProps?: Partial<OmitButKeepTheme<ACProps, BaseAutocompleteProps<S>>>;
}

export interface FieldComponents<
    S extends ZodType,
    ICProps extends BaseInputProps<S> = any,
    SCProps extends BaseSelectProps<S> = any,
    ACProps extends BaseAutocompleteProps<S> = any,
    DCProps extends BaseDisplayProps<S> = any,
    LCProps extends BaseLabelProps = any,
    FProps extends {theme?: object} = any
> extends InputComponents<S, ICProps, DCProps, LCProps>,
        SelectComponents<S, SCProps, DCProps, LCProps>,
        AutocompleteComponents<S, ACProps, DCProps, LCProps> {
    /** Props pour le composant de champ. */
    fieldProps?: FProps;
}
