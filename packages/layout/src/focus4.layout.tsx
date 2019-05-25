import * as React from "react";

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
import {TReactCSSThemrTheme} from "@focus4/core";
import {ThemeContext} from "@focus4/styling";
import {ButtonTheme, CheckboxTheme, ChipTheme, InputTheme, MenuTheme} from "@focus4/toolbox";

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
}

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `appTheme`.
 */
export function Layout(props: LayoutProps & {appTheme?: LayoutStyleProviderProps}) {
    const {appTheme = {}, ...layoutProps} = props;
    return (
        <ThemeContext.Provider value={appTheme as TReactCSSThemrTheme}>
            <LayoutBase {...layoutProps}>{props.children}</LayoutBase>
        </ThemeContext.Provider>
    );
}
