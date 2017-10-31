import * as React from "react";
import {themr} from "react-css-themr";

import styles from "../__style__/header.css";

/** Props du HeaderBarRight. */
export interface HeaderBarRightProps {
    children?: React.ReactNode;
    theme?: {
        item?: string;
        right?: string;
    };
}

/** Barre du haut à droite, doit être affiché dans `HeaderTopRow`. */
export function HeaderBarRight({children, theme}: HeaderBarRightProps) {
    return (
        <div className={`${theme!.item} ${theme!.right}`}>
            {children}
        </div>
    );
}

export default themr("header", styles)(HeaderBarRight);
