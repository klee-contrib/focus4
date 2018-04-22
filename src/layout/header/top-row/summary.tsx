import * as React from "react";

import {themr} from "../../../theme";

import * as styles from "../__style__/header.css";
const Theme = themr("header", styles);

/** Props du HeaderSummary. */
export interface HeaderSummaryProps {
    children?: React.ReactNode;
    theme?: {
        item?: string;
        middle?: string;
    };
}

/** Summary, doit être affiché dans `HeaderTopRow` et est masqué si le header est replié. */
export function HeaderSummary({children, theme: pTheme}: HeaderSummaryProps) {
    return (
        <Theme theme={pTheme}>
            {theme =>
                <div className={`${theme.item} ${theme.middle}`}>
                    {children}
                </div>
            }
        </Theme>
    );
}
