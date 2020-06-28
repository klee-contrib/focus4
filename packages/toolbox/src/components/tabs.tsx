import * as React from "react";
import {TABS} from "react-toolbox/lib/identifiers";
import {Tab as TabType, tabFactory, TabProps as RTTabProps, TabTheme} from "react-toolbox/lib/tabs/Tab";
import {
    TabContent as RTTabContent,
    TabContentProps as RTTabContentProps,
    TabContentTheme
} from "react-toolbox/lib/tabs/TabContent";
import {Tabs as TabsType, tabsFactory, TabsProps as RTTabsProps, TabsTheme} from "react-toolbox/lib/tabs/Tabs";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtTabsTheme from "react-toolbox/components/tabs/theme.css";
const tabsTheme: TabsTheme = rtTabsTheme;
export {tabsTheme};

import {FontIcon} from "./font-icon";
import {rippleFactory} from "./ripple";

type TabContentProps = Omit<RTTabContentProps, "theme"> & {theme?: CSSProp<TabContentTheme>};
const TabContent = React.forwardRef<RTTabContent, TabContentProps>((props, ref) => {
    const theme = useTheme(TABS, tabsTheme as TabContentTheme, props.theme);
    return <RTTabContent ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTTab = tabFactory(rippleFactory({rippleCentered: false}), FontIcon);
type TabProps = Omit<RTTabProps, "theme"> & {theme?: CSSProp<TabTheme>};
export const Tab: React.ForwardRefExoticComponent<TabProps & React.RefAttributes<TabType>> = React.forwardRef(
    (props, ref) => {
        const theme = useTheme(TABS, tabsTheme as TabTheme, props.theme);
        return <RTTab ref={ref} {...props} theme={fromBem(theme)} />;
    }
);

const RTTabs = tabsFactory(Tab as any, TabContent as any, FontIcon);
type TabsProps = Omit<RTTabsProps, "theme"> & {theme?: CSSProp<TabsTheme>};
export const Tabs = React.forwardRef<TabsType, TabsProps>((props, ref) => {
    const theme = useTheme(TABS, tabsTheme, props.theme);
    return <RTTabs ref={ref} {...props} theme={fromBem(theme)} />;
});

export {TabProps, TabTheme, TabsProps, TabsTheme};
