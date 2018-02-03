import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "../__style__/header.css";

/** Props du HeaderSummary. */
export interface HeaderSummaryProps {
    children?: React.ReactNode;
    theme?: {
        item?: string;
        middle?: string;
    };
}

/** Summary, doit être affiché dans `HeaderTopRow` et est masqué si le header est replié. */
export function HeaderSummary({children, theme}: HeaderSummaryProps) {
    return (
        <div className={`${theme!.item} ${theme!.middle}`}>
            {children}
        </div>
    );
}

export default themr("header", styles)(HeaderSummary);
