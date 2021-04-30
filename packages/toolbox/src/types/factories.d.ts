import {ComponentType} from "react";
import {AvatarProps} from "react-toolbox/lib/avatar";
import {ButtonProps} from "react-toolbox/lib/button";
import {FontIconProps} from "react-toolbox/lib/font_icon";
import {InputProps} from "react-toolbox/lib/input";
import {MenuItemProps} from "react-toolbox/lib/menu";
import {ProgressBarProps} from "react-toolbox/lib/progress_bar";
import {RadioButtonProps} from "react-toolbox/lib/radio";
import {TabProps} from "react-toolbox/lib/tabs";
import {TabContentProps} from "react-toolbox/lib/tabs/TabContent";

declare module "react-toolbox/lib/avatar/Avatar" {
    export function avatarFactory(FontIcon: ComponentType<FontIconProps>): typeof Avatar;
}
declare module "react-toolbox/lib/button/Button" {
    export function buttonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof Button;
}
declare module "react-toolbox/lib/button/IconButton" {
    export function iconButtonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof IconButton;
}
declare module "react-toolbox/lib/checkbox/Checkbox" {
    export function checkboxFactory(Check: any): typeof Checkbox;
}
declare module "react-toolbox/lib/chip/Chip" {
    export function chipFactory(Avatar: ComponentType<AvatarProps>): typeof Chip;
}
declare module "react-toolbox/lib/menu/MenuItem" {
    export function menuItemFactory(Ripple: any): typeof MenuItem;
}
declare module "react-toolbox/lib/menu/Menu" {
    export function menuFactory(MenuItem: ComponentType<MenuItemProps>): typeof Menu;
}
declare module "react-toolbox/lib/radio/RadioButton" {
    export function radioButtonFactory(Radio: any): typeof RadioButton;
}
declare module "react-toolbox/lib/radio/RadioGroup" {
    export function radioGroupFactory(RadioButton: ComponentType<RadioButtonProps>): typeof RadioGroup;
}
declare module "react-toolbox/lib/slider/Slider" {
    export function sliderFactory(
        ProgressBar: ComponentType<ProgressBarProps>,
        Input: ComponentType<InputProps>
    ): typeof Slider;
}
declare module "react-toolbox/lib/snackbar/Snackbar" {
    export function snackbarFactory(Button: ComponentType<ButtonProps>): typeof Snackbar;
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
