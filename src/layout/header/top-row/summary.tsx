import * as React from "react";

import {useTheme} from "../../../theme";

import * as styles from "../__style__/header.css";

/** Props du HeaderSummary. */
export interface HeaderSummaryProps {
    children?: React.ReactNode;
    theme?: {
        item?: string;
        middle?: string;
    };
}

export function HeaderSummary({children, theme: pTheme}: HeaderSummaryProps) {
    const theme = useTheme("header", styles, pTheme);
    return <div className={`${theme.item} ${theme.middle}`}>{children}</div>;
}
