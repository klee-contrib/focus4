import classnames from "classnames";
import {ReactNode} from "react";
import {TABS} from "react-toolbox/lib/identifiers";
import {TabContentTheme} from "react-toolbox/lib/tabs/TabContent";

import {CSSProp, useTheme} from "@focus4/styling";
import rtTabsTheme from "react-toolbox/components/tabs/theme.css";
const tabsTheme: TabContentTheme = rtTabsTheme;

export interface TabContentProps {
    active?: boolean;
    className?: string;
    children?: ReactNode;
    hidden?: boolean;
    /** @internal */
    tabIndex?: number;
    theme?: CSSProp<TabContentTheme>;
}

export function TabContent({active = false, children, className = "", hidden = true, theme: pTheme}: TabContentProps) {
    const theme = useTheme(TABS, tabsTheme, pTheme);
    const _className = classnames(theme.tab(), {[theme.active()]: active}, className);
    return (
        <section className={_className} role="tabpanel" aria-expanded={hidden}>
            {children}
        </section>
    );
}
