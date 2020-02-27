import {ReferenceList} from "../../reference";

export type OmitWithTheme<T extends {theme?: object}, U> = Pick<T, Exclude<keyof T, keyof U>> & {theme?: T["theme"]};

export interface BaseInputProps {
    error?: React.ReactNode;
    id?: string;
    name?: string;
    onChange?: (value: any) => void;
    type?: string;
    theme?: object;
    value?: any;
}

export interface BaseSelectProps extends BaseInputProps {
    values: ReferenceList;
}

export interface BaseAutocompleteProps extends BaseInputProps {
    keyResolver?: (key: any) => Promise<string | undefined>;
}

export interface BaseDisplayProps {
    formatter?: (value: any) => string;
    keyResolver?: (key: any) => Promise<string | undefined>;
    value?: any;
    values?: ReferenceList;
    theme?: object;
}

export interface BaseLabelProps {
    comment?: React.ReactNode;
    i18nPrefix?: string;
    label?: string;
    id?: string;
    style?: React.CSSProperties;
    theme?: object;
}

export interface BaseComponents<DCProps extends BaseDisplayProps, LCProps extends BaseLabelProps> {
    /** Props pour le composant d'affichage */
    displayProps?: Partial<OmitWithTheme<DCProps, BaseDisplayProps>>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<OmitWithTheme<LCProps, BaseLabelProps>>;
}

export interface InputComponents<
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'input. */
    inputProps?: Partial<OmitWithTheme<ICProps, BaseInputProps>>;
}

export interface SelectComponents<
    SCProps extends BaseSelectProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant de select. */
    selectProps?: Partial<OmitWithTheme<SCProps, BaseSelectProps>>;
}

export interface AutocompleteComponents<
    ACProps extends BaseAutocompleteProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'autocomplete. */
    autocompleteProps?: Partial<OmitWithTheme<ACProps, BaseAutocompleteProps>>;
}

export interface FieldComponents<
    ICProps extends BaseInputProps = any,
    SCProps extends BaseSelectProps = any,
    ACProps extends BaseAutocompleteProps = any,
    DCProps extends BaseDisplayProps = any,
    LCProps extends BaseLabelProps = any
>
    extends InputComponents<ICProps, DCProps, LCProps>,
        SelectComponents<SCProps, DCProps, LCProps>,
        AutocompleteComponents<ACProps, DCProps, LCProps> {}
