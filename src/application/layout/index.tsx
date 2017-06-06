import {autobind} from "core-decorators";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {ThemeProvider, themr, TReactCSSThemrTheme} from "react-css-themr";

import {ButtonTheme} from "react-toolbox/lib/button";
import {CheckboxTheme} from "react-toolbox/lib/checkbox";
import {ChipTheme} from "react-toolbox/lib/chip";
import {MenuTheme} from "react-toolbox/lib/menu";
import {TabsTheme} from "react-toolbox/lib/tabs";

import {PopinStyle} from "../../components";
import {FieldStyle} from "../../entity";
import {ContextualActionsStyle, LineStyle, ListStyle, ListWrapperStyle} from "../../list";
import {MessageCenter as DefaultMessageCenter} from "../../message";
import {LoadingBarStyle} from "../../network";
import {ActionBarStyle, AdvancedSearchStyle, FacetBoxStyle, FacetStyle, GroupStyle, SearchBarStyle, SummaryStyle} from "../../search";

import DefaultErrorCenter, {ErrorCenterStyle} from "./error-center";
import Header, {HeaderStyle} from "./header";
import Menu, {MenuItemConfig, MenuStyle} from "./menu";

import styles from "./__style__/layout.css";

export type LayoutStyle = Partial<typeof styles>;

export {DefaultErrorCenter as ErrorCenter, Header, HeaderStyle, Menu, MenuItemConfig};

/** Props du Layout, comportant les différents composants injectables. */
export interface LayoutProps {
    AppHeader?: React.ComponentClass<any> | React.SFC<any>;
    children?: React.ReactChildren;
    DevTools?: React.ComponentClass<any> | React.SFC<any>;
    ErrorCenter?: React.ComponentClass<any> | React.SFC<any> | null;
    Footer?: React.ComponentClass<any> | React.SFC<any>;
    LoadingBar?: React.ComponentClass<any> | React.SFC<any>;
    MenuLeft?: React.ComponentClass<any> | React.SFC<any>;
    MessageCenter?: React.ComponentClass<any> | React.SFC<any>;
    OtherRootComponent?: React.ComponentClass<any> | React.SFC<any>;
    theme?: LayoutStyle;
}

/** Composant de Layout sans le provider de style. */
@themr("layout", styles)
@autobind
@observer
class LayoutBase extends React.Component<LayoutProps, void> {

    /** Largeur du menu. */
    @observable menuWidth = 0;

    // Permet de récupérer et d'actualiser la largeur du menu à l'exécution.
    componentDidMount() { this.getMenuWidth(); }
    componentDidUpdate() { this.getMenuWidth(); }
    getMenuWidth() {
        if (this.props.MenuLeft) {
            this.menuWidth = document.getElementsByTagName("nav")[0].clientWidth;
        }
    }

    render() {
        const {
            AppHeader = Header,
            children,
            DevTools,
            ErrorCenter = DefaultErrorCenter,
            Footer,
            LoadingBar,
            MenuLeft,
            MessageCenter = DefaultMessageCenter,
            OtherRootComponent,
            theme
        } = this.props;

        return (
            <div className={theme!.layout!}>
                {LoadingBar ? <LoadingBar /> : null}
                <MessageCenter />
                {ErrorCenter ? <ErrorCenter /> : null}
                <AppHeader marginLeft={this.menuWidth} />
                {MenuLeft ? <MenuLeft /> : null}
                <div className={theme!.content!} style={{marginLeft: this.menuWidth}}>
                    {children}
                </div>
                {Footer ?
                    <footer style={{marginLeft: this.menuWidth}}>
                        <Footer />
                    </footer>
                : null}
                {DevTools ? <DevTools /> : null}
                {OtherRootComponent ? <OtherRootComponent /> : null}
            </div>
        );
    }
}

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    actionBar?: ActionBarStyle;
    advancedSearch?: AdvancedSearchStyle;
    contextualActions?: ContextualActionsStyle;
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
    menu?: MenuStyle;
    popin?: PopinStyle;
    searchBar?: SearchBarStyle;
    summary?: SummaryStyle;

    RTButton?: ButtonTheme;
    RTCheckbox?: CheckboxTheme;
    RTChip?: ChipTheme;
    RTMenu?: MenuTheme;
    RTTabs?: TabsTheme;
}

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `injectedStyle`.
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
