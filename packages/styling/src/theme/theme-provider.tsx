import {ReactNode, useContext, useMemo} from "react";

import {CSSContext, ThemeContext} from "./common";
import {themeable} from "./themeable";
import {fromBem} from "./to-bem";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface FocusCSSContext extends CSSContext {
    // Collections
    actionBar: {};
    advancedSearch: {};
    contextualActions: {};
    facet: {};
    facetBox: {};
    group: {};
    list: {};
    listBase: {};
    searchBar: {};
    summary: {};
    table: {};
    timeline: {};

    // Forms
    booleanRadio: {};
    display: {};
    field: {};
    form: {};
    inputDate: {};
    inputFile: {};
    label: {};
    select: {};
    selectCheckbox: {};
    selectChips: {};
    selectRadio: {};

    // Layout
    dialog: {};
    filAriane: {};
    header: {};
    lateralMenu: {};
    layout: {};
    mainMenu: {};
    overlay: {};
    panel: {};
    popin: {};
    scrollable: {};
    scrollspy: {};

    // Toolbox
    autocomplete: {};
    button: {};
    calendar: {};
    checkbox: {};
    chip: {};
    dropdown: {};
    floatingActionButton: {};
    iconButton: {};
    menu: {};
    progressIndicator: {};
    radio: {};
    ripple: {};
    slider: {};
    snackbar: {};
    switch: {};
    textField: {};
    tabs: {};
    tooltip: {};
}

/** Props du ThemeProvider. */
export interface ThemeProviderProps {
    /** Objet faisant correspondre à un identifiant de composant son objet de classes CSS associé.  */
    appTheme: Partial<FocusCSSContext>;
    /** Enfants. */
    children: ReactNode;
}

/**
 * Le `ThemeProvider` permet d'ajouter des classes CSS aux composants Focus (et autres composants utilisant `useTheme`) posés
 * à l'intérieur (via un context React).
 *
 * Les classes CSS ajoutées dans un `ThemeProvider` s'ajouteront aux éventuelles classes posées par un `ThemeProvider` parent,
 * y compris sur les mêmes composants.
 */
export function ThemeProvider({appTheme, children}: ThemeProviderProps) {
    const context = useContext(ThemeContext);

    const mergedContext = useMemo(() => {
        const mc = {} as CSSContext;

        for (const key in context) {
            if (key in appTheme && appTheme[key]) {
                mc[key] = themeable(fromBem(context[key]), fromBem(appTheme[key]));
            } else {
                mc[key] = context[key];
            }
        }

        for (const key in appTheme) {
            if (!(key in context) && appTheme[key]) {
                mc[key] = appTheme[key]!;
            }
        }
        return mc;
    }, [appTheme, context]);

    return <ThemeContext.Provider value={mergedContext}>{children}</ThemeContext.Provider>;
}
