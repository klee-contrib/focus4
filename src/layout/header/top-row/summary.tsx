import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderProps, styles} from "../types";

/** Summary, doit être affiché dans `HeaderTopRow` et est masqué si le header est replié. */
export function HeaderSummary({children, theme}: HeaderProps) {
    return (
        <div className={`${theme!.item} ${theme!.middle}`}>
            {children}
        </div>
    );
}

export default themr("header", styles)(HeaderSummary);
