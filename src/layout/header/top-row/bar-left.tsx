import * as React from "react";

import {useTheme} from "../../../theme";

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
export function HeaderBarLeft({children, theme: pTheme}: HeaderBarLeftProps) {
    const theme = useTheme("header", styles, pTheme);
    return <div className={`${theme.item} ${theme.left}`}>{children}</div>;
}
