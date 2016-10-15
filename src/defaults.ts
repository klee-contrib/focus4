import {ComponentClass, ReactElement} from "react";

export type ReactComponent<P> = ComponentClass<P> | ((props: P) => ReactElement<any>);

export let AutocompleteSelect: ReactComponent<any> | undefined;
export let AutocompleteText: ReactComponent<any> | undefined;
export let Button: ReactComponent<any> | undefined;
export let ButtonBackToTop: ReactComponent<any> | undefined;
export let Checkbox: ReactComponent<any> | undefined;
export let DisplayText: ReactComponent<any> | undefined;
export let Dropdown: ReactComponent<any> | undefined;
export let Icon: ReactComponent<any> | undefined;
export let InputText: ReactComponent<any> | undefined;
export let Label: ReactComponent<any> | undefined;
export let Select: ReactComponent<any> | undefined;

export let ActionBar: ReactComponent<any> | undefined; // dépendence au dropdown ContextualActions et TopicDisplayer

/** Interface de tous les composants à définir. */
export interface Defaults {
    AutocompleteSelect?: ReactComponent<any>;
    AutocompleteText?: ReactComponent<any>;
    Button?: ReactComponent<any>;
    ButtonBackToTop?: ReactComponent<any>;
    Checkbox?: ReactComponent<any>;
    DisplayText?: ReactComponent<any>;
    Dropdown?: ReactComponent<any>;
    Icon?: ReactComponent<any>;
    InputText?: ReactComponent<any>;
    Label?: ReactComponent<any>;
    Select?: ReactComponent<any>;
    ActionBar?: ReactComponent<any>;
}

/**
 * Définit les composants par défauts pour utilisation dans les composants d'autofocus.
 * @param c L'objet contenant les composants.
 */
export function setDefaultComponents(c: Defaults) {
    AutocompleteSelect = c.AutocompleteSelect;
    AutocompleteText = c.AutocompleteText;
    Button = c.Button;
    ButtonBackToTop = c.ButtonBackToTop;
    Checkbox = c.Checkbox;
    DisplayText = c.DisplayText;
    Dropdown = c.Dropdown;
    Icon = c.Icon;
    InputText = c.InputText;
    Label = c.Label;
    Select = c.Select;
    ActionBar = c.ActionBar;
}
