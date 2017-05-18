import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button, {ButtonProps} from "focus-components/button";

import * as styles from "./__style__/menu.css";
export {styles};

export type MenuStyle = Partial<typeof styles>;

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
export const MenuItem = themr("menu", styles)(observer<MenuItemProps>(props => {
    const {activeRoute, label, icon, iconLibrary, showLabel, onClick, route, theme} = props;
    const buttonProps = {...{icon: "link", shape: showLabel ? null : "icon" as "icon"}, label, icon, iconLibrary, onClick};
    return (
        <li className={`${theme!.item} ${route === activeRoute ? theme!.active! : ""}`}>
            <Button {...buttonProps} type="button" color={route === activeRoute ? "primary" : undefined} />
        </li>
    );
}));
