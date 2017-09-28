import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderProps, styles} from "../types";

/** Barre du haut à gauche, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarLeft({children, theme}: HeaderProps) {
    return (
        <div className={`${theme!.item} ${theme!.left}`}>
            {children}
        </div>
    );
}

export default themr("header", styles)(HeaderBarLeft);
