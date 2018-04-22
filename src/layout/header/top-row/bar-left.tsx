import * as React from "react";

import {themr} from "../../../theme";

import * as styles from "../__style__/header.css";
const Theme = themr("header", styles);

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
    return (
        <Theme theme={pTheme}>
            {theme =>
                <div className={`${theme.item} ${theme.left}`}>
                    {children}
                </div>
            }
        </Theme>
    );
}
