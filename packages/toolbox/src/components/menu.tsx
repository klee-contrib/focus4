import * as React from "react";
import {MENU} from "react-toolbox/lib/identifiers";
import {IconMenu as IconMenuType, iconMenuFactory, IconMenuProps, IconMenuTheme} from "react-toolbox/lib/menu/IconMenu";
import {Menu as MenuType, menuFactory, MenuProps, MenuTheme} from "react-toolbox/lib/menu/Menu";
import {MenuDivider as RTMenuDivider, MenuDividerProps, MenuDividerTheme} from "react-toolbox/lib/menu/MenuDivider";
import {MenuItem as MenuItemType, menuItemFactory, MenuItemProps, MenuItemTheme} from "react-toolbox/lib/menu/MenuItem";

import {useTheme} from "@focus4/styling";
import rtMenuTheme from "react-toolbox/components/menu/theme.css";
const menuTheme: MenuTheme = rtMenuTheme;
export {menuTheme};

import {IconButton} from "./button";
import {rippleFactory} from "./ripple";

const RTMenuItem = menuItemFactory(rippleFactory({}));
export const MenuItem = React.forwardRef<MenuItemType, MenuItemProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as MenuItemTheme, props.theme);
    return <RTMenuItem ref={ref} {...props} theme={theme} />;
});

const RTMenu = menuFactory(MenuItem);
export const Menu = React.forwardRef<MenuType, MenuProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme, props.theme);
    return <RTMenu ref={ref} {...props} theme={theme} />;
});

const RTIconMenu = iconMenuFactory(IconButton, Menu);
export const IconMenu = React.forwardRef<IconMenuType, IconMenuProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as IconMenuTheme, props.theme);
    return <RTIconMenu ref={ref} {...props} theme={theme} />;
});

export const MenuDivider = React.forwardRef<RTMenuDivider, MenuDividerProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as MenuDividerTheme, props.theme);
    return <RTMenuDivider ref={ref} {...props} theme={theme} />;
});

export {MenuItemProps, MenuItemTheme, MenuProps, MenuTheme, IconMenuProps, IconMenuTheme};
