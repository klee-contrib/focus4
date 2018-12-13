export type Omit<T extends {theme?: object}, U> = Pick<T, Exclude<keyof T, keyof U>> & {theme?: T["theme"]};

export interface BaseInputProps {
    error?: React.ReactNode;
    id?: string;
    name?: string;
    onChange?: (value: any) => void;
    theme?: object;
    value?: any;
}

export interface BaseSelectProps extends BaseInputProps {
    labelKey: string;
    valueKey: string;
    values: {}[];
}

export interface BaseAutocompleteProps extends BaseInputProps {
    keyResolver?: (key: any) => Promise<string | undefined>;
}

export interface BaseDisplayProps {
    formatter?: (value: any) => string;
    keyResolver?: (key: any) => Promise<string | undefined>;
    labelKey?: string;
    value?: any;
    valueKey?: string;
    values?: object[];
    theme?: object;
}

export interface BaseLabelProps {
    comment?: React.ReactNode;
    i18nPrefix?: string;
    label?: string;
    name?: string;
    style?: React.CSSProperties;
    theme?: object;
}

export interface BaseComponents<DCProps extends BaseDisplayProps, LCProps extends BaseLabelProps> {
    /** Props pour le composant d'affichage */
    displayProps?: Partial<Omit<DCProps, BaseDisplayProps>>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<Omit<LCProps, BaseLabelProps>>;
}

export interface InputComponents<
    ICProps extends BaseInputProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'entrée utilisateur. */
    inputProps?: Partial<Omit<ICProps, BaseInputProps>>;
}

export interface SelectComponents<
    SCProps extends BaseSelectProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props pour le composant d'autocomplete. */
    selectProps?: Partial<Omit<SCProps, BaseSelectProps>>;
}

export interface AutocompleteComponents<
    ACProps extends BaseAutocompleteProps,
    DCProps extends BaseDisplayProps,
    LCProps extends BaseLabelProps
> extends BaseComponents<DCProps, LCProps> {
    /** Props supplémentaires pour le composant autocomplete. */
    autocompleteProps?: Partial<Omit<ACProps, BaseAutocompleteProps>>;
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
