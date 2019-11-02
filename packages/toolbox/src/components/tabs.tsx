import * as React from "react";
import {TABS} from "react-toolbox/lib/identifiers";
import {Tab as TabType, tabFactory, TabProps, TabTheme} from "react-toolbox/lib/tabs/Tab";
import {TabContent as RTTabContent, TabContentProps, TabContentTheme} from "react-toolbox/lib/tabs/TabContent";
import {Tabs as TabsType, tabsFactory, TabsProps, TabsTheme} from "react-toolbox/lib/tabs/Tabs";

import {fromBem, useTheme} from "@focus4/styling";
import rtTabsTheme from "react-toolbox/components/tabs/theme.css";
const tabsTheme: TabsTheme = rtTabsTheme;
export {tabsTheme};

import {FontIcon} from "./font-icon";
import {rippleFactory} from "./ripple";

const TabContent = React.forwardRef<RTTabContent, TabContentProps>((props, ref) => {
    const theme = useTheme(TABS, tabsTheme as TabContentTheme, props.theme);
    return <RTTabContent ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTTab = tabFactory(rippleFactory({rippleCentered: false}), FontIcon);
export const Tab: React.ForwardRefExoticComponent<TabProps & React.RefAttributes<TabType>> = React.forwardRef(
    (props, ref) => {
        const theme = useTheme(TABS, tabsTheme as TabTheme, props.theme);
        return <RTTab ref={ref} {...props} theme={fromBem(theme)} />;
    }
);

const RTTabs = tabsFactory(Tab, TabContent, FontIcon);
export const Tabs = React.forwardRef<TabsType, TabsProps>((props, ref) => {
    const theme = useTheme(TABS, tabsTheme, props.theme);
    return <RTTabs ref={ref} {...props} theme={fromBem(theme)} />;
});

export {TabProps, TabTheme, TabsProps, TabsTheme};
