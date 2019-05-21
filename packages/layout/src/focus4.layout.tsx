import * as React from "react";
import {ThemeProvider, TReactCSSThemrTheme} from "react-css-themr";

import {ButtonTheme} from "react-toolbox/lib/button";
import {CheckboxTheme} from "react-toolbox/lib/checkbox";
import {ChipTheme} from "react-toolbox/lib/chip";
import {InputTheme} from "react-toolbox/lib/input";
import {MenuTheme} from "react-toolbox/lib/menu";
import {TabsTheme} from "react-toolbox/lib/tabs";

import {
    AutocompleteStyle,
    BooleanRadioStyle,
    DisplayStyle,
    FieldStyle,
    FormStyle,
    LabelStyle,
    PanelStyle,
    SelectCheckboxStyle,
    SelectRadioStyle,
    SelectStyle
} from "@focus4/components";
import {ThemeContext} from "@focus4/styling";

import {HeaderStyle} from "./header";
import {MainMenuStyle} from "./menu";
import {
    DialogStyle,
    LayoutBase,
    LayoutProps,
    LayoutStyle,
    OverlayStyle,
    PopinStyle,
    ScrollspyStyle
} from "./presentation";
import {ButtonBackToTopStyle, ScrollableStyle} from "./scrollable";
import {LoadingBarStyle} from "./utils";

export {
    HeaderActions,
    HeaderBarLeft,
    HeaderBarRight,
    HeaderContent,
    HeaderScrolling,
    HeaderSummary,
    HeaderTopRow,
    PrimaryAction,
    SecondaryAction,
    headerStyles
} from "./header";
export {
    Content,
    Dialog,
    Popin,
    ScrollspyContainer,
    dialogStyles,
    layoutStyles,
    overlayStyles,
    popinStyles,
    scrollspyStyles
} from "./presentation";
export {MainMenu, MainMenuItem, mainMenuStyles} from "./menu";
export {Scrollable, buttonBTTStyles, scrollableStyles} from "./scrollable";
export {loadingBarStyles, snackbarStyles} from "./utils";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    [key: string]: {} | undefined;

    actionBar?: {};
    advancedSearch?: {};
    autocomplete?: AutocompleteStyle;
    booleanRadio?: BooleanRadioStyle;
    buttonBTT?: ButtonBackToTopStyle;
    contextualActions?: {};
    dialog?: DialogStyle;
    display?: DisplayStyle;
    dragLayer?: {};
    facet?: {};
    facetBox?: {};
    field?: FieldStyle;
    form?: FormStyle;
    group?: {};
    header?: HeaderStyle;
    label?: LabelStyle;
    layout?: LayoutStyle;
    loadingBar?: LoadingBarStyle;
    line?: {};
    list?: {};
    listWrapper?: {};
    mainMenu?: MainMenuStyle;
    overlay?: OverlayStyle;
    panel?: PanelStyle;
    popin?: PopinStyle;
    scrollable?: ScrollableStyle;
    scrollspy?: ScrollspyStyle;
    searchBar?: {};
    select?: SelectStyle;
    selectCheckbox?: SelectCheckboxStyle;
    selectRadio?: SelectRadioStyle;
    summary?: {};

    RTButton?: ButtonTheme;
    RTCheckbox?: CheckboxTheme;
    RTChip?: ChipTheme;
    RTInput?: InputTheme;
    RTMenu?: MenuTheme;
    RTTabs?: TabsTheme;
}

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `appTheme`.
 */
export function Layout(props: LayoutProps & {appTheme?: LayoutStyleProviderProps}) {
    const {appTheme = {}, ...layoutProps} = props;
    return (
        <ThemeProvider theme={appTheme as TReactCSSThemrTheme}>
            <ThemeContext.Provider value={appTheme as TReactCSSThemrTheme}>
                <LayoutBase {...layoutProps}>{props.children}</LayoutBase>
            </ThemeContext.Provider>
        </ThemeProvider>
    );
}
