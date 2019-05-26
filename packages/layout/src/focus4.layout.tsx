import * as React from "react";

import {TReactCSSThemrTheme} from "@focus4/core";
import {ThemeContext} from "@focus4/styling";
import {
    AutocompleteTheme,
    AvatarTheme,
    BrowseButtonTheme,
    ButtonTheme,
    CheckboxTheme,
    ChipTheme,
    DatePickerTheme,
    DropdownTheme,
    IconButtonTheme,
    IconMenuTheme,
    InputTheme,
    MenuItemTheme,
    MenuTheme,
    ProgressBarTheme,
    RadioTheme,
    RippleTheme,
    SnackbarTheme,
    SwitchTheme,
    TimePickerTheme,
    TooltipTheme
} from "@focus4/toolbox";

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
    actionBar?: {};
    advancedSearch?: {};
    autocomplete?: {};
    booleanRadio?: {};
    buttonBTT?: ButtonBackToTopStyle;
    contextualActions?: {};
    dialog?: DialogStyle;
    display?: {};
    dragLayer?: {};
    facet?: {};
    facetBox?: {};
    field?: {};
    form?: {};
    group?: {};
    header?: HeaderStyle;
    label?: {};
    layout?: LayoutStyle;
    loadingBar?: LoadingBarStyle;
    line?: {};
    list?: {};
    listWrapper?: {};
    mainMenu?: MainMenuStyle;
    overlay?: OverlayStyle;
    panel?: {};
    popin?: PopinStyle;
    scrollable?: ScrollableStyle;
    scrollspy?: ScrollspyStyle;
    searchBar?: {};
    select?: {};
    selectCheckbox?: {};
    selectRadio?: {};
    summary?: {};

    RTAutocomplete?: AutocompleteTheme;
    RTAvatar?: AvatarTheme;
    RTButton?: ButtonTheme & BrowseButtonTheme & IconButtonTheme;
    RTCheckbox?: CheckboxTheme;
    RTChip?: ChipTheme;
    RTDatePicker?: DatePickerTheme;
    RTDropdown?: DropdownTheme;
    RTInput?: InputTheme;
    RTMenu?: IconMenuTheme & MenuItemTheme & MenuTheme;
    RTProgressBar?: ProgressBarTheme;
    RTRadio?: RadioTheme;
    RTRipple?: RippleTheme;
    RTSnackbar?: SnackbarTheme;
    RTSwitch?: SwitchTheme;
    RTTimePicker?: TimePickerTheme;
    RTTooltip?: TooltipTheme;
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
