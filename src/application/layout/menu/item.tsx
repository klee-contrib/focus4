import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {Button, ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import * as styles from "./__style__/menu.css";
export {styles};

export type MenuStyle = Partial<typeof styles> & IconButtonTheme;

/** Description d'un item de menu. */
export interface MenuItemConfig extends ButtonProps {
    /** La route associée, utilisée comme clé et comparée à la route active. */
    route: string;
    /** Sous-menu. */
    subMenus?: MenuItemConfig[];
}

/** Props du MenuItem. */
export interface MenuItemProps extends MenuItemConfig {
    /** Route active. */
    activeRoute?: string;
    /** CSS. */
    theme?: MenuStyle;
}

/** Elément de menu. */
export const MenuItem = observer<MenuItemProps>(props => {
    const {activeRoute, label, icon, onClick, route, theme, subMenus, ...otherProps} = props;
    return (
        <li className={`${theme!.item} ${route === activeRoute ? theme!.active! : ""}`}>
            {label ?
                <Button
                    {...otherProps}
                    icon={icon}
                    label={label}
                    onClick={onClick}
                    primary={route === activeRoute}
                    theme={{
                        button: theme!.button!,
                        icon: theme!.icon!,
                        neutral: theme!.neutral!,
                        primary: theme!.primary!
                    }}
                />
            :
                <IconButton
                    {...otherProps}
                    icon={icon}
                    onClick={onClick}
                    primary={route === activeRoute}
                    theme={{
                        toggle: theme!.toggle,
                        icon: theme!.icon!,
                        neutral: theme!.neutral!,
                        primary: theme!.primary!,
                        rippleWrapper: theme!.rippleWrapper!
                    }}
                />
            }
        </li>
    );
});

export default themr("menu", styles)(MenuItem);
