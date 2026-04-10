import {ReactNode, useContext, useMemo} from "react";

import {CSSContext, ThemeContext} from "./common";
import {themeable} from "./themeable";
import {fromBem} from "./to-bem";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface FocusCSSContext extends CSSContext {
    // Collections
    actionBar: object;
    advancedSearch: object;
    contextualActions: object;
    facet: object;
    facetBox: object;
    group: object;
    list: object;
    listBase: object;
    searchBar: object;
    summary: object;
    table: object;
    timeline: object;

    // Forms
    booleanRadio: object;
    display: object;
    field: object;
    form: object;
    inputDate: object;
    inputFile: object;
    label: object;
    select: object;
    selectCheckbox: object;
    selectChips: object;
    selectRadio: object;

    // Layout
    dialog: object;
    filAriane: object;
    header: object;
    lateralMenu: object;
    layout: object;
    mainMenu: object;
    overlay: object;
    panel: object;
    popin: object;
    scrollable: object;
    scrollspy: object;

    // Toolbox
    autocomplete: object;
    button: object;
    calendar: object;
    checkbox: object;
    chip: object;
    dropdown: object;
    floatingActionButton: object;
    iconButton: object;
    menu: object;
    progressIndicator: object;
    radio: object;
    ripple: object;
    slider: object;
    snackbar: object;
    supportingText: object;
    switch: object;
    textField: object;
    tabs: object;
    tooltip: object;
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
