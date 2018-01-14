/** Props de base pour un composant d'affichage. */
export interface BaseDisplayProps {
    formatter?: (x: any) => string;
    keyResolver?: (x: any) => Promise<string>;
    labelKey?: string;
    name?: string;
    onChange?: Function;
    theme?: {};
    value?: any;
    valueKey?: string;
    values?: any[];
}

/** Props de base pour un composant d'input. */
export interface BaseInputProps {
    error?: React.ReactNode;
    labelKey?: string;
    name?: string;
    onChange?: Function;
    theme?: {};
    value?: any;
    valueKey?: string;
    values?: any[];
}

/** Props de base pour un composant de libellé. */
export interface BaseLabelProps {
    name?: string;
    text?: string;
}
