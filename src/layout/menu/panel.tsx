import * as React from "react";
import {themr} from "react-css-themr";

import {MenuStyle, styles} from "./item";

/** Props du MenuPanel. */
export interface MenuPanelProps {
    /** A priori le sous-menu. */
    children?: React.ReactChildren;
    /** Handler pour fermer le panel. */
    close: () => void;
    /** Déclage sur l'axe X, pour le positionnement du panel. */
    xOffset: number;
    /** Déclage sur l'axe Y, pour le positionnement du panel. */
    yOffset: number;
    /** Panel ouvert (ou pas). */
    opened: boolean;
    /** CSS. */
    theme?: MenuStyle;
}

/** Panel contenant une sous liste de menu. */
export const MenuPanel = (props: MenuPanelProps) => {
    const {children, close, opened, xOffset, yOffset, theme} = props;
    return (
        <div className={opened && theme!.panelWrapper || ""} onClick={close}>
            <div className={`${theme!.panel} ${theme!.animate} ${opened ? theme!.open : theme!.close}`} style={{top: yOffset, left: xOffset}}>
                {children}
            </div>
        </div>
    );
};

export default themr("menu", styles)(MenuPanel);
