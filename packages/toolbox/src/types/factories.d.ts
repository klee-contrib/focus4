import {ComponentType} from "react";
import {AvatarProps} from "react-toolbox/lib/avatar";
import {IconButtonProps, ButtonProps} from "react-toolbox/lib/button";
import {CheckboxProps} from "react-toolbox/lib/checkbox";
import {ChipProps} from "react-toolbox/lib/chip";
import {FontIconProps} from "react-toolbox/lib/font_icon";
import {InputProps} from "react-toolbox/lib/input";
import {LinkProps} from "react-toolbox/lib/link";
import {
    ListItemProps,
    ListItemContentProps,
    ListItemLayoutProps,
    ListItemActionProps,
    ListItemTextProps,
    ListItemActionsProps
} from "react-toolbox/lib/list";
import {MenuItemProps, MenuProps} from "react-toolbox/lib/menu";
import {ProgressBarProps} from "react-toolbox/lib/progress_bar";
import {RadioButtonProps} from "react-toolbox/lib/radio";
import {TabProps} from "react-toolbox/lib/tabs";
import {TabContentProps} from "react-toolbox/lib/tabs/TabContent";

declare module "react-toolbox/lib/app_bar/AppBar" {
    export function appBarFactory(IconButton: ComponentType<IconButtonProps>): typeof AppBar;
}
declare module "react-toolbox/lib/autocomplete/Autocomplete" {
    export function autocompleteFactory(
        Chip: ComponentType<ChipProps>,
        Input: ComponentType<InputProps>
    ): typeof Autocomplete;
}
declare module "react-toolbox/lib/avatar/Avatar" {
    export function avatarFactory(FontIcon: ComponentType<FontIconProps>): typeof Avatar;
}
declare module "react-toolbox/lib/button/Button" {
    export function buttonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof Button;
}
declare module "react-toolbox/lib/button/BrowseButton" {
    export function browseButtonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof BrowseButton;
}
declare module "react-toolbox/lib/button/IconButton" {
    export function iconButtonFactory(Ripple: any, FontIcon: ComponentType<FontIconProps>): typeof IconButton;
}
declare module "react-toolbox/lib/card/CardTitle" {
    export function cardTitleFactory(Avatar: ComponentType<AvatarProps>): typeof CardTitle;
}
declare module "react-toolbox/lib/checkbox/Checkbox" {
    export function checkboxFactory(Check: any): typeof Checkbox;
}
declare module "react-toolbox/lib/chip/Chip" {
    export function chipFactory(Avatar: ComponentType<AvatarProps>): typeof Chip;
}
declare module "react-toolbox/lib/dropdown/Dropdown" {
    export function dropdownFactory(Input: ComponentType<InputProps>): typeof Dropdown;
}
declare module "react-toolbox/lib/list/List" {
    export function listFactory(ListItem: ComponentType<ListItemProps>): typeof List;
}
declare module "react-toolbox/lib/list/ListCheckbox" {
    export function listCheckboxFactory(
        Checkbox: ComponentType<CheckboxProps>,
        ListItemContent: ComponentType<ListItemContentProps>
    ): typeof ListCheckbox;
}
declare module "react-toolbox/lib/list/ListItem" {
    export function listItemFactory(
        Ripple: any,
        ListItemLayout: ComponentType<ListItemLayoutProps>,
        ListItemContent: ComponentType<ListItemContentProps>
    ): typeof ListItem;
}
declare module "react-toolbox/lib/list/ListItemActions" {
    export function listItemActionsFactory(ListItemAction: ComponentType<ListItemActionProps>): typeof ListItemActions;
}
declare module "react-toolbox/lib/list/ListItemContent" {
    export function listItemContentFactory(ListItemText: ComponentType<ListItemTextProps>): typeof ListItemContent;
}
declare module "react-toolbox/lib/list/ListItemLayout" {
    export function listItemLayoutFactory(
        Avatar: ComponentType<AvatarProps>,
        ListItemContent: ComponentType<ListItemContentProps>,
        ListItemActions: ComponentType<ListItemActionsProps>
    ): typeof ListItemLayout;
}
declare module "react-toolbox/lib/menu/MenuItem" {
    export function menuItemFactory(Ripple: any): typeof MenuItem;
}
declare module "react-toolbox/lib/menu/Menu" {
    export function menuFactory(MenuItem: ComponentType<MenuItemProps>): typeof Menu;
}
declare module "react-toolbox/lib/menu/IconMenu" {
    export function iconMenuFactory(
        IconButton: ComponentType<IconButtonProps>,
        Menu: ComponentType<MenuProps>
    ): typeof IconMenu;
}
declare module "react-toolbox/lib/navigation/Navigation" {
    export function navigationFactory(
        Button: ComponentType<ButtonProps>,
        Link: ComponentType<LinkProps>
    ): typeof Navigation;
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
