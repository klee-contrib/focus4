import {ReactNode, useContext, useMemo} from "react";

import {themeable} from "@focus4/core";

import {CSSContext, CSSTheme, ThemeContext} from "./common";
import {fromBem} from "./to-bem";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface FocusCSSContext extends CSSContext {
    // Collections
    actionBar: CSSTheme;
    advancedSearch: CSSTheme;
    contextualActions: CSSTheme;
    dragLayer: CSSTheme;
    facet: CSSTheme;
    facetBox: CSSTheme;
    group: CSSTheme;
    list: CSSTheme;
    listBase: CSSTheme;
    searchBar: CSSTheme;
    summary: CSSTheme;
    table: CSSTheme;
    timeline: CSSTheme;

    // Forms
    booleanRadio: CSSTheme;
    display: CSSTheme;
    field: CSSTheme;
    form: CSSTheme;
    inputDate: CSSTheme;
    label: CSSTheme;
    panel: CSSTheme;
    select: CSSTheme;
    selectCheckbox: CSSTheme;
    selectChips: CSSTheme;
    selectRadio: CSSTheme;

    // Layout
    buttonBTT: CSSTheme;
    dialog: CSSTheme;
    header: CSSTheme;
    layout: CSSTheme;
    mainMenu: CSSTheme;
    overlay: CSSTheme;
    popin: CSSTheme;
    scrollable: CSSTheme;
    scrollspy: CSSTheme;

    // Toolbox
    autocomplete: CSSTheme;
    button: CSSTheme;
    calendar: CSSTheme;
    checkbox: CSSTheme;
    chip: CSSTheme;
    dropdown: CSSTheme;
    floatingActionButton: CSSTheme;
    iconButton: CSSTheme;
    menu: CSSTheme;
    progressIndicator: CSSTheme;
    radio: CSSTheme;
    ripple: CSSTheme;
    slider: CSSTheme;
    snackbar: CSSTheme;
    switch: CSSTheme;
    textField: CSSTheme;
    tabs: CSSTheme;
    tooltip: CSSTheme;
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
                mc[key] = themeable(fromBem(context[key]), fromBem(appTheme[key]!)) as CSSTheme;
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
