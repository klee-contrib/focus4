import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ButtonProps, IconButton, IconButtonTheme} from "react-toolbox/lib/button";

import * as styles from "./__style__/menu.css";
export {styles};

export type MenuStyle = Partial<typeof styles> & IconButtonTheme;

/** Description d'un item de menu. */
export interface MenuItemConfig extends ButtonProps {
    /** La route associée, utilisée comme clé et comparée à la route active. */
    route: string;
    /** Affiche le libellé de l'item. */
    showLabel?: boolean;
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
    const {activeRoute, label, icon, showLabel, onClick, route, theme} = props;
    const buttonProps = {...{icon: "link", shape: showLabel ? null : "icon" as "icon"}, label, icon, onClick};
    return (
        <li className={`${theme!.item} ${route === activeRoute ? theme!.active! : ""}`}>
            <IconButton {...buttonProps} type="button" primary={route === activeRoute} theme={{toggle: theme!.toggle, icon: theme!.icon!, neutral: theme!.neutral!, primary: theme!.primary!}} />
        </li>
    );
});

export default themr("menu", styles)(MenuItem);

// iconLibrary
