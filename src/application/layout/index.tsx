import * as React from "react";

import {MessageCenter as DefaultMessageCenter} from "../../message";

import {ErrorCenter as DefaultErrorCenter} from "./error-center";
import {Header} from "./header";

import {injectStyle} from "../../theming";

import styles from "./style/index.css";
export type LayoutStyles = typeof styles;

export {DefaultErrorCenter as ErrorCenter}
export {Header};

export const Layout = injectStyle("layout", ({
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
}: {
    AppHeader?: ReactComponent<any>;
    children?: React.ReactChildren;
    classNames?: LayoutStyles;
    ErrorCenter?: ReactComponent<any> | undefined;
    Footer?: ReactComponent<any>;
    LoadingBar?: ReactComponent<any>;
    MenuLeft?: ReactComponent<any>;
    MessageCenter?: ReactComponent<any>;
    LoadingStatusBar?: ReactComponent<any>;
    DevTools?: ReactComponent<any>;
    OtherRootComponent?: ReactComponent<any>;
}) => (
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
