import {omit} from "lodash";
import * as React from "react";

import {MessageCenter as DefaultMessageCenter} from "../../message";

import {ErrorCenter as DefaultErrorCenter, ErrorCenterStyle} from "./error-center";
import {Header, HeaderStyle} from "./header";

import {FieldStyle} from "../../entity";
import {ContextualActionsStyle, LineStyle, ListStyle, ListWrapperStyle} from "../../list";
import {MessageCenterStyle} from "../../message";
import {LoadingBarStyle} from "../../network";
import {ActionBarStyle, AdvancedSearchStyle, FacetBoxStyle, FacetStyle, GroupStyle, SearchBarStyle, SummaryStyle} from "../../search";
import {injectStyle, StyleProvider} from "../../theming";

import styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;

export {DefaultErrorCenter as ErrorCenter};
export {Header, HeaderStyle};

export interface LayoutProps {
    AppHeader?: ReactComponent<any>;
    children?: React.ReactChildren;
    classNames?: LayoutStyle;
    ErrorCenter?: ReactComponent<any> | null;
    Footer?: ReactComponent<any>;
    LoadingBar?: ReactComponent<any>;
    MenuLeft?: ReactComponent<any>;
    MessageCenter?: ReactComponent<any>;
    DevTools?: ReactComponent<any>;
    OtherRootComponent?: ReactComponent<any>;
}

const LayoutBase = injectStyle("layout", ({
    AppHeader = Header,
    children,
    classNames,
    ErrorCenter = DefaultErrorCenter,
    Footer,
    LoadingBar,
    MenuLeft,
    MessageCenter = DefaultMessageCenter,
    DevTools,
    OtherRootComponent
}: LayoutProps) => (
    <div className={`${styles.layout} ${classNames!.layout || ""} ${MenuLeft ? `${styles.hasMenu} ${classNames!.hasMenu || ""}` : ""}`}>
        {LoadingBar ? <LoadingBar /> : null}
        <MessageCenter />
        {ErrorCenter ? <ErrorCenter /> : null}
        <AppHeader />
        {MenuLeft ? <MenuLeft /> : null}
        <div className={`${styles.content} ${classNames!.content || ""}`}>
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
));

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
    line?: LineStyle;
    list?: ListStyle;
    listWrapper?: ListWrapperStyle;
    summary?: SummaryStyle;
    searchBar?: SearchBarStyle;
    loadingBar?: LoadingBarStyle;
    messageCenter?: MessageCenterStyle;
}

export function Layout(props: LayoutProps & {injectedStyle?: LayoutStyleProviderProps}) {
    return (
        <StyleProvider {...props.injectedStyle}>
            <LayoutBase {...omit(props, "injectedStyle")}>
                {props.children}
            </LayoutBase>
        </StyleProvider>
    );
}
