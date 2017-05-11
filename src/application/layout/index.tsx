import {autobind} from "core-decorators";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {ThemeProvider, themr} from "react-css-themr";

import {FieldStyle} from "../../entity";
import {ContextualActionsStyle, LineStyle, ListStyle, ListWrapperStyle} from "../../list";
import {MessageCenter as DefaultMessageCenter} from "../../message";
import {MessageCenterStyle} from "../../message";
import {LoadingBarStyle} from "../../network";
import {ActionBarStyle, AdvancedSearchStyle, FacetBoxStyle, FacetStyle, GroupStyle, SearchBarStyle, SummaryStyle} from "../../search";

import {ErrorCenter as DefaultErrorCenter, ErrorCenterStyle} from "./error-center";
import {Header, HeaderStyle} from "./header";
import {Menu, MenuItemConfig, MenuStyle} from "./menu";
import {Popin, PopinStyle} from "./popin";
import {PopinConfirmation} from "./popin-confirmation";

import styles from "./__style__/layout.css";

export type LayoutStyle = Partial<typeof styles>;

export {DefaultErrorCenter as ErrorCenter, Header, HeaderStyle, Menu, MenuItemConfig, Popin, PopinConfirmation};

/** Props du Layout, comportant les différents composants injectables. */
export interface LayoutProps {
    AppHeader?: ReactComponent<any>;
    children?: React.ReactChildren;
    DevTools?: ReactComponent<any>;
    ErrorCenter?: ReactComponent<any> | null;
    Footer?: ReactComponent<any>;
    LoadingBar?: ReactComponent<any>;
    MenuLeft?: ReactComponent<any>;
    MessageCenter?: ReactComponent<any>;
    OtherRootComponent?: ReactComponent<any>;
    theme?: LayoutStyle;
}

/** Composant de Layout sans le provider de style. */
@themr("layout", styles)
@autobind
@observer
class LayoutBase extends React.Component<LayoutProps, void> {

    @observable menuWidth = 0;

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
                    <footer>
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
    messageCenter?: MessageCenterStyle;
    popin?: PopinStyle;
    searchBar?: SearchBarStyle;
    summary?: SummaryStyle;
}

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `injectedStyle`.
 */
export function Layout(props: LayoutProps & {injectedStyle?: LayoutStyleProviderProps}) {
    return (
        <ThemeProvider theme={props.injectedStyle || {}}>
            <LayoutBase {...omit(props, "injectedStyle")}>
                {props.children}
            </LayoutBase>
        </ThemeProvider>
    );
}
