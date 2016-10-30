import {omit} from "lodash";
import * as React from "react";

import {MessageCenter as DefaultMessageCenter} from "../../message";

import {ErrorCenter as DefaultErrorCenter, ErrorCenterStyle} from "./error-center";
import {Header, HeaderStyle} from "./header";

import {FieldStyle} from "../../entity";
import {ActionBarStyle, LineStyle, ListSelectionStyle, ListTimelineStyle, TopicDisplayerStyle} from "../../list";
import {MessageCenterStyle} from "../../message";
import {LoadingBarStyle} from "../../network";
import {AdvancedSearchStyle, FacetBoxStyle, FacetStyle, GroupComponentStyle, ListSummaryStyle} from "../../search";
import {injectStyle, StyleProvider} from "../../theming";

import styles from "./style/index.css";
export type LayoutStyle = typeof styles;

export {DefaultErrorCenter as ErrorCenter}
export {Header, HeaderStyle};

export interface LayoutProps {
    AppHeader?: ReactComponent<any>;
    children?: React.ReactChildren;
    classNames?: LayoutStyle;
    ErrorCenter?: ReactComponent<any> | undefined;
    Footer?: ReactComponent<any>;
    LoadingBar?: ReactComponent<any>;
    MenuLeft?: ReactComponent<any>;
    MessageCenter?: ReactComponent<any>;
    LoadingStatusBar?: ReactComponent<any>;
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
    LoadingStatusBar,
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
    errorCenter?: ErrorCenterStyle;
    facet?: FacetStyle;
    facetBox?: FacetBoxStyle;
    field?: FieldStyle;
    form?: string;
    groupComponent?: GroupComponentStyle;
    header?: HeaderStyle;
    layout?: LayoutStyle;
    line?: LineStyle;
    listSelection?: ListSelectionStyle;
    listSummary?: ListSummaryStyle;
    listTimeline?: ListTimelineStyle;
    loadingBar?: LoadingBarStyle;
    messageCenter?: MessageCenterStyle;
    topicDisplayer?: TopicDisplayerStyle;
}

export function Layout(props: LayoutProps & {classNames?: LayoutStyleProviderProps}) {
    return (
        <StyleProvider {...props.classNames}>
            <LayoutBase {...omit(props, "classNames")}>
                {props.children}
            </LayoutBase>
        </StyleProvider>
    );
}
