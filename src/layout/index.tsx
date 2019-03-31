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
} from "../collections";
import {
    AutocompleteStyle,
    BooleanRadioStyle,
    ButtonBackToTopStyle,
    DisplayStyle,
    LabelStyle,
    PanelStyle,
    PopinStyle,
    Scrollable,
    ScrollspyStyle,
    SelectCheckboxStyle,
    SelectRadioStyle,
    SelectStyle
} from "../components";
import {FieldStyle} from "../entity";
import {MessageCenter, MessageCenterProps} from "../message";
import {LoadingBarStyle} from "../network";
import {ThemeContext, useTheme} from "../theme";

import {ErrorCenter, ErrorCenterStyle} from "./error-center";
import {HeaderStyle} from "./header";
import {MainMenuStyle} from "./menu";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;

export {LayoutContent} from "./content";
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
export {MainMenu, MainMenuItem} from "./menu";

/** Props du Layout. */
export interface LayoutProps extends MessageCenterProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 100. */
    backToTopOffset?: number;
    children?: React.ReactNode;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    menu?: React.ReactNode;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    theme?: LayoutStyle;
}

/** Composant de Layout sans le provider de style. */
function LayoutBase({
    theme: pTheme,
    children,
    backToTopOffset,
    hideBackToTop,
    menu,
    scrollBehaviour,
    ...messageCenterProps
}: LayoutProps) {
    const theme = useTheme("layout", styles, pTheme);
    return (
        <>
            <ErrorCenter />
            <MessageCenter {...messageCenterProps} />
            <div className={theme.layout}>
                {menu}
                <Scrollable
                    backToTopOffset={backToTopOffset}
                    className={theme.scrollable}
                    hideBackToTop={hideBackToTop}
                    scrollBehaviour={scrollBehaviour}
                >
                    {children}
                </Scrollable>
            </div>
        </>
    );
}

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    [key: string]: {} | undefined;

    actionBar?: ActionBarStyle;
    advancedSearch?: AdvancedSearchStyle;
    autocomplete?: AutocompleteStyle;
    booleanRadio?: BooleanRadioStyle;
    buttonBTT?: ButtonBackToTopStyle;
    contextualActions?: ContextualActionsStyle;
    display?: DisplayStyle;
    dragLayer?: DragLayerStyle;
    errorCenter?: ErrorCenterStyle;
    facet?: FacetStyle;
    facetBox?: FacetBoxStyle;
    field?: FieldStyle;
    form?: string;
    group?: GroupStyle;
    header?: HeaderStyle;
    label?: LabelStyle;
    layout?: LayoutStyle;
    loadingBar?: LoadingBarStyle;
    line?: LineStyle;
    list?: ListStyle;
    listWrapper?: ListWrapperStyle;
    mainMenu?: MainMenuStyle;
    panel?: PanelStyle;
    popin?: PopinStyle;
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
