import {ComponentType} from "react";
import {RadioButtonProps} from "react-toolbox/lib/radio";
import {TabProps} from "react-toolbox/lib/tabs";
import {TabContentProps} from "react-toolbox/lib/tabs/TabContent";
import {FontIconProps} from "../components/font-icon";

declare module "react-toolbox/lib/button/Button" {
    export function buttonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof Button;
}
declare module "react-toolbox/lib/button/IconButton" {
    export function iconButtonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof IconButton;
}
declare module "react-toolbox/lib/checkbox/Checkbox" {
    export function checkboxFactory(Check: any): typeof Checkbox;
}
declare module "react-toolbox/lib/radio/RadioButton" {
    export function radioButtonFactory(Radio: any): typeof RadioButton;
}
declare module "react-toolbox/lib/radio/RadioGroup" {
    export function radioGroupFactory(RadioButton: ComponentType<RadioButtonProps>): typeof RadioGroup;
}
declare module "react-toolbox/lib/switch/Switch" {
    export function switchFactory(Thumb: any): typeof Switch;
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
