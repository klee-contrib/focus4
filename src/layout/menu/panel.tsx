import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "./__style__/menu.css";

export interface MainMenuPanelStyle {
    animate?: string;
    close?: string;
    open?: string;
    panel?: string;
    panelWrapper?: string;
}

/** Props du MenuPanel. */
export interface MenuPanelProps {
    /** A priori le sous-menu. */
    children?: React.ReactChild;
    /** Handler pour fermer le panel. */
    close: () => void;
    /** Déclage sur l'axe X, pour le positionnement du panel. */
    xOffset: number;
    /** Déclage sur l'axe Y, pour le positionnement du panel. */
    yOffset: number;
    /** Panel ouvert (ou pas). */
    opened: boolean;
    /** CSS. */
    theme?: MainMenuPanelStyle;
}

/** Panel contenant une sous liste de menu. */
export const MainMenuPanel = (props: MenuPanelProps) => {
    const {children, close, opened, xOffset, yOffset, theme} = props;
    return (
        <div className={(opened && theme!.panelWrapper) || ""} onClick={close}>
            <div
                className={`${theme!.panel} ${theme!.animate} ${opened ? theme!.open : theme!.close}`}
                style={{top: yOffset, left: xOffset}}
            >
                {children}
            </div>
        </div>
    );
};

export default themr("mainMenu", styles)(MainMenuPanel);
