import {ComponentClass, ReactElement} from "react";

export type ReactComponent<P> = ComponentClass<P> | ((props: P) => ReactElement<P>);

export let MemoryList: ReactComponent<any> | undefined;
export let List: ReactComponent<any> | undefined;
export let Table: ReactComponent<any> | undefined;
export let Field: ReactComponent<any> | undefined;
export let Button: ReactComponent<any> | undefined;
export let ContextualActions: ReactComponent<any> | undefined;
export let Checkbox: ReactComponent<any> | undefined;
export let SearchBar: ReactComponent<any> | undefined;

/** Interface de tous les composants à définir. */
export interface Defaults {
    MemoryList: ReactComponent<any>;
    List: ReactComponent<any>;
    Table: ReactComponent<any>;
    Field: ReactComponent<any>;
    Button: ReactComponent<any>;
    ContextualActions: ReactComponent<any>;
    Checkbox: ReactComponent<any>;
    SearchBar: ReactComponent<any>;
}

/**
 * Définit les composants par défauts pour utilisation dans les composants d'autofocus.
 * @param c L'objet contenant les composants.
 */
export function setDefaultComponents(c: Defaults) {
    MemoryList = c.MemoryList;
    List = c.List;
    Table = c.Table;
    Field = c.Field;
    Button = c.Button;
    ContextualActions = c.ContextualActions;
    Checkbox = c.Checkbox;
    SearchBar = c.SearchBar;
}
