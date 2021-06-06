import classnames from "classnames";
import {MouseEvent, MouseEventHandler, TouchEventHandler, useCallback} from "react";
import {MENU} from "react-toolbox/lib/identifiers";
import {MenuItemTheme} from "react-toolbox/lib/menu/MenuItem";

import {FontIcon} from "../font-icon";
import {rippleFactory} from "../ripple";

import {CSSProp, useTheme} from "@focus4/styling";
import menuTheme from "react-toolbox/components/menu/theme.css";
export {MenuItemTheme};

export interface MenuItemProps {
    /** The text to include in the menu item. Required. */
    caption: string;
    className?: string;
    /** Children to pass through the component. */
    children?: React.ReactNode;
    /** If true, the item will be displayed as disabled and is not selectable. */
    disabled?: boolean;
    /** Icon font key string or Element to display in the right side of the option. */
    icon?: React.ReactNode;
    onClick?: MouseEventHandler<HTMLLIElement>;
    onMouseDown?: MouseEventHandler<HTMLLIElement>;
    onTouchStart?: TouchEventHandler<HTMLLIElement>;
    /** @internal */
    selected?: boolean;
    /** Displays shortcut text on the right side of the caption attribute. */
    shortcut?: string;
    /** Classnames object defining the component style. */
    theme?: CSSProp<MenuItemTheme>;
    /** Passed down to the root element. */
    value?: string;
}

export const MenuItem = rippleFactory({})(function RTMenuItem({
    caption,
    children,
    className = "",
    disabled = false,
    icon,
    onClick,
    onMouseDown,
    onTouchStart,
    selected = false,
    shortcut,
    theme: pTheme
}: MenuItemProps) {
    const theme = useTheme(MENU, menuTheme as MenuItemTheme, pTheme);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLLIElement>) => {
            if (onClick && !disabled) {
                onClick(event);
            }
        },
        [disabled, onClick]
    );

    const _className = classnames(
        theme.menuItem(),
        {
            [theme.selected()]: selected,
            [theme.disabled()]: disabled
        },
        className
    );

    return (
        <li
            data-react-toolbox="menu-item"
            className={_className}
            onClick={handleClick}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {icon ? <FontIcon value={icon} className={theme.icon()} /> : null}
            <span className={theme.caption()}>{caption}</span>
            {shortcut ? <small className={theme.shortcut()}>{shortcut}</small> : null}
            {children}
        </li>
    );
});
