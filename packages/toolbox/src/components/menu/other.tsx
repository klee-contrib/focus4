import {forwardRef} from "react";
import {MENU} from "react-toolbox/lib/identifiers";
import {Menu as MenuType, menuFactory, MenuProps as RTMenuProps, MenuTheme} from "react-toolbox/lib/menu/Menu";
import {
    MenuDivider as RTMenuDivider,
    MenuDividerProps as RTMenuDividerProps,
    MenuDividerTheme
} from "react-toolbox/lib/menu/MenuDivider";
import {
    MenuItem as MenuItemType,
    menuItemFactory,
    MenuItemProps as RTMenuItemProps,
    MenuItemTheme
} from "react-toolbox/lib/menu/MenuItem";

import {rippleFactory} from "../ripple";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtMenuTheme from "react-toolbox/components/menu/theme.css";
const menuTheme: MenuTheme = rtMenuTheme;
export {menuTheme, MenuItemTheme, MenuTheme};

const RTMenuItem = menuItemFactory(rippleFactory({}));
export type MenuItemProps = Omit<RTMenuItemProps, "theme"> & {theme?: CSSProp<MenuItemTheme>};
export const MenuItem = forwardRef<MenuItemType, MenuItemProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as MenuItemTheme, props.theme);
    return <RTMenuItem ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTMenu = menuFactory(MenuItem as any);
export type MenuProps = Omit<RTMenuProps, "theme"> & {theme?: CSSProp<MenuTheme>};
export const Menu = forwardRef<MenuType, MenuProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme, props.theme);
    return <RTMenu ref={ref} {...props} theme={fromBem(theme)} />;
});

export type MenuDividerProps = Omit<RTMenuDividerProps, "theme"> & {theme?: CSSProp<MenuDividerTheme>};
export const MenuDivider = forwardRef<RTMenuDivider, MenuDividerProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as MenuDividerTheme, props.theme);
    return <RTMenuDivider ref={ref} {...props} theme={fromBem(theme)} />;
});
