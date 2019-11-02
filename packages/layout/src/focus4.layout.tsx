import * as React from "react";

import {TReactCSSThemrTheme} from "@focus4/core";
import {CSSProp, ThemeContext} from "@focus4/styling";
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

import {HeaderCss} from "./header";
import {MainMenuCss} from "./menu";
import {DialogCss, LayoutBase, LayoutCss, LayoutProps, OverlayCss, PopinCss, ScrollspyCss} from "./presentation";
import {ButtonBttCss, ScrollableCss} from "./scrollable";
import {LoadingBarCss} from "./utils";

export {
    HeaderActions,
    HeaderBarLeft,
    HeaderBarRight,
    HeaderContent,
    HeaderCss,
    HeaderScrolling,
    HeaderSummary,
    HeaderTopRow,
    PrimaryAction,
    SecondaryAction,
    headerCss
} from "./header";
export {MainMenu, MainMenuItem, MainMenuProps, MainMenuCss, mainMenuCss} from "./menu";
export {
    Content,
    Dialog,
    DialogCss,
    LayoutBase,
    LayoutProps,
    LayoutCss,
    OverlayCss,
    Popin,
    PopinCss,
    ScrollspyContainer,
    ScrollspyCss,
    dialogCss,
    layoutCss,
    overlayCss,
    popinCss,
    scrollspyCss
} from "./presentation";
export {ButtonBttCss, Scrollable, ScrollableProps, ScrollableCss, buttonBttCss, scrollableCss} from "./scrollable";
export {LoadingBar, LoadingBarCss, MessageCenter, MessageCenterProps, loadingBarCss, snackBarCss} from "./utils";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    actionBar?: {};
    advancedSearch?: {};
    autocomplete?: {};
    booleanRadio?: {};
    buttonBTT?: CSSProp<ButtonBttCss>;
    contextualActions?: {};
    dialog?: CSSProp<DialogCss>;
    display?: {};
    dragLayer?: {};
    facet?: {};
    facetBox?: {};
    field?: {};
    form?: {};
    group?: {};
    header?: CSSProp<HeaderCss>;
    label?: {};
    layout?: CSSProp<LayoutCss>;
    loadingBar?: CSSProp<LoadingBarCss>;
    line?: {};
    list?: {};
    listWrapper?: {};
    mainMenu?: CSSProp<MainMenuCss>;
    overlay?: CSSProp<OverlayCss>;
    panel?: {};
    popin?: CSSProp<PopinCss>;
    scrollable?: CSSProp<ScrollableCss>;
    scrollspy?: CSSProp<ScrollspyCss>;
    searchBar?: {};
    select?: {};
    selectCheckbox?: {};
    selectRadio?: {};
    summary?: {};

    RTAppBar?: CSSProp<AppBarTheme>;
    RTAutocomplete?: CSSProp<AutocompleteTheme>;
    RTAvatar?: CSSProp<AvatarTheme>;
    RTButton?: CSSProp<ButtonTheme & BrowseButtonTheme & IconButtonTheme>;
    RTCard?: CSSProp<CardTheme>;
    RTCheckbox?: CSSProp<CheckboxTheme>;
    RTChip?: CSSProp<ChipTheme>;
    RTDatePicker?: CSSProp<DatePickerTheme>;
    RTDropdown?: CSSProp<DropdownTheme>;
    RTInput?: CSSProp<InputTheme>;
    RTLink?: CSSProp<LinkTheme>;
    RTList?: CSSProp<ListTheme>;
    RTMenu?: CSSProp<IconMenuTheme & MenuItemTheme & MenuTheme>;
    RTNavigation?: CSSProp<NavigationTheme>;
    RTProgressBar?: CSSProp<ProgressBarTheme>;
    RTRadio?: CSSProp<RadioTheme>;
    RTRipple?: CSSProp<RippleTheme>;
    RTSlider?: CSSProp<SliderTheme>;
    RTSnackbar?: CSSProp<SnackbarTheme>;
    RTSwitch?: CSSProp<SwitchTheme>;
    RTTabs?: CSSProp<TabsTheme>;
    RTTimePicker?: CSSProp<TimePickerTheme>;
    RTTooltip?: CSSProp<TooltipTheme>;
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
