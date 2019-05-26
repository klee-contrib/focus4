import {AvatarProps} from "react-toolbox/lib/avatar";
import {Button, BrowseButton, IconButton, IconButtonProps, ButtonProps} from "react-toolbox/lib/button";
import {Checkbox} from "react-toolbox/lib/checkbox";
import {ChipProps} from "react-toolbox/lib/chip";
import {Dropdown} from "react-toolbox/lib/dropdown";
import {FontIconProps} from "react-toolbox/lib/font_icon";
import {InputProps} from "react-toolbox/lib/input";
import {MenuItem, MenuItemProps, Menu, MenuProps} from "react-toolbox/lib/menu";
import {RadioButton, RadioButtonProps, RadioGroup} from "react-toolbox/lib/radio";
import {Snackbar} from "react-toolbox/lib/snackbar";
import {Switch} from "react-toolbox/lib/switch";

declare module "react-toolbox/lib/autocomplete/Autocomplete" {
    export function autocompleteFactory(
        Chip: React.ComponentType<ChipProps>,
        Input: React.ComponentType<InputProps>
    ): typeof Autocomplete;
}
declare module "react-toolbox/lib/avatar/Avatar" {
    export function avatarFactory(FontIcon: React.ComponentType<FontIconProps>): typeof Avatar;
}
declare module "react-toolbox/lib/button/Button" {
    export function buttonFactory(Ripple: any, FontIcon: React.ComponentType<FontIconProps>): typeof Button;
}
declare module "react-toolbox/lib/button/BrowseButton" {
    export function browseButtonFactory(Ripple: any, FontIcon: React.ComponentType<FontIconProps>): typeof BrowseButton;
}
declare module "react-toolbox/lib/button/IconButton" {
    export function iconButtonFactory(Ripple: any, FontIcon: React.ComponentType<FontIconProps>): typeof IconButton;
}
declare module "react-toolbox/lib/checkbox/Checkbox" {
    export function checkboxFactory(Check: any): typeof Checkbox;
}
declare module "react-toolbox/lib/chip/Chip" {
    export function chipFactory(Avatar: React.ComponentType<AvatarProps>): typeof Chip;
}
declare module "react-toolbox/lib/dropdown/Dropdown" {
    export function dropdownFactory(Input: React.ComponentType<InputProps>): typeof Dropdown;
}
declare module "react-toolbox/lib/input/Input" {
    export function inputFactory(FontIcon: React.ComponentType<FontIconProps>): typeof Input;
}
declare module "react-toolbox/lib/menu/MenuItem" {
    export function menuItemFactory(Ripple: any): typeof MenuItem;
}
declare module "react-toolbox/lib/menu/Menu" {
    export function menuFactory(MenuItem: React.ComponentType<MenuItemProps>): typeof Menu;
}
declare module "react-toolbox/lib/menu/IconMenu" {
    export function iconMenuFactory(
        IconButton: React.ComponentType<IconButtonProps>,
        Menu: React.ComponentType<MenuProps>
    ): typeof IconMenu;
}
declare module "react-toolbox/lib/radio/RadioButton" {
    export function radioButtonFactory(Radio: any): typeof RadioButton;
}
declare module "react-toolbox/lib/radio/RadioGroup" {
    export function radioGroupFactory(RadioButton: React.ComponentType<RadioButtonProps>): typeof RadioGroup;
}
declare module "react-toolbox/lib/snackbar/Snackbar" {
    export function snackbarFactory(Button: React.ComponentType<ButtonProps>): typeof Snackbar;
}
declare module "react-toolbox/lib/switch/Switch" {
    export function switchFactory(Thumb: any): typeof Switch;
}
