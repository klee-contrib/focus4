import classnames from "classnames";
import {ReactNode, SyntheticEvent, useCallback, useEffect, useState} from "react";
import {MENU} from "react-toolbox/lib/identifiers";
import {IconMenuTheme} from "react-toolbox/lib/menu/IconMenu";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";

import {IconButton} from "../button";
import {Menu, MenuTheme, menuTheme} from "./menu";
export {IconMenuTheme};

export interface IconMenuProps {
    /** If true, the inner Menu component will be active. */
    active?: boolean;
    /** Class for the root node. */
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** Icon font key string or Element to display the opener icon. */
    icon?: ReactNode;
    /** If true, the icon will show a ripple when is clicked. */
    iconRipple?: boolean;
    /** If true, the neutral colors are inverted. Useful if the icon is over a dark background. */
    inverse?: boolean;
    /** Transferred to the Menu component. */
    menuRipple?: boolean;
    /** Callback that will be called when the menu is being clicked. */
    onClick?: (event: SyntheticEvent) => void;
    /** Callback that will be called when the menu is being hidden. */
    onHide?: () => void;
    /** Callback that will be invoked when a menu item is selected. */
    onSelect?: (value: any) => void;
    /** Callback that will be invoked when the menu is being shown. */
    onShow?: () => void;
    /** Determines the position of the menu. This property is transferred to the inner Menu component. */
    position?: "auto" | "static" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
    /** If true, the menu will keep a value to highlight the active child item. */
    selectable?: boolean;
    /** Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted. */
    selected?: any;
    /** Classnames object defining the component style. */
    theme?: CSSProp<IconMenuTheme>;
}

export function IconMenu({
    active: pActive = false,
    className = "",
    children,
    inverse,
    icon = "more_vert",
    iconRipple = true,
    menuRipple = true,
    onClick,
    onHide,
    onSelect,
    onShow,
    position = "auto",
    selected,
    selectable = false,
    theme: pTheme
}: IconMenuProps) {
    const theme = useTheme(MENU, menuTheme as IconMenuTheme, pTheme);

    const [active, setActive] = useState(pActive);
    useEffect(() => setActive(pActive), [pActive]);

    const clickHandler = useCallback(
        (e: SyntheticEvent) => {
            e.stopPropagation();
            setActive(o => !o);
            onClick?.(e);
        },
        [onClick]
    );

    const hideHandler = useCallback(() => {
        setActive(false);
        onHide?.();
    }, [onHide]);

    return (
        <div className={classnames(theme.iconMenu(), className)}>
            <IconButton
                className={theme.icon()}
                icon={icon}
                inverse={inverse}
                onClick={clickHandler}
                ripple={iconRipple}
            />
            <Menu
                active={active}
                onHide={hideHandler}
                onSelect={onSelect}
                onShow={onShow}
                position={position}
                ripple={menuRipple}
                selectable={selectable}
                selected={selected}
                theme={fromBem(theme) as MenuTheme}
            >
                {children}
            </Menu>
        </div>
    );
}
