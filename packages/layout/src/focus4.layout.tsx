import * as React from "react";

import {TReactCSSThemrTheme} from "@focus4/core";
import {ThemeContext} from "@focus4/styling";
import {
    AppBarTheme,
    AutocompleteTheme,
    AvatarTheme,
    BrowseButtonTheme,
    ButtonTheme,
    CardTheme,
    CheckboxTheme,
    ChipTheme,
    DatePickerTheme,
    DropdownTheme,
    IconButtonTheme,
    IconMenuTheme,
    InputTheme,
    LinkTheme,
    ListTheme,
    MenuItemTheme,
    MenuTheme,
    NavigationTheme,
    ProgressBarTheme,
    RadioTheme,
    RippleTheme,
    SliderTheme,
    SnackbarTheme,
    SwitchTheme,
    TabsTheme,
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
import {ButtonBttStyle, ScrollableStyle} from "./scrollable";
import {LoadingBarStyle} from "./utils";

export {
    HeaderActions,
    HeaderBarLeft,
    HeaderBarRight,
    HeaderContent,
    HeaderScrolling,
    HeaderStyle,
    HeaderSummary,
    HeaderTopRow,
    PrimaryAction,
    SecondaryAction,
    headerStyles
} from "./header";
export {MainMenu, MainMenuItem, MainMenuProps, MainMenuStyle, mainMenuStyles} from "./menu";
export {
    Content,
    Dialog,
    DialogStyle,
    LayoutBase,
    LayoutProps,
    LayoutStyle,
    OverlayStyle,
    Popin,
    PopinStyle,
    ScrollspyContainer,
    ScrollspyStyle,
    dialogStyles,
    layoutStyles,
    overlayStyles,
    popinStyles,
    scrollspyStyles
} from "./presentation";
export {
    ButtonBttStyle,
    Scrollable,
    ScrollableProps,
    ScrollableStyle,
    buttonBttStyles,
    scrollableStyles
} from "./scrollable";
export {
    LoadingBar,
    LoadingBarStyle,
    MessageCenter,
    MessageCenterProps,
    loadingBarStyles,
    snackbarStyles
} from "./utils";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    actionBar?: {};
    advancedSearch?: {};
    autocomplete?: {};
    booleanRadio?: {};
    buttonBTT?: ButtonBttStyle;
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

    RTAppBar?: AppBarTheme;
    RTAutocomplete?: AutocompleteTheme;
    RTAvatar?: AvatarTheme;
    RTButton?: ButtonTheme & BrowseButtonTheme & IconButtonTheme;
    RTCard?: CardTheme;
    RTCheckbox?: CheckboxTheme;
    RTChip?: ChipTheme;
    RTDatePicker?: DatePickerTheme;
    RTDropdown?: DropdownTheme;
    RTInput?: InputTheme;
    RTLink?: LinkTheme;
    RTList?: ListTheme;
    RTMenu?: IconMenuTheme & MenuItemTheme & MenuTheme;
    RTNavigation?: NavigationTheme;
    RTProgressBar?: ProgressBarTheme;
    RTRadio?: RadioTheme;
    RTRipple?: RippleTheme;
    RTSlider?: SliderTheme;
    RTSnackbar?: SnackbarTheme;
    RTSwitch?: SwitchTheme;
    RTTabs?: TabsTheme;
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
