import "!style-loader!css-loader!material-design-icons-iconfont/dist/material-design-icons.css";

import * as React from "react";
import {ThemeProvider, TReactCSSThemrTheme} from "react-css-themr";

import {ButtonTheme} from "react-toolbox/lib/button";
import {CheckboxTheme} from "react-toolbox/lib/checkbox";
import {ChipTheme} from "react-toolbox/lib/chip";
import {InputTheme} from "react-toolbox/lib/input";
import {MenuTheme} from "react-toolbox/lib/menu";
import {TabsTheme} from "react-toolbox/lib/tabs";

import {
    ActionBarStyle,
    AdvancedSearchStyle,
    ContextualActionsStyle,
    DragLayerStyle,
    FacetBoxStyle,
    FacetStyle,
    GroupStyle,
    LineStyle,
    ListStyle,
    ListWrapperStyle,
    SearchBarStyle,
    SummaryStyle
} from "@focus4/collections";
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

import {DialogStyle} from "./dialog";
import {HeaderStyle} from "./header";
import {LayoutBase, LayoutProps} from "./layout";
import {MainMenuStyle} from "./menu";
import {OverlayStyle} from "./overlay";
import {PopinStyle} from "./popin";
import {ButtonBackToTopStyle, ScrollableStyle} from "./scrollable";
import {ScrollspyStyle} from "./scrollspy-container";
import {LoadingBarStyle} from "./utils";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;

export {Content} from "./content";
export {Dialog} from "./dialog";
export {
    HeaderActions,
    HeaderBarLeft,
    HeaderBarRight,
    HeaderContent,
    HeaderScrolling,
    HeaderSummary,
    HeaderTopRow,
    PrimaryAction,
    SecondaryAction
} from "./header";
export {Popin} from "./popin";
export {Scrollable} from "./scrollable";
export {ScrollspyContainer} from "./scrollspy-container";
export {MainMenu, MainMenuItem} from "./menu";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    [key: string]: {} | undefined;

    actionBar?: ActionBarStyle;
    advancedSearch?: AdvancedSearchStyle;
    autocomplete?: AutocompleteStyle;
    booleanRadio?: BooleanRadioStyle;
    buttonBTT?: ButtonBackToTopStyle;
    contextualActions?: ContextualActionsStyle;
    dialog?: DialogStyle;
    display?: DisplayStyle;
    dragLayer?: DragLayerStyle;
    facet?: FacetStyle;
    facetBox?: FacetBoxStyle;
    field?: FieldStyle;
    form?: FormStyle;
    group?: GroupStyle;
    header?: HeaderStyle;
    label?: LabelStyle;
    layout?: LayoutStyle;
    loadingBar?: LoadingBarStyle;
    line?: LineStyle;
    list?: ListStyle;
    listWrapper?: ListWrapperStyle;
    mainMenu?: MainMenuStyle;
    overlay?: OverlayStyle;
    panel?: PanelStyle;
    popin?: PopinStyle;
    scrollable?: ScrollableStyle;
    scrollspy?: ScrollspyStyle;
    searchBar?: SearchBarStyle;
    select?: SelectStyle;
    selectCheckbox?: SelectCheckboxStyle;
    selectRadio?: SelectRadioStyle;
    summary?: SummaryStyle;

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
