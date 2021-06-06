import {ComponentType} from "react";
import {TabProps} from "react-toolbox/lib/tabs";
import {TabContentProps} from "react-toolbox/lib/tabs/TabContent";
import {FontIconProps} from "../components/font-icon";

declare module "react-toolbox/lib/button/Button" {
    export function buttonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof Button;
}
declare module "react-toolbox/lib/button/IconButton" {
    export function iconButtonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof IconButton;
}
declare module "react-toolbox/lib/tabs/Tab" {
    export function tabFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof Tab;
}
declare module "react-toolbox/lib/tabs/Tabs" {
    export function tabsFactory(
        Tab: ComponentType<TabProps>,
        TabContent: ComponentType<TabContentProps>,
        FontIcon: ComponentType<FontIconProps>
    ): typeof Tabs;
}
