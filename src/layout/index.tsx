// tslint:disable-next-line:no-submodule-imports
import "!style-loader!css-loader!material-design-icons-iconfont/dist/material-design-icons.css";

import {autobind} from "core-decorators";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {ThemeProvider, themr, TReactCSSThemrTheme} from "react-css-themr";
import {findDOMNode} from "react-dom";

import {ButtonTheme} from "react-toolbox/lib/button";
import {CheckboxTheme} from "react-toolbox/lib/checkbox";
import {ChipTheme} from "react-toolbox/lib/chip";
import {InputTheme} from 'react-toolbox/lib/input';
import {MenuTheme} from "react-toolbox/lib/menu";
import {TabsTheme} from "react-toolbox/lib/tabs";

import {AutocompleteStyle, ButtonBackToTopStyle, DisplayStyle, PanelStyle, PopinStyle, ScrollspyStyle} from "../components";
import {FieldStyle} from "../entity";
import {ContextualActionsStyle, DragLayerStyle, LineStyle, ListStyle, ListWrapperStyle} from "../list";
import {MessageCenter} from "../message";
import {LoadingBarStyle} from "../network";
import {ActionBarStyle, AdvancedSearchStyle, FacetBoxStyle, FacetStyle, GroupStyle, SearchBarStyle, SummaryStyle} from "../search";

import ErrorCenter, {ErrorCenterStyle} from "./error-center";
import {HeaderStyle} from "./header";
import {MainMenuStyle} from "./menu";
import {LayoutProps, LayoutStyle, styles} from "./types";

export {default as LayoutContent} from "./content";
export {default as LayoutFooter} from "./footer";
export {HeaderActions, HeaderBarLeft, HeaderBarRight, HeaderContent, HeaderScrolling, HeaderSummary, HeaderTopRow, PrimaryAction, SecondaryAction} from "./header";
export {default as MainMenu, MainMenuItem} from "./menu";

/** Composant de Layout sans le provider de style. */
@themr("layout", styles)
@autobind
@observer
class LayoutBase extends React.Component<LayoutProps, void> {

    // On utilise le contexte React pour partager la taille du menu.
    static childContextTypes = {
        layout: PropTypes.object
    };

    /** Objet passé en contexte pour la taille du menu.. */
    @observable childContext = {
        menuWidth: undefined as number | undefined
    };

    getChildContext() {
        return {layout: this.childContext};
    }

    // Permet de récupérer et d'actualiser la largeur du menu à l'exécution.
    componentDidMount() { this.getMenuWidth(); }
    componentDidUpdate() { this.getMenuWidth(); }
    getMenuWidth() {
        const menuNode = Array.from(findDOMNode(this).children).find(item => item.tagName === "NAV");
        if (menuNode) {
            this.childContext.menuWidth = menuNode.clientWidth;
        }
    }

    render() {
        const {children, theme} = this.props;
        return (
            <div className={theme!.layout}>
                <ErrorCenter />
                <MessageCenter />
                {children}
            </div>
        );
    }
}

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    [key: string]: {} | undefined;

    actionBar?: ActionBarStyle;
    advancedSearch?: AdvancedSearchStyle;
    autocomplete?: AutocompleteStyle;
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
    return (
        <ThemeProvider theme={(props.appTheme || {}) as TReactCSSThemrTheme}>
            <LayoutBase {...omit(props, "appTheme")}>
                {props.children}
            </LayoutBase>
        </ThemeProvider>
    );
}
