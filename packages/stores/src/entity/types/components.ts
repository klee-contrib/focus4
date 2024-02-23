import {CSSProperties, ReactNode} from "react";

import {ReferenceList} from "../../reference";

import {DomainFieldType} from "./entity";

export interface WithThemeProps {
    theme?: object;
}

export type OmitButKeepTheme<T extends WithThemeProps, U> = Pick<T, Exclude<keyof T, keyof U>> & {theme?: T["theme"]};

export interface BaseInputProps extends WithThemeProps {
    error?: string;
    id?: string;
    name?: string;
    onChange?: (value: any) => void;
    type?: DomainFieldType;
    value?: any;
}

export interface BaseSelectProps extends BaseInputProps {
    values?: ReferenceList;
}

export interface BaseAutocompleteProps extends BaseInputProps {
    keyResolver?: (key: any) => Promise<string | undefined>;
}

export interface BaseDisplayProps extends WithThemeProps {
    formatter?: (value: any) => string;
    keyResolver?: (key: any) => Promise<string | undefined>;
    type?: DomainFieldType;
    value?: any;
    values?: ReferenceList;
}

export interface BaseLabelProps extends WithThemeProps {
    comment?: ReactNode;
    label?: string;
    id?: string;
    style?: CSSProperties;
}

export interface BaseComponents<DCProps extends BaseDisplayProps, LCProps extends BaseLabelProps> {
    /** Props pour le composant d'affichage */
    displayProps?: Partial<OmitButKeepTheme<DCProps, BaseDisplayProps>>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<OmitButKeepTheme<LCProps, BaseLabelProps>>;
}

export interface InputComponents<
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'input. */
    inputProps?: Partial<OmitButKeepTheme<ICProps, BaseInputProps>>;
}

export interface SelectComponents<
    SCProps extends BaseSelectProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant de select. */
    selectProps?: Partial<OmitButKeepTheme<SCProps, BaseSelectProps>>;
}

export interface AutocompleteComponents<
    ACProps extends BaseAutocompleteProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'autocomplete. */
    autocompleteProps?: Partial<OmitButKeepTheme<ACProps, BaseAutocompleteProps>>;
}

export interface FieldComponents<
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any,
    FProps extends WithThemeProps = any
> extends InputComponents<ICProps, DCProps, LCProps>,
        SelectComponents<SCProps, DCProps, LCProps>,
        AutocompleteComponents<ACProps, DCProps, LCProps> {
    /** Props pour le composant de champ. */
    fieldProps?: FProps;
}
