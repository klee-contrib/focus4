import * as React from "react";

import {MessageCenter as DefaultMessageCenter} from "../../message";

import {ErrorCenter as DefaultErrorCenter} from "./error-center";
import {Header} from "./header";

import {content, hasMenu, layout} from "./style/index.css";

export {DefaultErrorCenter as ErrorCenter}
export {Header};

export function Layout({
    AppHeader = Header,
    children,
    ErrorCenter = DefaultErrorCenter,
    Footer,
    LoadingBar,
    MenuLeft,
    MessageCenter = DefaultMessageCenter,
    LoadingStatusBar,
    DevTools,
    OtherRootComponent
}: {
    AppHeader?: ReactComponent<any>,
    children?: React.ReactChildren
    ErrorCenter?: ReactComponent<any> | undefined,
    Footer?: ReactComponent<any>,
    LoadingBar?: ReactComponent<any>,
    MenuLeft?: ReactComponent<any>,
    MessageCenter?: ReactComponent<any>,
    LoadingStatusBar?: ReactComponent<any>,
    DevTools?: ReactComponent<any>,
    OtherRootComponent?: ReactComponent<any>
}) {
    return (
        <div className={`${layout} ${MenuLeft ? hasMenu : ""}`}>
            {LoadingBar ? <LoadingBar /> : null}
            <MessageCenter />
            {ErrorCenter ? <ErrorCenter /> : null}
            <AppHeader />
            {MenuLeft ? <MenuLeft /> : null}
            <div className={content}>
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
