import {CSSContext, CSSProp, ThemeContext} from "@focus4/styling";
import {
    AutocompleteCss,
    ButtonCss,
    CalendarCss,
    CheckboxCss,
    ChipCss,
    DropdownCss,
    FloatingActionButtonCss,
    IconButtonCss,
    MenuCss,
    ProgressIndicatorCss,
    RadioCss,
    RippleCss,
    SliderCss,
    SnackbarCss,
    SwitchCss,
    TabsCss,
    TextFieldCss,
    TooltipCss
} from "@focus4/toolbox";

import {HeaderCss} from "./header";
import {MainMenuCss} from "./menu";
import {DialogCss, LayoutBase, LayoutCss, LayoutProps, OverlayCss, PopinCss, ScrollspyCss} from "./presentation";
import {ButtonBttCss, ScrollableCss} from "./scrollable";

export {HeaderActions, HeaderContent, HeaderCss, HeaderItem, HeaderScrolling, HeaderTopRow, headerCss} from "./header";
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
export {translation} from "./translation";
export {MessageCenter, MessageCenterProps} from "./utils";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    actionBar?: {};
    advancedSearch?: {};
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
    inputDate?: {};
    label?: {};
    layout?: CSSProp<LayoutCss>;
    list?: {};
    listBase?: {};
    mainMenu?: CSSProp<MainMenuCss>;
    overlay?: CSSProp<OverlayCss>;
    panel?: {};
    popin?: CSSProp<PopinCss>;
    scrollable?: CSSProp<ScrollableCss>;
    scrollspy?: CSSProp<ScrollspyCss>;
    searchBar?: {};
    select?: {};
    selectCheckbox?: {};
    selectChips?: {};
    selectRadio?: {};
    summary?: {};
    table?: {};
    timeline?: {};

    autocomplete?: CSSProp<AutocompleteCss>;
    button?: CSSProp<ButtonCss>;
    RTCalendar?: CSSProp<CalendarCss>;
    checkbox?: CSSProp<CheckboxCss>;
    chip?: CSSProp<ChipCss>;
    dropdown?: CSSProp<DropdownCss>;
    floatingActionButton?: CSSProp<FloatingActionButtonCss>;
    iconButton?: CSSProp<IconButtonCss>;
    menu?: CSSProp<MenuCss>;
    progressIndicator?: CSSProp<ProgressIndicatorCss>;
    radio?: CSSProp<RadioCss>;
    ripple?: CSSProp<RippleCss>;
    slider?: CSSProp<SliderCss>;
    snackbar?: CSSProp<SnackbarCss>;
    switch?: CSSProp<SwitchCss>;
    textField?: CSSProp<TextFieldCss>;
    RTTabs?: CSSProp<TabsCss>;
    tooltip?: CSSProp<TooltipCss>;
}

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `appTheme`.
 */
export function Layout(props: LayoutProps & {appTheme?: LayoutStyleProviderProps}) {
    const {appTheme = {}, ...layoutProps} = props;
    return (
        <ThemeContext.Provider value={appTheme as CSSContext}>
            <LayoutBase {...layoutProps} />
        </ThemeContext.Provider>
    );
}
