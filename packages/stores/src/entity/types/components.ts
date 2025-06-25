import {ReactNode} from "react";

import {ReferenceList} from "../../reference";

import {DomainFieldType, DomainType, SingleDomainFieldType} from "./entity";

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

export interface BaseInputProps<DT extends DomainFieldType> extends BaseComponentProps {
    onChange?: (value?: DomainType<DT>) => void;
    type?: DT;
    value?: DomainType<DT>;
}

export interface BaseSelectProps<DT extends DomainFieldType> extends BaseInputProps<DT> {
    values: ReferenceList;
}

export interface BaseAutocompleteProps<DT extends DomainFieldType> extends BaseInputProps<DT> {
    keyResolver?: (key: DomainType<SingleDomainFieldType<DT>>) => Promise<string | undefined>;
}

export interface BaseDisplayProps<DT extends DomainFieldType> extends BaseComponentProps {
    formatter?: (value: DomainType<SingleDomainFieldType<DT>> | undefined) => string;
    keyResolver?: (key: DomainType<SingleDomainFieldType<DT>>) => Promise<string | undefined>;
    type?: DT;
    value?: DomainType<DT>;
    values?: ReferenceList;
}

export interface BaseLabelProps extends BaseComponentProps {
    edit?: boolean;
}

export interface BaseComponents<
    DT extends DomainFieldType,
    DCProps extends BaseDisplayProps<DT>,
    LCProps extends BaseLabelProps
> {
    /** Props pour le composant d'affichage */
    displayProps?: Partial<OmitButKeepTheme<DCProps, BaseDisplayProps<DT>>>;
    /** Props pour le composant de libellé. */
    labelProps?: Partial<OmitButKeepTheme<LCProps, BaseLabelProps>>;
}

export interface InputComponents<
    DT extends DomainFieldType,
    ICProps extends BaseInputProps<DT>,
    DCProps extends BaseDisplayProps<DT>,
    LCProps extends BaseLabelProps
> extends BaseComponents<DT, DCProps, LCProps> {
    /** Props pour le composant d'input. */
    inputProps?: Partial<OmitButKeepTheme<ICProps, BaseInputProps<DT>>>;
}

export interface SelectComponents<
    DT extends DomainFieldType,
    SCProps extends BaseSelectProps<DT>,
    DCProps extends BaseDisplayProps<DT>,
    LCProps extends BaseLabelProps
> extends BaseComponents<DT, DCProps, LCProps> {
    /** Props pour le composant de select. */
    selectProps?: Partial<OmitButKeepTheme<SCProps, BaseSelectProps<DT>>>;
}

export interface AutocompleteComponents<
    DT extends DomainFieldType,
    ACProps extends BaseAutocompleteProps<DT>,
    DCProps extends BaseDisplayProps<DT>,
    LCProps extends BaseLabelProps
> extends BaseComponents<DT, DCProps, LCProps> {
    /** Props pour le composant d'autocomplete. */
    autocompleteProps?: Partial<OmitButKeepTheme<ACProps, BaseAutocompleteProps<DT>>>;
}

export interface FieldComponents<
    DT extends DomainFieldType,
    ICProps extends BaseInputProps<DT> = any,
    SCProps extends BaseSelectProps<DT> = any,
    ACProps extends BaseAutocompleteProps<DT> = any,
    DCProps extends BaseDisplayProps<DT> = any,
    LCProps extends BaseLabelProps = any,
    FProps extends {theme?: object} = any
> extends InputComponents<DT, ICProps, DCProps, LCProps>,
        SelectComponents<DT, SCProps, DCProps, LCProps>,
        AutocompleteComponents<DT, ACProps, DCProps, LCProps> {
    /** Props pour le composant de champ. */
    fieldProps?: FProps;
}
