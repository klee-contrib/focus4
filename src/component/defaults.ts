import {ComponentClass, ReactElement} from "react";

export type ReactComponent<P> = ComponentClass<P> | ((props: P) => ReactElement<P>);

export let Field: ReactComponent<any> | undefined;
export let Button: ReactComponent<any> | undefined;
export let ContextualActions: ReactComponent<any> | undefined;
export let Checkbox: ReactComponent<any> | undefined;
export let SearchBar: ReactComponent<any> | undefined;
export let ActionBar: ReactComponent<any> | undefined;
export let FacetBox: ReactComponent<any> | undefined;
export let TopicDisplayer: ReactComponent<any> | undefined;
export let ButtonBackToTop: ReactComponent<any> | undefined;

/** Interface de tous les composants à définir. */
export interface Defaults {
    Field: ReactComponent<any>;
    Button: ReactComponent<any>;
    ContextualActions: ReactComponent<any>;
    Checkbox: ReactComponent<any>;
    SearchBar: ReactComponent<any>;
    ActionBar: ReactComponent<any>;
    FacetBox: ReactComponent<any>;
    TopicDisplayer: ReactComponent<any>;
    ButtonBackToTop: ReactComponent<any>;
}

/**
 * Définit les composants par défauts pour utilisation dans les composants d'autofocus.
 * @param c L'objet contenant les composants.
 */
export function setDefaultComponents(c: Defaults) {
    Field = c.Field;
    Button = c.Button;
    ContextualActions = c.ContextualActions;
    Checkbox = c.Checkbox;
    SearchBar = c.SearchBar;
    ActionBar = c.ActionBar;
    FacetBox = c.FacetBox;
    TopicDisplayer = c.TopicDisplayer;
    ButtonBackToTop = c.ButtonBackToTop;
}
