import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderProps, styles} from "../types";

/** Barre du haut à droite, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarRight({children, theme}: HeaderProps) {
    return (
        <div className={`${theme!.item} ${theme!.right}`}>
            {children}
        </div>
    );
}

export default themr("header", styles)(HeaderBarRight);
