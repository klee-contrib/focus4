import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "../__style__/header.css";

/** Props du HeaderBarLeft. */
export interface HeaderBarLeftProps {
    children?: React.ReactNode;
    theme?: {
        item?: string;
        left?: string;
    };
}

/** Barre du haut à gauche, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarLeft({children, theme}: HeaderBarLeftProps) {
    return (
        <div className={`${theme!.item} ${theme!.left}`}>
            {children}
        </div>
    );
}

export default themr("header", styles)(HeaderBarLeft);
